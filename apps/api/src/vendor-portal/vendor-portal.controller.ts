import { Controller, Get, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorPortalService } from './vendor-portal.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Vendor Portal')
@ApiBearerAuth('bearerAuth')
@Controller('vendor-portal')
@UseGuards(RolesGuard)
export class VendorPortalController {
  constructor(private readonly vendorPortalService: VendorPortalService) {}

  @Get('vendors/:vendorId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({
    summary: 'Get vendor profile',
    description: 'Get vendor profile information (accessible by vendor users)',
  })
  @ApiResponse({ status: 200, description: 'Vendor profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  getVendorProfile(
    @TenantId() tenantId: number,
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ) {
    return this.vendorPortalService.getVendorProfile(tenantId, vendorId);
  }

  @Get('vendors/:vendorId/dashboard')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({
    summary: 'Get vendor dashboard',
    description: 'Get vendor dashboard with summary statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard retrieved successfully',
    schema: {
      example: {
        vendor: {
          id: 1,
          name: 'Hotel Istanbul',
          type: 'HOTEL',
          contactName: 'John Manager',
          email: 'hotel@example.com',
          phone: '+90555...',
        },
        stats: {
          activeBookings: 15,
          upcomingBookings: 8,
          payments: {
            totalPayments: 45,
            totalAmountTry: 125000,
            totalPendingTry: 25000,
            totalCompletedTry: 100000,
          },
        },
      },
    },
  })
  getVendorDashboard(
    @TenantId() tenantId: number,
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ) {
    return this.vendorPortalService.getVendorDashboard(tenantId, vendorId);
  }

  @Get('vendors/:vendorId/bookings')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VENDOR, UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Get vendor bookings',
    description: 'Get bookings assigned to this vendor',
  })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  getVendorBookings(
    @TenantId() tenantId: number,
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.vendorPortalService.getVendorBookings(tenantId, vendorId, paginationDto);
  }

  @Get('vendors/:vendorId/payments')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VENDOR, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Get vendor payments',
    description: 'Get payment history for this vendor',
  })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  getVendorPayments(
    @TenantId() tenantId: number,
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.vendorPortalService.getVendorPayments(tenantId, vendorId, paginationDto);
  }

  @Get('vendors/:vendorId/payments/stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VENDOR, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Get vendor payment statistics',
    description: 'Get payment statistics by status for this vendor',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
    schema: {
      example: {
        totalPayments: 45,
        totalAmountTry: 125000,
        totalPendingTry: 25000,
        totalCompletedTry: 100000,
        byStatus: [
          {
            status: 'COMPLETED',
            count: 35,
            totalTry: 100000,
          },
          {
            status: 'PENDING',
            count: 10,
            totalTry: 25000,
          },
        ],
      },
    },
  })
  getVendorPaymentStats(
    @TenantId() tenantId: number,
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ) {
    return this.vendorPortalService.getVendorPaymentStats(tenantId, vendorId);
  }
}
