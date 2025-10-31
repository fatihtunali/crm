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
import { VendorRatesService } from './vendor-rates.service';
import { CreateVendorRateDto } from './dto/create-vendor-rate.dto';
import { UpdateVendorRateDto } from './dto/update-vendor-rate.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Vendor Rates')
@ApiBearerAuth('JWT-auth')
@Controller('vendor-rates')
@UseGuards(RolesGuard)
export class VendorRatesController {
  constructor(private readonly vendorRatesService: VendorRatesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new vendor rate' })
  @ApiResponse({ status: 201, description: 'Vendor rate created successfully' })
  create(
    @Body() createVendorRateDto: CreateVendorRateDto,
    @TenantId() tenantId: number,
  ) {
    return this.vendorRatesService.create(createVendorRateDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all vendor rates for current tenant' })
  @ApiQuery({ name: 'vendorId', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'Vendor rates retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query('vendorId', new ParseIntPipe({ optional: true })) vendorId?: number,
  ) {
    return this.vendorRatesService.findAll(tenantId, vendorId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get vendor rate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vendor rate retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Vendor rate not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.vendorRatesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update vendor rate' })
  @ApiResponse({
    status: 200,
    description: 'Vendor rate updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Vendor rate not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorRateDto: UpdateVendorRateDto,
    @TenantId() tenantId: number,
  ) {
    return this.vendorRatesService.update(id, updateVendorRateDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vendor rate' })
  @ApiResponse({
    status: 200,
    description: 'Vendor rate deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Vendor rate not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.vendorRatesService.remove(id, tenantId);
  }
}
