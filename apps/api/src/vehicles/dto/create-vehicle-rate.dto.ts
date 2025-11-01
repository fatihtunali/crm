import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateVehicleRateDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Season start date (YYYY-MM-DD)' })
  @IsDateString()
  seasonFrom!: string;

  @ApiProperty({ description: 'Season end date (YYYY-MM-DD)' })
  @IsDateString()
  seasonTo!: string;

  @ApiProperty({ description: 'Daily rental rate in TRY', example: 2400.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyRateTry!: number;

  @ApiProperty({ description: 'Hourly rental rate in TRY', example: 400.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRateTry!: number;

  @ApiPropertyOptional({ description: 'Minimum billable hours', default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minHours?: number;

  @ApiPropertyOptional({ description: 'Daily kilometers included' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyKmIncluded?: number;

  @ApiPropertyOptional({ description: 'Extra kilometer cost in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraKmTry?: number;

  @ApiPropertyOptional({ description: 'Driver daily cost in TRY (if with driver)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  driverDailyTry?: number;

  @ApiPropertyOptional({ description: 'One-way rental fee in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  oneWayFeeTry?: number;

  @ApiPropertyOptional({ description: 'Security deposit in TRY' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depositTry?: number;

  @ApiPropertyOptional({ description: 'Minimum rental days', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minRentalDays?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
