import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleRateDto {
  @IsInt()
  @IsNotEmpty()
  serviceOfferingId: number;

  @Type(() => Date)
  @IsNotEmpty()
  seasonFrom: Date;

  @Type(() => Date)
  @IsNotEmpty()
  seasonTo: Date;

  @IsNumber()
  @IsNotEmpty()
  dailyRateTry: number;

  @IsNumber()
  @IsOptional()
  dailyKmIncluded?: number;

  @IsNumber()
  @IsNotEmpty()
  hourlyRateTry: number;

  @IsInt()
  @IsOptional()
  minHours?: number;

  @IsNumber()
  @IsOptional()
  extraKmTry?: number;

  @IsNumber()
  @IsOptional()
  driverDailyTry?: number;

  @IsNumber()
  @IsOptional()
  oneWayFeeTry?: number;

  @IsNumber()
  @IsOptional()
  depositTry?: number;

  @IsInt()
  @IsOptional()
  minRentalDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
