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
import { PricingModel } from '@prisma/client';

export class CreateGuideRateDto {
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
    default: PricingModel.PER_DAY,
  })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiPropertyOptional({ description: 'Full day cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dayCostTry?: number;

  @ApiPropertyOptional({ description: 'Half day cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  halfDayCostTry?: number;

  @ApiPropertyOptional({ description: 'Hourly cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourCostTry?: number;

  @ApiPropertyOptional({ description: 'Overtime hourly cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  overtimeHourTry?: number;

  @ApiPropertyOptional({ description: 'Holiday surcharge percentage', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  holidaySurchargePct?: number;

  @ApiPropertyOptional({ description: 'Minimum hours', default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minHours?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
