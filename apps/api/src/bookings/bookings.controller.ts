import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SearchBookingDto } from './dto/search-booking.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, BookingStatus } from '@tour-crm/shared';

@ApiTags('Bookings')
@ApiBearerAuth('bearerAuth')
@Controller('bookings')
@UseGuards(RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @TenantId() tenantId: number,
  ) {
    return this.bookingsService.create(createBookingDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all bookings for current tenant with pagination' })
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.findAll(tenantId, paginationDto, status);
  }

  @Get('search')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({
    summary: 'Search bookings with filters',
    description: 'Advanced search for bookings by code, client name/email, status, and date range'
  })
  @ApiResponse({ status: 200, description: 'Bookings search results retrieved successfully' })
  search(
    @TenantId() tenantId: number,
    @Query() searchDto: SearchBookingDto,
  ) {
    return this.bookingsService.search(tenantId, searchDto);
  }

  @Get('stats')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get booking statistics by status' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@TenantId() tenantId: number) {
    return this.bookingsService.getStatsByStatus(tenantId);
  }

  @Get(':id/pnl')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Calculate profit & loss for a booking',
    description:
      'Calculates P&L using formula: sum(item.unit_price_eur*qty) − (sum(item.unit_cost_try*qty) / locked_exchange_rate)',
  })
  @ApiResponse({
    status: 200,
    description: 'P&L calculated successfully',
    schema: {
      example: {
        bookingId: 1,
        bookingCode: 'BK-2024-0001',
        lockedExchangeRate: 32.5,
        itemsCount: 5,
        totalRevenueEur: 1500.0,
        totalCostTry: 40000.0,
        totalCostEur: 1230.77,
        profitLossEur: 269.23,
        marginPercent: 17.95,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  calculatePnL(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.bookingsService.calculatePnL(id, tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get booking by ID with full details' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.bookingsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @TenantId() tenantId: number,
  ) {
    return this.bookingsService.update(id, updateBookingDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete booking' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.bookingsService.remove(id, tenantId);
  }
}
