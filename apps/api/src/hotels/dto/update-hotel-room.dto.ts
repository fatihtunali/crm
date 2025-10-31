import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateHotelRoomDto } from './create-hotel-room.dto';

export class UpdateHotelRoomDto extends PartialType(
  OmitType(CreateHotelRoomDto, ['serviceOfferingId'] as const),
) {}
