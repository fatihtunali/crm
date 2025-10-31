import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsDecimal,
  IsDateString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  bookingId!: number;

  @ApiProperty({ example: 'INV-2024-001' })
  @IsString()
  @Length(1, 100)
  number!: string;

  @ApiProperty({ example: '2024-10-31' })
  @IsDateString()
  issueDate!: string;

  @ApiProperty({ example: 'EUR', default: 'EUR' })
  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string = 'EUR';

  @ApiProperty({ example: 1000.0 })
  @IsDecimal()
  netAmount!: number;

  @ApiProperty({ example: 200.0 })
  @IsDecimal()
  vatAmount!: number;

  @ApiProperty({ example: 1200.0 })
  @IsDecimal()
  grossAmount!: number;

  @ApiProperty({ example: 20.0, default: 20.0 })
  @IsDecimal()
  @IsOptional()
  vatRate?: number = 20.0;

  @ApiProperty({
    example: 'https://example.com/invoices/INV-2024-001.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  pdfUrl?: string;
}
