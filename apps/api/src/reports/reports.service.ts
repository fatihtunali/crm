import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportFilterDto, LeadReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate Profit & Loss Report
   * Calculates revenue from clients vs costs to vendors
   */
  async getPnLReport(tenantId: number, filters: ReportFilterDto) {
    const whereClause: any = {
      tenantId,
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    };

    // Get total revenue from client payments
    const clientPayments = await this.prisma.paymentClient.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
      },
      _sum: {
        amountEur: true,
      },
      _count: {
        id: true,
      },
    });

    // Get total costs from vendor payments
    const vendorPayments = await this.prisma.paymentVendor.aggregate({
      where: {
        ...whereClause,
        status: 'COMPLETED',
      },
      _sum: {
        amountTry: true,
      },
      _count: {
        id: true,
      },
    });

    // Get average exchange rate for conversion
    const avgExchangeRate = await this.prisma.exchangeRate.aggregate({
      where: {
        tenantId,
        fromCurrency: 'TRY',
        toCurrency: 'EUR',
        ...(filters.dateFrom || filters.dateTo
          ? {
              rateDate: {
                ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
                ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
              },
            }
          : {}),
      },
      _avg: {
        rate: true,
      },
    });

    const totalRevenue = clientPayments._sum.amountEur || 0;
    const totalCostTry = vendorPayments._sum.amountTry || 0;
    const exchangeRate = avgExchangeRate._avg.rate || 0.03; // fallback rate
    const totalCostEur = Number(totalCostTry) * Number(exchangeRate);
    const netProfit = Number(totalRevenue) - totalCostEur;
    const profitMargin =
      Number(totalRevenue) > 0
        ? (netProfit / Number(totalRevenue)) * 100
        : 0;

    return {
      period: {
        from: filters.dateFrom || null,
        to: filters.dateTo || null,
      },
      revenue: {
        totalEur: Number(totalRevenue),
        transactionCount: clientPayments._count.id,
      },
      costs: {
        totalTry: Number(totalCostTry),
        totalEur: totalCostEur,
        transactionCount: vendorPayments._count.id,
        exchangeRateUsed: Number(exchangeRate),
      },
      profit: {
        netProfitEur: netProfit,
        profitMarginPct: profitMargin,
      },
    };
  }

  /**
   * Generate Revenue Report
   * Breakdown of revenue by booking status and month
   */
  async getRevenueReport(tenantId: number, filters: ReportFilterDto) {
    const whereClause: any = {
      tenantId,
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    };

    // Revenue by payment status
    const revenueByStatus = await this.prisma.paymentClient.groupBy({
      by: ['status'],
      where: whereClause,
      _sum: {
        amountEur: true,
      },
      _count: {
        id: true,
      },
    });

    // Total bookings value
    const bookingsStats = await this.prisma.booking.aggregate({
      where: {
        tenantId,
        ...(filters.dateFrom || filters.dateTo
          ? {
              createdAt: {
                ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
                ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
              },
            }
          : {}),
      },
      _sum: {
        totalSellEur: true,
      },
      _count: {
        id: true,
      },
    });

    // Revenue by booking status
    const revenueByBookingStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      where: {
        tenantId,
        ...(filters.dateFrom || filters.dateTo
          ? {
              createdAt: {
                ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
                ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
              },
            }
          : {}),
      },
      _sum: {
        totalSellEur: true,
      },
      _count: {
        id: true,
      },
    });

    const totalReceived = revenueByStatus
      .filter((item) => item.status === 'COMPLETED')
      .reduce((sum, item) => sum + Number(item._sum.amountEur || 0), 0);

    return {
      period: {
        from: filters.dateFrom || null,
        to: filters.dateTo || null,
      },
      summary: {
        totalBookingsValue: Number(bookingsStats._sum.totalSellEur || 0),
        totalReceivedEur: totalReceived,
        totalBookingsCount: bookingsStats._count.id,
      },
      byPaymentStatus: revenueByStatus.map((item) => ({
        status: item.status,
        amountEur: Number(item._sum.amountEur || 0),
        count: item._count.id,
      })),
      byBookingStatus: revenueByBookingStatus.map((item) => ({
        status: item.status,
        valueEur: Number(item._sum.totalSellEur || 0),
        count: item._count.id,
      })),
    };
  }

  /**
   * Generate Leads Report
   * Statistics on leads by status, source, and conversion
   */
  async getLeadsReport(tenantId: number, filters: LeadReportFilterDto) {
    const whereClause: any = {
      tenantId,
      ...(filters.status && { status: filters.status }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    };

    // Total leads
    const totalLeads = await this.prisma.lead.count({
      where: whereClause,
    });

    // Leads by status
    const leadsByStatus = await this.prisma.lead.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Leads by source
    const leadsBySource = await this.prisma.lead.groupBy({
      by: ['source'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Conversion metrics
    const wonLeads = await this.prisma.lead.count({
      where: {
        ...whereClause,
        status: 'WON',
      },
    });

    const lostLeads = await this.prisma.lead.count({
      where: {
        ...whereClause,
        status: 'LOST',
      },
    });

    const conversionRate =
      totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    // Average budget
    const avgBudget = await this.prisma.lead.aggregate({
      where: whereClause,
      _avg: {
        budgetEur: true,
      },
    });

    // Leads with quotations
    const leadsWithQuotations = await this.prisma.lead.count({
      where: {
        ...whereClause,
        quotations: {
          some: {},
        },
      },
    });

    return {
      period: {
        from: filters.dateFrom || null,
        to: filters.dateTo || null,
      },
      summary: {
        totalLeads,
        wonLeads,
        lostLeads,
        conversionRate,
        averageBudgetEur: Number(avgBudget._avg.budgetEur || 0),
        leadsWithQuotations,
      },
      byStatus: leadsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
        percentage: totalLeads > 0 ? (item._count.id / totalLeads) * 100 : 0,
      })),
      bySource: leadsBySource.map((item) => ({
        source: item.source || 'Unknown',
        count: item._count.id,
        percentage: totalLeads > 0 ? (item._count.id / totalLeads) * 100 : 0,
      })),
    };
  }
}
