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
import { VehicleRatesService } from './vehicle-rates.service';
import { CreateVehicleRateDto } from './dto/create-vehicle-rate.dto';
import { UpdateVehicleRateDto } from './dto/update-vehicle-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vehicle-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleRatesController {
  constructor(private readonly service: VehicleRatesService) {}

  @Post()
  create(@Body() dto: CreateVehicleRateDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVehicleRateDto,
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
