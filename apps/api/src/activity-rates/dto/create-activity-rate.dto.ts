import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PricingModel } from '@prisma/client';

export class CreateActivityRateDto {
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

  @IsInt()
  @IsOptional()
  minPax?: number;

  @IsInt()
  @IsOptional()
  maxPax?: number;

  @IsObject()
  @IsOptional()
  tieredPricingJson?: any;

  @IsNumber()
  @IsOptional()
  childDiscountPct?: number;

  @IsNumber()
  @IsOptional()
  groupDiscountPct?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
