import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PricingModel } from '@prisma/client';

export class CreateGuideRateDto {
  @IsInt()
  @IsNotEmpty()
  serviceOfferingId: number;

  @Type(() => Date)
  @IsNotEmpty()
  seasonFrom: Date;

  @Type(() => Date)
  @IsNotEmpty()
  seasonTo: Date;

  @IsEnum(PricingModel)
  @IsOptional()
  pricingModel?: PricingModel;

  @IsNumber()
  @IsOptional()
  dayCostTry?: number;

  @IsNumber()
  @IsOptional()
  halfDayCostTry?: number;

  @IsNumber()
  @IsOptional()
  hourCostTry?: number;

  @IsNumber()
  @IsOptional()
  overtimeHourTry?: number;

  @IsNumber()
  @IsOptional()
  holidaySurchargePct?: number;

  @IsInt()
  @IsOptional()
  minHours?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
