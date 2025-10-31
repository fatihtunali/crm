import { PartialType } from '@nestjs/swagger';
import { CreateVehicleRateDto } from './create-vehicle-rate.dto';

export class UpdateVehicleRateDto extends PartialType(CreateVehicleRateDto) {}
