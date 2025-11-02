import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Catalog')
@ApiBearerAuth('bearerAuth')
@Controller('catalog')
@UseGuards(RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('cities')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all cities for quote building' })
  @ApiResponse({ status: 200, description: 'List of cities retrieved successfully' })
  @ApiQuery({ name: 'includeAirports', required: false, type: Boolean })
  async getCities(
    @TenantId() tenantId: number,
    @Query('includeAirports', new DefaultValuePipe(false), ParseBoolPipe) includeAirports: boolean,
  ) {
    const cities = await this.catalogService.getCities(tenantId, includeAirports);
    return { success: true, data: cities };
  }

  @Get('hotels/all')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all hotels for management (no date filtering)' })
  @ApiResponse({ status: 200, description: 'All hotels retrieved successfully' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async getAllHotels(
    @TenantId() tenantId: number,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe) includeInactive: boolean,
  ) {
    const hotels = await this.catalogService.getAllHotels(tenantId, includeInactive);
    return { success: true, data: hotels, count: hotels.length };
  }

  @Get('hotels')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get hotels for a city with pricing' })
  @ApiResponse({ status: 200, description: 'Hotels retrieved successfully' })
  @ApiQuery({ name: 'cityId', required: true, type: Number })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isBoutique', required: false, type: Boolean })
  async getHotels(
    @TenantId() tenantId: number,
    @Query('cityId', ParseIntPipe) cityId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('category') category?: string,
    @Query('isBoutique', new DefaultValuePipe(false), ParseBoolPipe) isBoutique?: boolean,
  ) {
    const hotels = await this.catalogService.getHotelsForCity({
      tenantId,
      cityId,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isBoutique,
    });

    return { success: true, data: hotels, count: hotels.length };
  }

  @Get('tours')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get tours for a city with pricing' })
  @ApiResponse({ status: 200, description: 'Tours retrieved successfully' })
  @ApiQuery({ name: 'cityId', required: true, type: Number })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'tourType', required: false, enum: ['SIC', 'PRIVATE'] })
  async getTours(
    @TenantId() tenantId: number,
    @Query('cityId', ParseIntPipe) cityId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('tourType') tourType?: 'SIC' | 'PRIVATE',
  ) {
    const tours = await this.catalogService.getToursForCity({
      tenantId,
      cityId,
      tourType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return { success: true, data: tours, count: tours.length };
  }

  @Get('transfers')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get transfers between cities' })
  @ApiResponse({ status: 200, description: 'Transfers retrieved successfully' })
  @ApiQuery({ name: 'fromCityId', required: true, type: Number })
  @ApiQuery({ name: 'toCityId', required: true, type: Number })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'ISO date string' })
  async getTransfers(
    @TenantId() tenantId: number,
    @Query('fromCityId', ParseIntPipe) fromCityId: number,
    @Query('toCityId', ParseIntPipe) toCityId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const transfers = await this.catalogService.getTransfers({
      tenantId,
      fromCityId,
      toCityId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return { success: true, data: transfers, count: transfers.length };
  }
}
