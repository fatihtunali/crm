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
import { HotelsService } from './hotels.service';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';
import { CreateHotelRoomRateDto } from './dto/create-hotel-room-rate.dto';
import { UpdateHotelRoomRateDto } from './dto/update-hotel-room-rate.dto';
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

@ApiTags('Hotels')
@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // ============================================
  // HOTEL ROOMS (Details)
  // ============================================

  @Post('rooms')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create hotel room details' })
  createHotelRoom(
    @TenantId() tenantId: number,
    @Body() createHotelRoomDto: CreateHotelRoomDto,
  ) {
    return this.hotelsService.createHotelRoom(tenantId, createHotelRoomDto);
  }

  @Get('rooms')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all hotel rooms' })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'stars', required: false, type: Number })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  findAllHotelRooms(
    @TenantId() tenantId: number,
    @Query('city') city?: string,
    @Query('stars') stars?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.hotelsService.findAllHotelRooms(
      tenantId,
      city,
      stars ? parseInt(stars, 10) : undefined,
      supplierId ? parseInt(supplierId, 10) : undefined,
    );
  }

  @Get('rooms/search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search hotels' })
  search(@TenantId() tenantId: number, @Query('q') searchTerm: string) {
    return this.hotelsService.searchHotels(tenantId, searchTerm);
  }

  @Get('rooms/:serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get hotel room by service offering ID' })
  findOneHotelRoom(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.hotelsService.findOneHotelRoom(serviceOfferingId, tenantId);
  }

  @Patch('rooms/:serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update hotel room' })
  updateHotelRoom(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
    @Body() updateHotelRoomDto: UpdateHotelRoomDto,
  ) {
    return this.hotelsService.updateHotelRoom(
      serviceOfferingId,
      tenantId,
      updateHotelRoomDto,
    );
  }

  @Delete('rooms/:serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete hotel room (soft delete)' })
  removeHotelRoom(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.hotelsService.removeHotelRoom(serviceOfferingId, tenantId);
  }

  // ============================================
  // HOTEL ROOM RATES
  // ============================================

  @Post('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create hotel room rate' })
  createHotelRoomRate(
    @TenantId() tenantId: number,
    @Body() createHotelRoomRateDto: CreateHotelRoomRateDto,
  ) {
    return this.hotelsService.createHotelRoomRate(
      tenantId,
      createHotelRoomRateDto,
    );
  }

  @Get('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all hotel room rates' })
  @ApiQuery({ name: 'serviceOfferingId', required: false, type: Number })
  @ApiQuery({ name: 'boardType', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAllHotelRoomRates(
    @TenantId() tenantId: number,
    @Query('serviceOfferingId') serviceOfferingId?: string,
    @Query('boardType') boardType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.hotelsService.findAllHotelRoomRates(
      tenantId,
      serviceOfferingId ? parseInt(serviceOfferingId, 10) : undefined,
      boardType,
      dateFrom,
      dateTo,
    );
  }

  @Get('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get hotel room rate by ID' })
  findOneHotelRoomRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.hotelsService.findOneHotelRoomRate(id, tenantId);
  }

  @Patch('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update hotel room rate' })
  updateHotelRoomRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateHotelRoomRateDto: UpdateHotelRoomRateDto,
  ) {
    return this.hotelsService.updateHotelRoomRate(
      id,
      tenantId,
      updateHotelRoomRateDto,
    );
  }

  @Delete('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete hotel room rate (soft delete)' })
  removeHotelRoomRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.hotelsService.removeHotelRoomRate(id, tenantId);
  }
}
