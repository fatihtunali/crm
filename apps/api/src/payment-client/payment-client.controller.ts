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
import { PaymentClientService } from './payment-client.service';
import { CreatePaymentClientDto } from './dto/create-payment-client.dto';
import { UpdatePaymentClientDto } from './dto/update-payment-client.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Payment Client')
@ApiBearerAuth('JWT-auth')
@Controller('payment-client')
@UseGuards(RolesGuard)
export class PaymentClientController {
  constructor(private readonly paymentClientService: PaymentClientService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Create a new client payment' })
  @ApiResponse({
    status: 201,
    description: 'Client payment created successfully',
  })
  create(
    @Body() createPaymentClientDto: CreatePaymentClientDto,
    @TenantId() tenantId: number,
  ) {
    return this.paymentClientService.create(createPaymentClientDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all client payments for current tenant' })
  @ApiQuery({
    name: 'bookingId',
    type: Number,
    required: false,
    description: 'Filter by booking ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Client payments retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query('bookingId', new ParseIntPipe({ optional: true }))
    bookingId?: number,
  ) {
    return this.paymentClientService.findAll(tenantId, bookingId);
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Get payment statistics by method and status' })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: number) {
    return this.paymentClientService.getStats(tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get client payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Client payment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Client payment not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.paymentClientService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Update client payment' })
  @ApiResponse({
    status: 200,
    description: 'Client payment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Client payment not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentClientDto: UpdatePaymentClientDto,
    @TenantId() tenantId: number,
  ) {
    return this.paymentClientService.update(
      id,
      updatePaymentClientDto,
      tenantId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete client payment' })
  @ApiResponse({
    status: 200,
    description: 'Client payment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Client payment not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.paymentClientService.remove(id, tenantId);
  }
}
