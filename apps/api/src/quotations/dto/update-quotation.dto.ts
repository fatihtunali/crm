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

export class UpdateQuotationDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  leadId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  tourId?: number;

  @ApiProperty({
    example: { items: [], customData: {} },
    required: false,
  })
  @IsObject()
  @IsOptional()
  customJson?: any;

  @ApiProperty({ example: 5000.0, required: false })
  @IsDecimal()
  @IsOptional()
  calcCostTry?: number;

  @ApiProperty({ example: 250.0, required: false })
  @IsDecimal()
  @IsOptional()
  sellPriceEur?: number;

  @ApiProperty({ example: 32.5, required: false })
  @IsDecimal()
  @IsOptional()
  exchangeRateUsed?: number;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiProperty({ enum: QuotationStatus, required: false })
  @IsEnum(QuotationStatus)
  @IsOptional()
  status?: QuotationStatus;

  @ApiProperty({ example: 'Special requests or notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
