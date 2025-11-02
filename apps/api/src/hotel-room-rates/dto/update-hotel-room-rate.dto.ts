import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelRoomRateDto } from './create-hotel-room-rate.dto';

export class UpdateHotelRoomRateDto extends PartialType(CreateHotelRoomRateDto) {}
