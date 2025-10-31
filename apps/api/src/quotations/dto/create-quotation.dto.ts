import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsDecimal,
  IsEnum,
  IsDateString,
  IsString,
  IsObject,
} from 'class-validator';
import { QuotationStatus } from '@tour-crm/shared';

export class CreateQuotationDto {
  @ApiProperty({ example: 1, description: 'Lead ID', required: false })
  @IsInt()
  @IsOptional()
  leadId?: number;

  @ApiProperty({ example: 1, description: 'Tour ID', required: false })
  @IsInt()
  @IsOptional()
  tourId?: number;

  @ApiProperty({
    example: { items: [], customData: {} },
    description: 'Custom JSON data for quotation details',
    required: false,
  })
  @IsObject()
  @IsOptional()
  customJson?: any;

  @ApiProperty({
    example: 5000.0,
    description: 'Calculated cost in TRY',
    required: false,
  })
  @IsDecimal()
  @IsOptional()
  calcCostTry?: number;

  @ApiProperty({
    example: 250.0,
    description: 'Selling price in EUR',
    required: false,
  })
  @IsDecimal()
  @IsOptional()
  sellPriceEur?: number;

  @ApiProperty({
    example: 32.5,
    description: 'Exchange rate used (TRY to EUR)',
  })
  @IsDecimal()
  exchangeRateUsed!: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Quotation valid until date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiProperty({
    enum: QuotationStatus,
    example: QuotationStatus.DRAFT,
    required: false,
  })
  @IsEnum(QuotationStatus)
  @IsOptional()
  status?: QuotationStatus;

  @ApiProperty({
    example: 'Special requests or notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
