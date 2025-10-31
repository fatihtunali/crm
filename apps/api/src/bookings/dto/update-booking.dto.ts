import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsDecimal,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { BookingStatus } from '@tour-crm/shared';

export class UpdateBookingDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  quotationId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  clientId?: number;

  @ApiProperty({ example: 'BK-2024-001', required: false })
  @IsString()
  @IsOptional()
  bookingCode?: string;

  @ApiProperty({ example: '2024-06-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2024-06-08T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 32.5, required: false })
  @IsDecimal()
  @IsOptional()
  lockedExchangeRate?: number;

  @ApiProperty({ example: 5000.0, required: false })
  @IsDecimal()
  @IsOptional()
  totalCostTry?: number;

  @ApiProperty({ example: 250.0, required: false })
  @IsDecimal()
  @IsOptional()
  totalSellEur?: number;

  @ApiProperty({ example: 50.0, required: false })
  @IsDecimal()
  @IsOptional()
  depositDueEur?: number;

  @ApiProperty({ example: 200.0, required: false })
  @IsDecimal()
  @IsOptional()
  balanceDueEur?: number;

  @ApiProperty({ enum: BookingStatus, required: false })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({ example: 'Booking notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
