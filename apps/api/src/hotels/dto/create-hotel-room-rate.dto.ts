import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { BoardType } from '@prisma/client';

export class CreateHotelRoomRateDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Season start date (YYYY-MM-DD)' })
  @IsDateString()
  seasonFrom!: string;

  @ApiProperty({ description: 'Season end date (YYYY-MM-DD)' })
  @IsDateString()
  seasonTo!: string;

  @ApiProperty({
    description: 'Board type',
    enum: BoardType,
  })
  @IsEnum(BoardType)
  boardType!: BoardType;

  // Adult Pricing
  @ApiProperty({ description: 'Price per person in double room (TRY per night)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerPersonDouble!: number;

  @ApiProperty({ description: 'Single supplement (extra charge for single occupancy in TRY per night)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  singleSupplement!: number;

  @ApiProperty({ description: 'Price per person in triple room (TRY per night)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerPersonTriple!: number;

  // Child Pricing Slabs
  @ApiProperty({ description: 'Child price for age 0-2.99 years (TRY per night)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  childPrice0to2!: number;

  @ApiProperty({ description: 'Child price for age 3-5.99 years (TRY per night)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  childPrice3to5!: number;

  @ApiProperty({ description: 'Child price for age 6-11.99 years (TRY per night)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  childPrice6to11!: number;

  // Additional Fields
  @ApiPropertyOptional({ description: 'Number of rooms contracted' })
  @IsOptional()
  @IsInt()
  @Min(0)
  allotment?: number;

  @ApiPropertyOptional({ description: 'Days before check-in to release rooms' })
  @IsOptional()
  @IsInt()
  @Min(0)
  releaseDays?: number;

  @ApiPropertyOptional({ description: 'Minimum number of nights', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minStay?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
