import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsEnum,
  IsDecimal,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { PaymentStatus } from '@tour-crm/shared';

export class UpdatePaymentVendorDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  bookingId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  vendorId?: number;

  @ApiProperty({ example: 5000.0, required: false })
  @IsDecimal()
  @IsOptional()
  amountTry?: number;

  @ApiProperty({ example: '2024-11-30T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dueAt?: string;

  @ApiProperty({ example: '2024-11-25T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ example: 'Hotel payment for booking #123', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
