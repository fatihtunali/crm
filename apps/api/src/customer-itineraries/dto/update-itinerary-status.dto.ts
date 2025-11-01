import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ItineraryStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateItineraryStatusDto {
  @ApiProperty({
    description: 'New status for the itinerary',
    enum: ItineraryStatus,
    example: ItineraryStatus.CONFIRMED,
  })
  @IsEnum(ItineraryStatus)
  status!: ItineraryStatus;
}
