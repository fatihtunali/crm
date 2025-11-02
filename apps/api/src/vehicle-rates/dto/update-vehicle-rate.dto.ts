import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleRateDto } from './create-vehicle-rate.dto';

export class UpdateVehicleRateDto extends PartialType(CreateVehicleRateDto) {}
