import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class VendorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get vendor profile for the logged-in vendor user
   * Note: In a real implementation, we'd link User to Vendor via a vendorId field
   * For now, we'll use a simple approach where vendor users can access all vendors in their tenant
   */
  async getVendorProfile(tenantId: number, vendorId: number) {
    const vendor = await this.prisma.vendor.findFirst({
      where: {
        id: vendorId,
        tenantId,
        isActive: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  /**
   * Get bookings assigned to this vendor
   */
  async getVendorBookings(
    tenantId: number,
    vendorId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'startDate', order = 'desc' } = paginationDto;

    // Verify vendor exists and belongs to tenant
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Get bookings that have items assigned to this vendor
    const where = {
      tenantId,
      items: {
        some: {
          vendorId,
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            where: {
              vendorId,
            },
            select: {
              id: true,
              itemType: true,
              qty: true,
              unitCostTry: true,
              notes: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  /**
   * Get payments for this vendor
   */
  async getVendorPayments(
    tenantId: number,
    vendorId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'dueAt', order = 'desc' } = paginationDto;

    // Verify vendor exists and belongs to tenant
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const where = {
      tenantId,
      vendorId,
    };

    const [data, total] = await Promise.all([
      this.prisma.paymentVendor.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
              endDate: true,
              client: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.paymentVendor.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  /**
   * Get vendor payment statistics
   */
  async getVendorPaymentStats(tenantId: number, vendorId: number) {
    // Verify vendor exists and belongs to tenant
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Get payment statistics
    const stats = await this.prisma.paymentVendor.groupBy({
      by: ['status'],
      where: {
        tenantId,
        vendorId,
      },
      _sum: {
        amountTry: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate totals
    const totalPending = stats.find(s => s.status === 'PENDING')?._sum.amountTry || 0;
    const totalCompleted = stats.find(s => s.status === 'COMPLETED')?._sum.amountTry || 0;
    const totalAmount = Number(totalPending) + Number(totalCompleted);

    return {
      totalPayments: stats.reduce((sum, s) => sum + s._count.id, 0),
      totalAmountTry: totalAmount,
      totalPendingTry: Number(totalPending),
      totalCompletedTry: Number(totalCompleted),
      byStatus: stats.map(s => ({
        status: s.status,
        count: s._count.id,
        totalTry: Number(s._sum.amountTry || 0),
      })),
    };
  }

  /**
   * Get vendor dashboard summary
   */
  async getVendorDashboard(tenantId: number, vendorId: number) {
    // Verify vendor exists and belongs to tenant
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Count active bookings
    const activeBookings = await this.prisma.booking.count({
      where: {
        tenantId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        items: {
          some: {
            vendorId,
          },
        },
      },
    });

    // Count upcoming bookings (within next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingBookings = await this.prisma.booking.count({
      where: {
        tenantId,
        status: { in: ['CONFIRMED'] },
        startDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
        items: {
          some: {
            vendorId,
          },
        },
      },
    });

    // Get payment stats
    const paymentStats = await this.getVendorPaymentStats(tenantId, vendorId);

    return {
      vendor,
      stats: {
        activeBookings,
        upcomingBookings,
        payments: paymentStats,
      },
    };
  }
}
