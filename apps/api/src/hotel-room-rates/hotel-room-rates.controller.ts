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
} from '@nestjs/common';
import { HotelRoomRatesService } from './hotel-room-rates.service';
import { CreateHotelRoomRateDto } from './dto/create-hotel-room-rate.dto';
import { UpdateHotelRoomRateDto } from './dto/update-hotel-room-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('hotel-room-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelRoomRatesController {
  constructor(private readonly service: HotelRoomRatesService) {}

  @Post()
  create(@Body() dto: CreateHotelRoomRateDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHotelRoomRateDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.tenantId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('serviceOfferingId', new ParseIntPipe({ optional: true })) serviceOfferingId?: number,
    @Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive?: boolean,
  ) {
    return this.service.findAll(user.tenantId, serviceOfferingId, includeInactive ?? false);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.tenantId);
  }
}
