import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsentDto, ConsentPurpose } from './dto/create-consent.dto';
import { BulkGrantConsentDto } from './dto/bulk-grant-consent.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Grant consent for a specific purpose
   */
  async grantConsent(
    dto: CreateConsentDto,
    tenantId: number,
    ipAddress: string,
    userAgent: string,
  ) {
    // Check if client exists
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, tenantId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
    }

    // Check if consent already exists for this purpose
    const existingConsent = await this.prisma.consent.findFirst({
      where: {
        tenantId,
        clientId: dto.clientId,
        purpose: dto.purpose as any,
        revokedAt: null, // Only check active consents
      },
    });

    if (existingConsent) {
      // Update existing consent
      const updatedConsent = await this.prisma.consent.update({
        where: { id: existingConsent.id },
        data: {
          granted: dto.granted,
          version: dto.version,
          grantedAt: new Date(),
          ipAddress,
          userAgent,
          userId: dto.userId,
        },
      });

      // Log the action
      await this.auditLogsService.create({
        tenantId,
        userId: dto.userId || null,
        entity: 'Consent',
        entityId: updatedConsent.id,
        action: dto.granted ? 'CONSENT_GRANTED' : 'CONSENT_DENIED',
        diffJson: {
          purpose: dto.purpose,
          version: dto.version,
          clientId: dto.clientId,
        },
        ipAddress,
        userAgent,
      });

      return updatedConsent;
    }

    // Create new consent
    const consent = await this.prisma.consent.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        userId: dto.userId,
        purpose: dto.purpose as any,
        granted: dto.granted,
        version: dto.version,
        grantedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    // Log the action
    await this.auditLogsService.create({
      tenantId,
      userId: dto.userId || null,
      entity: 'Consent',
      entityId: consent.id,
      action: dto.granted ? 'CONSENT_GRANTED' : 'CONSENT_DENIED',
      diffJson: {
        purpose: dto.purpose,
        version: dto.version,
        clientId: dto.clientId,
      },
      ipAddress,
      userAgent,
    });

    return consent;
  }

  /**
   * Revoke consent
   */
  async revokeConsent(consentId: number, tenantId: number, userId?: number) {
    const consent = await this.prisma.consent.findFirst({
      where: { id: consentId, tenantId },
    });

    if (!consent) {
      throw new NotFoundException(`Consent with ID ${consentId} not found`);
    }

    if (consent.revokedAt) {
      throw new BadRequestException('Consent has already been revoked');
    }

    const updatedConsent = await this.prisma.consent.update({
      where: { id: consentId },
      data: {
        revokedAt: new Date(),
        granted: false,
      },
    });

    // Log the action
    await this.auditLogsService.create({
      tenantId,
      userId: userId || null,
      entity: 'Consent',
      entityId: consentId,
      action: 'CONSENT_REVOKED',
      diffJson: {
        purpose: consent.purpose,
        clientId: consent.clientId,
        revokedAt: updatedConsent.revokedAt,
      },
      ipAddress: null,
      userAgent: null,
    });

    return updatedConsent;
  }

  /**
   * Check if client has granted consent for a specific purpose
   */
  async hasConsent(
    clientId: number,
    purpose: ConsentPurpose,
    tenantId: number,
  ): Promise<boolean> {
    const consent = await this.prisma.consent.findFirst({
      where: {
        tenantId,
        clientId,
        purpose: purpose as any,
        granted: true,
        revokedAt: null,
      },
    });

    return consent !== null;
  }

  /**
   * Get all active consents for a client
   */
  async getClientConsents(clientId: number, tenantId: number) {
    return this.prisma.consent.findMany({
      where: {
        tenantId,
        clientId,
        revokedAt: null, // Only active consents
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get consent history including revoked consents
   */
  async getConsentHistory(clientId: number, tenantId: number) {
    return this.prisma.consent.findMany({
      where: {
        tenantId,
        clientId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update privacy policy version - requires re-consent from all users
   * This method marks all existing consents as needing review
   */
  async updatePrivacyVersion(newVersion: string, tenantId: number) {
    // This is informational - consents don't need to be invalidated
    // Just return count of consents that were granted under old versions
    const oldConsents = await this.prisma.consent.count({
      where: {
        tenantId,
        version: {
          not: newVersion,
        },
        granted: true,
        revokedAt: null,
      },
    });

    return {
      newVersion,
      consentsNeedingReview: oldConsents,
      message: `Privacy policy updated to version ${newVersion}. ${oldConsents} consents were granted under previous versions.`,
    };
  }

  /**
   * Bulk grant consents for multiple purposes
   */
  async bulkGrantConsent(
    dto: BulkGrantConsentDto,
    tenantId: number,
    ipAddress: string,
    userAgent: string,
    userId?: number,
  ) {
    const results = [];

    for (const { purpose } of dto.purposes) {
      const consent = await this.grantConsent(
        {
          clientId: dto.clientId,
          purpose: purpose as ConsentPurpose,
          granted: true,
          version: dto.version,
          userId,
        },
        tenantId,
        ipAddress,
        userAgent,
      );

      results.push(consent);
    }

    return {
      clientId: dto.clientId,
      consentsGranted: results.length,
      consents: results,
    };
  }

  /**
   * Get consent statistics for a tenant
   */
  async getConsentStatistics(tenantId: number) {
    const [totalConsents, activeConsents, revokedConsents, byPurpose] = await Promise.all([
      this.prisma.consent.count({ where: { tenantId } }),
      this.prisma.consent.count({ where: { tenantId, granted: true, revokedAt: null } }),
      this.prisma.consent.count({ where: { tenantId, revokedAt: { not: null } } }),
      this.prisma.consent.groupBy({
        by: ['purpose'],
        where: { tenantId, granted: true, revokedAt: null },
        _count: true,
      }),
    ]);

    return {
      totalConsents,
      activeConsents,
      revokedConsents,
      byPurpose: byPurpose.map((p) => ({
        purpose: p.purpose,
        count: p._count,
      })),
    };
  }
}
