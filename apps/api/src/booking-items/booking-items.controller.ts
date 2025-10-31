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
import { BookingItemsService } from './booking-items.service';
import { CreateBookingItemDto } from './dto/create-booking-item.dto';
import { UpdateBookingItemDto } from './dto/update-booking-item.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Booking Items')
@ApiBearerAuth('bearerAuth')
@Controller('booking-items')
@UseGuards(RolesGuard)
export class BookingItemsController {
  constructor(private readonly bookingItemsService: BookingItemsService) {}

  @Post()
  @Roles(UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Create a new booking item (OPERATIONS only)',
    description: 'Only users with OPERATIONS role can create booking items',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking item created successfully',
  })
  create(
    @Body() createBookingItemDto: CreateBookingItemDto,
    @TenantId() tenantId: number,
  ) {
    return this.bookingItemsService.create(createBookingItemDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all booking items for current tenant' })
  @ApiQuery({
    name: 'bookingId',
    type: Number,
    required: false,
    description: 'Filter by booking ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking items retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('bookingId', new ParseIntPipe({ optional: true }))
    bookingId?: number,
  ) {
    return this.bookingItemsService.findAll(tenantId, paginationDto, bookingId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get booking item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking item not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.bookingItemsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Update booking item (OPERATIONS only)',
    description: 'Only users with OPERATIONS role can update booking items',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking item updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking item not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingItemDto: UpdateBookingItemDto,
    @TenantId() tenantId: number,
  ) {
    return this.bookingItemsService.update(id, updateBookingItemDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Delete booking item (OPERATIONS only)',
    description: 'Only users with OPERATIONS role can delete booking items',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking item not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.bookingItemsService.remove(id, tenantId);
  }
}
