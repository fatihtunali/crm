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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';
import { SupplierType } from '@prisma/client';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new supplier' })
  create(
    @TenantId() tenantId: number,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(tenantId, createSupplierDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiQuery({ name: 'type', required: false, enum: SupplierType })
  @ApiQuery({ name: 'includeInactive', required: false, type: String })
  findAll(
    @TenantId() tenantId: number,
    @Query('type') type?: SupplierType,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.suppliersService.findAll(
      tenantId,
      type,
      includeInactive === 'true',
    );
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get supplier statistics by type' })
  getStats(@TenantId() tenantId: number) {
    return this.suppliersService.getStatsByType(tenantId);
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search suppliers' })
  @ApiQuery({ name: 'type', required: false, enum: SupplierType })
  search(
    @TenantId() tenantId: number,
    @Query('q') searchTerm: string,
    @Query('type') type?: SupplierType,
  ) {
    return this.suppliersService.search(tenantId, searchTerm, type);
  }

  @Get('by-type/:type')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get suppliers by type' })
  findByType(@TenantId() tenantId: number, @Param('type') type: SupplierType) {
    return this.suppliersService.findByType(tenantId, type);
  }

  // ============================================
  // HOTELS MANAGEMENT
  // ============================================

  @Get('hotels')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all hotels' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getAllHotels(
    @TenantId() tenantId: number,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.suppliersService.getAllHotels(tenantId, includeInactive === 'true');
  }

  @Get('hotels/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get hotel by ID' })
  getHotel(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getHotel(id, tenantId);
  }

  @Post('hotels')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new hotel' })
  createHotel(
    @TenantId() tenantId: number,
    @Body() createHotelDto: any,
  ) {
    return this.suppliersService.createHotel(tenantId, createHotelDto);
  }

  @Patch('hotels/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update hotel' })
  updateHotel(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateHotelDto: any,
  ) {
    return this.suppliersService.updateHotel(id, tenantId, updateHotelDto);
  }

  @Delete('hotels/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate hotel' })
  deleteHotel(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteHotel(id, tenantId);
  }

  // ============================================
  // HOTEL PRICING MANAGEMENT
  // ============================================

  @Get('hotels/:hotelId/pricing')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all pricing for a hotel' })
  getAllHotelPricing(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getAllHotelPricing(hotelId, tenantId);
  }

  @Get('hotels/:hotelId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get specific pricing by ID' })
  getHotelPricing(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getHotelPricing(id, hotelId, tenantId);
  }

  @Post('hotels/:hotelId/pricing')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create hotel pricing' })
  createHotelPricing(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @TenantId() tenantId: number,
    @Body() createPricingDto: any,
  ) {
    return this.suppliersService.createHotelPricing(hotelId, tenantId, createPricingDto);
  }

  @Patch('hotels/:hotelId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update hotel pricing' })
  updateHotelPricing(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updatePricingDto: any,
  ) {
    return this.suppliersService.updateHotelPricing(id, hotelId, tenantId, updatePricingDto);
  }

  @Delete('hotels/:hotelId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate hotel pricing' })
  deleteHotelPricing(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteHotelPricing(id, hotelId, tenantId);
  }

  // ============================================
  // TRANSFERS (INTERCITY TRANSFERS) MANAGEMENT
  // ============================================

  @Get('intercity-transfers')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all intercity transfers' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getAllTransfers(
    @TenantId() tenantId: number,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.suppliersService.getAllTransfers(tenantId, includeInactive === 'true');
  }

  @Get('intercity-transfers/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get transfer by ID' })
  getTransfer(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getTransfer(id, tenantId);
  }

  @Post('intercity-transfers')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new intercity transfer' })
  createTransfer(
    @TenantId() tenantId: number,
    @Body() createTransferDto: any,
  ) {
    return this.suppliersService.createTransfer(tenantId, createTransferDto);
  }

  @Patch('intercity-transfers/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transfer' })
  updateTransfer(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateTransferDto: any,
  ) {
    return this.suppliersService.updateTransfer(id, tenantId, updateTransferDto);
  }

  @Delete('intercity-transfers/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate transfer' })
  deleteTransfer(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteTransfer(id, tenantId);
  }

  // ============================================
  // TRANSFER PRICING MANAGEMENT
  // ============================================

  @Get('intercity-transfers/:transferId/pricing')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all pricing for a transfer route' })
  getAllTransferPricing(
    @Param('transferId', ParseIntPipe) transferId: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getAllTransferPricing(transferId, tenantId);
  }

  @Get('intercity-transfers/:transferId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get specific transfer pricing by ID' })
  getTransferPricing(
    @Param('transferId', ParseIntPipe) transferId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getTransferPricing(id, transferId, tenantId);
  }

  @Post('intercity-transfers/:transferId/pricing')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create transfer pricing' })
  createTransferPricing(
    @Param('transferId', ParseIntPipe) transferId: number,
    @TenantId() tenantId: number,
    @Body() createPricingDto: any,
  ) {
    return this.suppliersService.createTransferPricing(transferId, tenantId, createPricingDto);
  }

  @Patch('intercity-transfers/:transferId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transfer pricing' })
  updateTransferPricing(
    @Param('transferId', ParseIntPipe) transferId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updatePricingDto: any,
  ) {
    return this.suppliersService.updateTransferPricing(id, transferId, tenantId, updatePricingDto);
  }

  @Delete('intercity-transfers/:transferId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate transfer pricing' })
  deleteTransferPricing(
    @Param('transferId', ParseIntPipe) transferId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteTransferPricing(id, transferId, tenantId);
  }

  // ============================================
  // TOURS MANAGEMENT
  // ============================================

  @Get('tours')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all tours' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getAllTours(
    @TenantId() tenantId: number,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.suppliersService.getAllTours(tenantId, includeInactive === 'true');
  }

  @Get('tours/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get tour by ID' })
  getTour(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getTour(id, tenantId);
  }

  @Post('tours')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new tour' })
  createTour(
    @TenantId() tenantId: number,
    @Body() createTourDto: any,
  ) {
    return this.suppliersService.createTour(tenantId, createTourDto);
  }

  @Patch('tours/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tour' })
  updateTour(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateTourDto: any,
  ) {
    return this.suppliersService.updateTour(id, tenantId, updateTourDto);
  }

  @Delete('tours/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate tour' })
  deleteTour(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteTour(id, tenantId);
  }

  // ============================================
  // TOUR PRICING MANAGEMENT
  // ============================================

  @Get('tours/:tourId/pricing')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all pricing for a tour' })
  getAllTourPricing(
    @Param('tourId', ParseIntPipe) tourId: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getAllTourPricing(tourId, tenantId);
  }

  @Get('tours/:tourId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get specific pricing by ID' })
  getTourPricing(
    @Param('tourId', ParseIntPipe) tourId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getTourPricing(id, tourId, tenantId);
  }

  @Post('tours/:tourId/pricing')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create tour pricing' })
  createTourPricing(
    @Param('tourId', ParseIntPipe) tourId: number,
    @TenantId() tenantId: number,
    @Body() createPricingDto: any,
  ) {
    return this.suppliersService.createTourPricing(tourId, tenantId, createPricingDto);
  }

  @Patch('tours/:tourId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tour pricing' })
  updateTourPricing(
    @Param('tourId', ParseIntPipe) tourId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updatePricingDto: any,
  ) {
    return this.suppliersService.updateTourPricing(id, tourId, tenantId, updatePricingDto);
  }

  @Delete('tours/:tourId/pricing/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate tour pricing' })
  deleteTourPricing(
    @Param('tourId', ParseIntPipe) tourId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteTourPricing(id, tourId, tenantId);
  }

  // ============================================
  // RESTAURANTS MANAGEMENT
  // ============================================

  @Get('restaurants')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  getAllRestaurants(
    @TenantId() tenantId: number,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.suppliersService.getAllRestaurants(tenantId, includeInactive === 'true');
  }

  @Get('restaurants/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get restaurant by ID' })
  getRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getRestaurant(id, tenantId);
  }

  @Post('restaurants')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new restaurant' })
  createRestaurant(
    @TenantId() tenantId: number,
    @Body() createRestaurantDto: any,
  ) {
    return this.suppliersService.createRestaurant(tenantId, createRestaurantDto);
  }

  @Patch('restaurants/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update restaurant' })
  updateRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateRestaurantDto: any,
  ) {
    return this.suppliersService.updateRestaurant(id, tenantId, updateRestaurantDto);
  }

  @Delete('restaurants/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate restaurant' })
  deleteRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteRestaurant(id, tenantId);
  }

  // ============================================
  // RESTAURANT MENU MANAGEMENT
  // ============================================

  @Get('restaurants/:restaurantId/menus')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all menus for a restaurant' })
  getAllRestaurantMenus(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getAllRestaurantMenus(restaurantId, tenantId);
  }

  @Get('restaurants/:restaurantId/menus/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get specific menu by ID' })
  getRestaurantMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.getRestaurantMenu(id, restaurantId, tenantId);
  }

  @Post('restaurants/:restaurantId/menus')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create restaurant menu' })
  createRestaurantMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @TenantId() tenantId: number,
    @Body() createMenuDto: any,
  ) {
    return this.suppliersService.createRestaurantMenu(restaurantId, tenantId, createMenuDto);
  }

  @Patch('restaurants/:restaurantId/menus/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update restaurant menu' })
  updateRestaurantMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateMenuDto: any,
  ) {
    return this.suppliersService.updateRestaurantMenu(id, restaurantId, tenantId, updateMenuDto);
  }

  @Delete('restaurants/:restaurantId/menus/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate restaurant menu' })
  deleteRestaurantMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.deleteRestaurantMenu(id, restaurantId, tenantId);
  }

  // ============================================
  // GENERIC SUPPLIER ROUTES (must come after specific routes)
  // ============================================

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.suppliersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update supplier' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, tenantId, updateSupplierDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete supplier (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.suppliersService.remove(id, tenantId);
  }
}
