import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BoardType } from '@prisma/client';

export class CreateHotelRoomRateDto {
  @IsInt()
  @IsNotEmpty()
  serviceOfferingId!: number;

  @Type(() => Date)
  @IsNotEmpty()
  seasonFrom!: Date;

  @Type(() => Date)
  @IsNotEmpty()
  seasonTo!: Date;

  @IsEnum(BoardType)
  @IsNotEmpty()
  boardType!: BoardType;

  @IsNumber()
  @IsNotEmpty()
  pricePerPersonDouble!: number;

  @IsNumber()
  @IsNotEmpty()
  singleSupplement!: number;

  @IsNumber()
  @IsNotEmpty()
  pricePerPersonTriple!: number;

  @IsNumber()
  @IsNotEmpty()
  childPrice0to2!: number;

  @IsNumber()
  @IsNotEmpty()
  childPrice3to5!: number;

  @IsNumber()
  @IsNotEmpty()
  childPrice6to11!: number;

  @IsInt()
  @IsOptional()
  allotment?: number;

  @IsInt()
  @IsOptional()
  releaseDays?: number;

  @IsInt()
  @IsOptional()
  minStay?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
