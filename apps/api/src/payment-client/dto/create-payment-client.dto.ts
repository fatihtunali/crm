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

export class CreatePaymentClientDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  bookingId!: number;

  @ApiProperty({ example: 1500.0 })
  @IsDecimal()
  amountEur!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: '2024-10-31T00:00:00Z' })
  @IsDateString()
  paidAt!: string;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsString()
  @IsOptional()
  txnRef?: string;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    default: PaymentStatus.COMPLETED,
    required: false,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ example: 'Initial deposit payment', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
