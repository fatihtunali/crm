import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsEnum,
  IsDecimal,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@tour-crm/shared';

export class UpdatePaymentClientDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  bookingId?: number;

  @ApiProperty({ example: 1500.0, required: false })
  @IsDecimal()
  @IsOptional()
  amountEur?: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiProperty({ example: '2024-10-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsString()
  @IsOptional()
  txnRef?: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ example: 'Initial deposit payment', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
