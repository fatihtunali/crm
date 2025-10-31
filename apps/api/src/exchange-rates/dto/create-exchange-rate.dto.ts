import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal, IsDateString, IsOptional } from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty({ example: 'TRY', description: 'From currency code', required: false })
  @IsString()
  @IsOptional()
  fromCurrency?: string;

  @ApiProperty({ example: 'EUR', description: 'To currency code', required: false })
  @IsString()
  @IsOptional()
  toCurrency?: string;

  @ApiProperty({ example: 32.5, description: 'Exchange rate' })
  @IsDecimal()
  rate!: number;

  @ApiProperty({ example: '2024-10-31T00:00:00Z', description: 'Rate date' })
  @IsDateString()
  rateDate!: string;

  @ApiProperty({ example: 'manual', description: 'Rate source', required: false })
  @IsString()
  @IsOptional()
  source?: string;
}
