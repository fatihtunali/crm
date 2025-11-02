import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { BookingStatus } from '@tour-crm/shared';
import { IsAfterDate } from '../../common/validators/is-after-date.validator';

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

  @ApiProperty({ example: '2024-06-08T00:00:00Z', description: 'Tour end date (must be after start date)' })
  @IsDateString()
  @IsAfterDate('startDate', { message: 'End date must be after start date' })
  endDate!: string;

  @ApiProperty({ example: 32.5, description: 'Locked exchange rate (TRY/EUR)' })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  @Max(1000000)
  lockedExchangeRate!: number;

  @ApiProperty({ example: 5000.0, description: 'Total cost in TRY', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10000000)
  @IsOptional()
  totalCostTry?: number;

  @ApiProperty({ example: 250.0, description: 'Total selling price in EUR', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
  @IsOptional()
  totalSellEur?: number;

  @ApiProperty({ example: 50.0, description: 'Deposit due in EUR', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
  @IsOptional()
  depositDueEur?: number;

  @ApiProperty({ example: 200.0, description: 'Balance due in EUR', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
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
