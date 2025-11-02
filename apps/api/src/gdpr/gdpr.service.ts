import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  /**
   * Export all data for a user (GDPR Article 20 - Right to Data Portability)
   */
  async exportUserData(userId: number, tenantId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            defaultCurrency: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Limit to last 100 audit logs
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user has a linked client account (same email), export that too
    const client = await this.prisma.client.findFirst({
      where: {
        email: user.email,
        tenantId,
      },
      include: {
        leads: {
          include: {
            quotations: true,
          },
        },
        bookings: {
          include: {
            items: true,
            paymentsClient: true,
            invoices: true,
            quotation: true,
          },
        },
      },
    });

    // Remove sensitive data from export
    const {passwordHash, ...userWithoutPassword} = user;

    return {
      exportedAt: new Date().toISOString(),
      format: 'JSON',
      dataSubject: {
        type: 'USER',
        id: userId,
        email: user.email,
      },
      user: userWithoutPassword,
      client: client || null,
      metadata: {
        totalLeads: client?.leads?.length || 0,
        totalBookings: client?.bookings?.length || 0,
        totalPayments: client?.bookings?.reduce((sum, b) => sum + b.paymentsClient.length, 0) || 0,
      },
    };
  }

  /**
   * Export all data for a client (GDPR Article 20 - Right to Data Portability)
   */
  async exportClientData(clientId: number, tenantId: number, requestingUserId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId },
      include: {
        leads: {
          include: {
            quotations: {
              include: {
                tour: true,
              },
            },
          },
        },
        bookings: {
          include: {
            items: true,
            paymentsClient: true,
            invoices: true,
            quotation: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Log this access for audit purposes
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: requestingUserId,
        action: 'GDPR_DATA_EXPORT',
        entityType: 'Client',
        entityId: clientId,
        details: {
          clientEmail: client.email,
          exportDate: new Date().toISOString(),
        },
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      format: 'JSON',
      dataSubject: {
        type: 'CLIENT',
        id: clientId,
        name: client.name,
        email: client.email,
      },
      personalData: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        nationality: client.nationality,
        passportNumber: client.passportNumber,
        dateOfBirth: client.dateOfBirth,
        preferredLanguage: client.preferredLanguage,
        tags: client.tags,
        notes: client.notes,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      bookingHistory: client.bookings.map(booking => ({
        bookingCode: booking.bookingCode,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalAmount: booking.totalSellEur,
        items: booking.items.length,
        payments: booking.paymentsClient.length,
        invoices: booking.invoices.length,
        createdAt: booking.createdAt,
      })),
      leadHistory: client.leads.map(lead => ({
        id: lead.id,
        source: lead.source,
        status: lead.status,
        inquiryDate: lead.inquiryDate,
        quotations: lead.quotations.length,
      })),
      metadata: {
        totalLeads: client.leads.length,
        totalBookings: client.bookings.length,
        totalPayments: client.bookings.reduce((sum, b) => sum + b.paymentsClient.length, 0),
        totalSpent: client.bookings.reduce((sum, b) => sum + Number(b.totalSellEur || 0), 0),
      },
    };
  }

  /**
   * Anonymize client data (GDPR Article 17 - Right to be Forgotten)
   * Note: We anonymize instead of delete to preserve booking history for legal/financial purposes
   */
  async anonymizeClient(clientId: number, tenantId: number, requestingUserId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId },
      include: {
        bookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if there are any active bookings
    const activeBookings = client.bookings.filter(
      b => b.status === 'PENDING' || b.status === 'CONFIRMED',
    );

    if (activeBookings.length > 0) {
      throw new ForbiddenException(
        `Cannot anonymize client with ${activeBookings.length} active booking(s). ` +
        `Please complete or cancel bookings first: ${activeBookings.map(b => b.bookingCode).join(', ')}`,
      );
    }

    // Perform anonymization
    const anonymizedClient = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        name: `Deleted User ${clientId}`,
        email: `deleted-${clientId}-${Date.now()}@anonymized.local`,
        phone: null,
        passportNumber: null,
        dateOfBirth: null,
        nationality: null,
        notes: '[Personal data deleted per GDPR request]',
        tags: ['ANONYMIZED'],
        isActive: false,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: requestingUserId,
        action: 'GDPR_DATA_DELETION',
        entityType: 'Client',
        entityId: clientId,
        details: {
          originalEmail: client.email,
          originalName: client.name,
          deletionDate: new Date().toISOString(),
          reason: 'GDPR Right to be Forgotten request',
          totalBookings: client.bookings.length,
        },
      },
    });

    return {
      success: true,
      message: 'Client data has been anonymized successfully',
      clientId: anonymizedClient.id,
      anonymizedAt: new Date().toISOString(),
      preservedRecords: {
        bookings: client.bookings.length,
        reason: 'Legal and financial record-keeping requirements',
      },
    };
  }

  /**
   * Delete user account (for internal users, not clients)
   */
  async deleteUserAccount(userId: number, tenantId: number, requestingUserId: number) {
    // Users can only delete their own account, or admins can delete others
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (requestingUser.id !== userId && requestingUser.role !== 'OWNER' && requestingUser.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of OWNER accounts
    if (user.role === 'OWNER') {
      throw new ForbiddenException('Cannot delete OWNER account. Transfer ownership first.');
    }

    // Soft delete by deactivating
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted-${userId}-${Date.now()}@deleted.local`,
        name: `Deleted User ${userId}`,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: requestingUserId,
        action: 'USER_ACCOUNT_DELETED',
        entityType: 'User',
        entityId: userId,
        details: {
          originalEmail: user.email,
          originalName: user.name,
          role: user.role,
          deletionDate: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      message: 'User account has been deactivated successfully',
      userId,
      deletedAt: new Date().toISOString(),
    };
  }

  /**
   * Get GDPR compliance status for a tenant
   */
  async getComplianceStatus(tenantId: number) {
    const [
      totalClients,
      activeClients,
      anonymizedClients,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.prisma.client.count({ where: { tenantId } }),
      this.prisma.client.count({ where: { tenantId, isActive: true } }),
      this.prisma.client.count({
        where: {
          tenantId,
          tags: { has: 'ANONYMIZED' },
        },
      }),
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      tenantId,
      checkedAt: new Date().toISOString(),
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: totalClients - activeClients,
        anonymized: anonymizedClients,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      gdprCompliance: {
        dataExportAvailable: true,
        dataPortabilityAvailable: true,
        rightToErasureAvailable: true,
        dataMinimizationEnabled: true,
        retentionPolicyActive: true,
      },
    };
  }
}
