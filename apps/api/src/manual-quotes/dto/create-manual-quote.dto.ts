import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteCategory, TourTypeEnum } from '@prisma/client';
import { CreateManualQuoteDayDto } from './create-manual-quote-day.dto';

export class CreateManualQuoteDto {
  @ApiProperty({
    description: 'Name of the quote/itinerary',
    example: 'Istanbul & Cappadocia Tour - 7 Days',
  })
  @IsString()
  quoteName!: string;

  @ApiPropertyOptional({
    description: 'Quote category',
    enum: QuoteCategory,
    default: QuoteCategory.B2C,
  })
  @IsOptional()
  @IsEnum(QuoteCategory)
  category?: QuoteCategory;

  @ApiPropertyOptional({
    description: 'Season name for this quote',
    example: 'Summer 2025',
  })
  @IsOptional()
  @IsString()
  seasonName?: string;

  @ApiPropertyOptional({
    description: 'Valid from date (quote validity period)',
    example: '2025-11-01',
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({
    description: 'Valid to date (quote validity period)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiProperty({
    description: 'Tour start date',
    example: '2025-11-15',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Tour end date',
    example: '2025-11-21',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'Tour type',
    enum: TourTypeEnum,
    example: TourTypeEnum.SIC,
  })
  @IsEnum(TourTypeEnum)
  tourType!: TourTypeEnum;

  @ApiProperty({
    description: 'Number of passengers',
    example: 4,
  })
  @IsInt()
  @Min(1)
  pax!: number;

  @ApiProperty({
    description: 'Markup percentage',
    example: 15.0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  markup!: number;

  @ApiProperty({
    description: 'Tax percentage',
    example: 8.0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  tax!: number;

  @ApiPropertyOptional({
    description: 'Transport pricing mode: "total" or "vehicle"',
    example: 'total',
    default: 'total',
  })
  @IsOptional()
  @IsString()
  transportPricingMode?: string;

  @ApiPropertyOptional({
    description: 'Days in the itinerary',
    type: [CreateManualQuoteDayDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateManualQuoteDayDto)
  days?: CreateManualQuoteDayDto[];
}
