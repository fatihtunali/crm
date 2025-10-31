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
import { PricingModel } from '@prisma/client';

export class CreateActivityRateDto {
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
    default: PricingModel.PER_PERSON,
  })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiProperty({ description: 'Base cost per person in TRY' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseCostTry!: number;

  @ApiPropertyOptional({ description: 'Minimum number of participants', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minPax?: number;

  @ApiPropertyOptional({ description: 'Maximum number of participants' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPax?: number;

  @ApiPropertyOptional({
    description: 'Tiered pricing (e.g., {"1-4": 100, "5-8": 80, "9+": 70})',
  })
  @IsOptional()
  @IsObject()
  tieredPricingJson?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Child discount percentage', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  childDiscountPct?: number;

  @ApiPropertyOptional({ description: 'Group discount percentage', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  groupDiscountPct?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
