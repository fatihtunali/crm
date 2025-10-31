import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto, LeadReportFilterDto } from './dto/report-filter.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Reports')
@ApiBearerAuth('bearerAuth')
@Controller('reports')
@UseGuards(RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('pnl')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Generate Profit & Loss report',
    description:
      'Calculate revenue from client payments vs costs to vendors with profit margin analysis',
  })
  @ApiResponse({
    status: 200,
    description: 'P&L report generated successfully',
    schema: {
      example: {
        period: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
        revenue: {
          totalEur: 150000,
          transactionCount: 45,
        },
        costs: {
          totalTry: 3500000,
          totalEur: 105000,
          transactionCount: 120,
          exchangeRateUsed: 0.03,
        },
        profit: {
          netProfitEur: 45000,
          profitMarginPct: 30,
        },
      },
    },
  })
  async getPnLReport(
    @TenantId() tenantId: number,
    @Query() filters: ReportFilterDto,
  ) {
    return this.reportsService.getPnLReport(tenantId, filters);
  }

  @Get('revenue')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Generate revenue report',
    description:
      'Breakdown of revenue by booking status and payment status with totals',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue report generated successfully',
    schema: {
      example: {
        period: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
        summary: {
          totalBookingsValue: 200000,
          totalReceivedEur: 150000,
          totalBookingsCount: 65,
        },
        byPaymentStatus: [
          {
            status: 'COMPLETED',
            amountEur: 150000,
            count: 45,
          },
          {
            status: 'PENDING',
            amountEur: 0,
            count: 20,
          },
        ],
        byBookingStatus: [
          {
            status: 'CONFIRMED',
            valueEur: 180000,
            count: 55,
          },
          {
            status: 'PENDING',
            valueEur: 20000,
            count: 10,
          },
        ],
      },
    },
  })
  async getRevenueReport(
    @TenantId() tenantId: number,
    @Query() filters: ReportFilterDto,
  ) {
    return this.reportsService.getRevenueReport(tenantId, filters);
  }

  @Get('leads')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Generate leads report',
    description:
      'Statistics on leads by status, source, conversion rate, and quotation metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Leads report generated successfully',
    schema: {
      example: {
        period: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
        summary: {
          totalLeads: 150,
          wonLeads: 45,
          lostLeads: 30,
          conversionRate: 30,
          averageBudgetEur: 3500,
          leadsWithQuotations: 80,
        },
        byStatus: [
          {
            status: 'WON',
            count: 45,
            percentage: 30,
          },
          {
            status: 'NEW',
            count: 40,
            percentage: 26.67,
          },
        ],
        bySource: [
          {
            source: 'Website',
            count: 60,
            percentage: 40,
          },
          {
            source: 'Referral',
            count: 45,
            percentage: 30,
          },
        ],
      },
    },
  })
  async getLeadsReport(
    @TenantId() tenantId: number,
    @Query() filters: LeadReportFilterDto,
  ) {
    return this.reportsService.getLeadsReport(tenantId, filters);
  }
}
