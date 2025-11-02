import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PricingModel } from '@prisma/client';

export class CreateTransferRateDto {
  @IsInt()
  @IsNotEmpty()
  serviceOfferingId!: number;

  @Type(() => Date)
  @IsNotEmpty()
  seasonFrom!: Date;

  @Type(() => Date)
  @IsNotEmpty()
  seasonTo!: Date;

  @IsEnum(PricingModel)
  @IsOptional()
  pricingModel?: PricingModel;

  @IsNumber()
  @IsNotEmpty()
  baseCostTry!: number;

  @IsNumber()
  @IsOptional()
  includedKm?: number;

  @IsNumber()
  @IsOptional()
  includedHours?: number;

  @IsNumber()
  @IsOptional()
  extraKmTry?: number;

  @IsNumber()
  @IsOptional()
  extraHourTry?: number;

  @IsNumber()
  @IsOptional()
  nightSurchargePct?: number;

  @IsNumber()
  @IsOptional()
  holidaySurchargePct?: number;

  @IsInt()
  @IsOptional()
  waitingTimeFree?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
