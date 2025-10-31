import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportRatesDto {
  @ApiProperty({
    description: 'CSV content with exchange rates (fromCurrency,toCurrency,rate,rateDate)',
    example: 'TRY,EUR,0.0305,2024-01-15\nTRY,USD,0.0335,2024-01-15\nTRY,GBP,0.0265,2024-01-15',
  })
  @IsString()
  @IsNotEmpty()
  csvContent!: string;
}

export interface ExchangeRateRow {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
}
