import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsDecimal,
  IsDateString,
  IsOptional,
  Length,
} from 'class-validator';

export class UpdateInvoiceDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  bookingId?: number;

  @ApiProperty({ example: 'INV-2024-001', required: false })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  number?: string;

  @ApiProperty({ example: '2024-10-31', required: false })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiProperty({ example: 'EUR', required: false })
  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 1000.0, required: false })
  @IsDecimal()
  @IsOptional()
  netAmount?: number;

  @ApiProperty({ example: 200.0, required: false })
  @IsDecimal()
  @IsOptional()
  vatAmount?: number;

  @ApiProperty({ example: 1200.0, required: false })
  @IsDecimal()
  @IsOptional()
  grossAmount?: number;

  @ApiProperty({ example: 20.0, required: false })
  @IsDecimal()
  @IsOptional()
  vatRate?: number;

  @ApiProperty({
    example: 'https://example.com/invoices/INV-2024-001.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  pdfUrl?: string;
}
