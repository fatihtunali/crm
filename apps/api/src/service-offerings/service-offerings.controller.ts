import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ServiceOfferingsService } from './service-offerings.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';
import { ServiceType } from '@prisma/client';

@ApiTags('Service Offerings')
@Controller('service-offerings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class ServiceOfferingsController {
  constructor(
    private readonly serviceOfferingsService: ServiceOfferingsService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new service offering' })
  create(
    @TenantId() tenantId: number,
    @Body() createServiceOfferingDto: CreateServiceOfferingDto,
  ) {
    return this.serviceOfferingsService.create(tenantId, createServiceOfferingDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all service offerings' })
  @ApiQuery({ name: 'serviceType', required: false, enum: ServiceType })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'includeInactive', required: false, type: String })
  findAll(
    @TenantId() tenantId: number,
    @Query('serviceType') serviceType?: ServiceType,
    @Query('supplierId') supplierId?: string,
    @Query('location') location?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.serviceOfferingsService.findAll(
      tenantId,
      serviceType,
      supplierId ? parseInt(supplierId, 10) : undefined,
      location,
      includeInactive === 'true',
    );
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get service offering statistics by type' })
  getStats(@TenantId() tenantId: number) {
    return this.serviceOfferingsService.getStatsByType(tenantId);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search service offerings' })
  @ApiQuery({ name: 'serviceType', required: false, enum: ServiceType })
  search(
    @TenantId() tenantId: number,
    @Query('q') searchTerm: string,
    @Query('serviceType') serviceType?: ServiceType,
  ) {
    return this.serviceOfferingsService.search(tenantId, searchTerm, serviceType);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get service offering by ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.serviceOfferingsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update service offering' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateServiceOfferingDto: UpdateServiceOfferingDto,
  ) {
    return this.serviceOfferingsService.update(
      id,
      tenantId,
      updateServiceOfferingDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete service offering (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.serviceOfferingsService.remove(id, tenantId);
  }
}
