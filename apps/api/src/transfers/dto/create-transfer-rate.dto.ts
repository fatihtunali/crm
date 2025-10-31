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

export class CreateTransferRateDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId: number;

  @ApiProperty({ description: 'Season start date (YYYY-MM-DD)' })
  @IsDateString()
  seasonFrom: string;

  @ApiProperty({ description: 'Season end date (YYYY-MM-DD)' })
  @IsDateString()
  seasonTo: string;

  @ApiPropertyOptional({
    description: 'Pricing model',
    enum: PricingModel,
    default: PricingModel.PER_TRANSFER,
  })
  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @ApiProperty({ description: 'Base cost in TRY' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseCostTry: number;

  @ApiPropertyOptional({ description: 'Included kilometers' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  includedKm?: number;

  @ApiPropertyOptional({ description: 'Included hours' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  includedHours?: number;

  @ApiPropertyOptional({ description: 'Extra kilometer cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraKmTry?: number;

  @ApiPropertyOptional({ description: 'Extra hour cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraHourTry?: number;

  @ApiPropertyOptional({ description: 'Night surcharge percentage', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  nightSurchargePct?: number;

  @ApiPropertyOptional({ description: 'Holiday surcharge percentage', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  holidaySurchargePct?: number;

  @ApiPropertyOptional({ description: 'Free waiting time in minutes', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  waitingTimeFree?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
