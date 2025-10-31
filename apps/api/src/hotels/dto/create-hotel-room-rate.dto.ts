import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { BoardType, PricingModel } from '@prisma/client';

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

  @ApiPropertyOptional({
    description: 'Pricing model',
    enum: PricingModel,
    default: PricingModel.PER_ROOM_NIGHT,
  })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiProperty({
    description: 'Board type',
    enum: BoardType,
  })
  @IsEnum(BoardType)
  boardType!: BoardType;

  @ApiPropertyOptional({ description: 'Number of adults', default: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  occupancyAdults?: number;

  @ApiPropertyOptional({ description: 'Number of children', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  occupancyChildren?: number;

  @ApiProperty({ description: 'Cost in TRY' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costTry!: number;

  @ApiPropertyOptional({
    description: 'Child policy (e.g., {"age_0_2": "free", "age_3_6": "50%"})',
  })
  @IsOptional()
  @IsObject()
  childPolicyJson?: Record<string, any>;

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
