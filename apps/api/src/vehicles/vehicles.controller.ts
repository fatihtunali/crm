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
  ParseBoolPipe,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehicleRateDto } from './dto/create-vehicle-rate.dto';
import { UpdateVehicleRateDto } from './dto/update-vehicle-rate.dto';
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
import { VehicleClass } from '@prisma/client';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // ============================================
  // VEHICLES (Details)
  // ============================================

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create vehicle details' })
  createVehicle(
    @TenantId() tenantId: number,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return this.vehiclesService.createVehicle(tenantId, createVehicleDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiQuery({ name: 'vehicleClass', required: false, enum: VehicleClass })
  @ApiQuery({ name: 'withDriver', required: false, type: Boolean })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  findAllVehicles(
    @TenantId() tenantId: number,
    @Query('vehicleClass') vehicleClass?: string,
    @Query('withDriver') withDriver?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.vehiclesService.findAllVehicles(
      tenantId,
      vehicleClass as VehicleClass | undefined,
      withDriver ? withDriver === 'true' : undefined,
      supplierId ? parseInt(supplierId, 10) : undefined,
    );
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search vehicles' })
  search(@TenantId() tenantId: number, @Query('q') searchTerm: string) {
    return this.vehiclesService.searchVehicles(tenantId, searchTerm);
  }

  @Get(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get vehicle by service offering ID' })
  findOneVehicle(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.findOneVehicle(serviceOfferingId, tenantId);
  }

  @Patch(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vehicle' })
  updateVehicle(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.updateVehicle(
      serviceOfferingId,
      tenantId,
      updateVehicleDto,
    );
  }

  @Delete(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vehicle (soft delete)' })
  removeVehicle(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.removeVehicle(serviceOfferingId, tenantId);
  }

  // ============================================
  // VEHICLE RATES
  // ============================================

  @Post('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create vehicle rate' })
  createVehicleRate(
    @TenantId() tenantId: number,
    @Body() createVehicleRateDto: CreateVehicleRateDto,
  ) {
    return this.vehiclesService.createVehicleRate(
      tenantId,
      createVehicleRateDto,
    );
  }

  @Get('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all vehicle rates' })
  @ApiQuery({ name: 'serviceOfferingId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAllVehicleRates(
    @TenantId() tenantId: number,
    @Query('serviceOfferingId') serviceOfferingId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.vehiclesService.findAllVehicleRates(
      tenantId,
      serviceOfferingId ? parseInt(serviceOfferingId, 10) : undefined,
      dateFrom,
      dateTo,
    );
  }

  @Get('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get vehicle rate by ID' })
  findOneVehicleRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.findOneVehicleRate(id, tenantId);
  }

  @Patch('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vehicle rate' })
  updateVehicleRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateVehicleRateDto: UpdateVehicleRateDto,
  ) {
    return this.vehiclesService.updateVehicleRate(
      id,
      tenantId,
      updateVehicleRateDto,
    );
  }

  @Delete('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vehicle rate (soft delete)' })
  removeVehicleRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.vehiclesService.removeVehicleRate(id, tenantId);
  }
}
