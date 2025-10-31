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

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'Quotation ID', required: false })
  @IsInt()
  @IsOptional()
  quotationId?: number;

  @ApiProperty({ example: 1, description: 'Client ID' })
  @IsInt()
  clientId!: number;

  @ApiProperty({ example: 'BK-2024-001', description: 'Unique booking code' })
  @IsString()
  bookingCode!: string;

  @ApiProperty({ example: '2024-06-01T00:00:00Z', description: 'Tour start date' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-06-08T00:00:00Z', description: 'Tour end date' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 32.5, description: 'Locked exchange rate (TRY/EUR)' })
  @IsDecimal()
  lockedExchangeRate!: number;

  @ApiProperty({ example: 5000.0, description: 'Total cost in TRY', required: false })
  @IsDecimal()
  @IsOptional()
  totalCostTry?: number;

  @ApiProperty({ example: 250.0, description: 'Total selling price in EUR', required: false })
  @IsDecimal()
  @IsOptional()
  totalSellEur?: number;

  @ApiProperty({ example: 50.0, description: 'Deposit due in EUR', required: false })
  @IsDecimal()
  @IsOptional()
  depositDueEur?: number;

  @ApiProperty({ example: 200.0, description: 'Balance due in EUR', required: false })
  @IsDecimal()
  @IsOptional()
  balanceDueEur?: number;

  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    required: false,
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({ example: 'Booking notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
