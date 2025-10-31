import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateHotelRoomRateDto } from './create-hotel-room-rate.dto';

export class UpdateHotelRoomRateDto extends PartialType(
  OmitType(CreateHotelRoomRateDto, ['serviceOfferingId'] as const),
) {}
