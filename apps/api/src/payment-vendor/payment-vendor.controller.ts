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
import { PaymentVendorService } from './payment-vendor.service';
import { CreatePaymentVendorDto } from './dto/create-payment-vendor.dto';
import { UpdatePaymentVendorDto } from './dto/update-payment-vendor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Payment Vendor')
@ApiBearerAuth('JWT-auth')
@Controller('payment-vendor')
@UseGuards(RolesGuard)
export class PaymentVendorController {
  constructor(private readonly paymentVendorService: PaymentVendorService) {}

  @Post()
  @Idempotent()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Create a new vendor payment (idempotent)' })
  @ApiResponse({
    status: 201,
    description: 'Vendor payment created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Idempotency-Key header is required',
  })
  create(
    @Body() createPaymentVendorDto: CreatePaymentVendorDto,
    @TenantId() tenantId: number,
  ) {
    return this.paymentVendorService.create(createPaymentVendorDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all vendor payments for current tenant' })
  @ApiQuery({
    name: 'bookingId',
    type: Number,
    required: false,
    description: 'Filter by booking ID',
  })
  @ApiQuery({
    name: 'vendorId',
    type: Number,
    required: false,
    description: 'Filter by vendor ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor payments retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('bookingId', new ParseIntPipe({ optional: true }))
    bookingId?: number,
    @Query('vendorId', new ParseIntPipe({ optional: true }))
    vendorId?: number,
  ) {
    return this.paymentVendorService.findAll(tenantId, paginationDto, bookingId, vendorId);
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Get payment statistics by status' })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: number) {
    return this.paymentVendorService.getStats(tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get vendor payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vendor payment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Vendor payment not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.paymentVendorService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Update vendor payment' })
  @ApiResponse({
    status: 200,
    description: 'Vendor payment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Vendor payment not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentVendorDto: UpdatePaymentVendorDto,
    @TenantId() tenantId: number,
  ) {
    return this.paymentVendorService.update(
      id,
      updatePaymentVendorDto,
      tenantId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vendor payment' })
  @ApiResponse({
    status: 200,
    description: 'Vendor payment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Vendor payment not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.paymentVendorService.remove(id, tenantId);
  }
}
