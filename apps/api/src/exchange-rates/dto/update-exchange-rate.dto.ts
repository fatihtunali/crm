import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal, IsDateString, IsOptional } from 'class-validator';

export class UpdateExchangeRateDto {
  @ApiProperty({ example: 'TRY', required: false })
  @IsString()
  @IsOptional()
  fromCurrency?: string;

  @ApiProperty({ example: 'EUR', required: false })
  @IsString()
  @IsOptional()
  toCurrency?: string;

  @ApiProperty({ example: 32.5, required: false })
  @IsDecimal()
  @IsOptional()
  rate?: number;

  @ApiProperty({ example: '2024-10-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  rateDate?: string;

  @ApiProperty({ example: 'manual', required: false })
  @IsString()
  @IsOptional()
  source?: string;
}
