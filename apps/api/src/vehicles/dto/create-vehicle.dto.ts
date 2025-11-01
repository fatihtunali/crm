import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleClass } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Vehicle make', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  make!: string;

  @ApiProperty({ description: 'Vehicle model', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  model!: string;

  @ApiPropertyOptional({ description: 'Manufacturing year' })
  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @ApiPropertyOptional({ description: 'Plate number', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plateNumber?: string;

  @ApiProperty({
    description: 'Vehicle class',
    enum: VehicleClass,
    example: 'VITO',
  })
  @IsEnum(VehicleClass)
  vehicleClass!: VehicleClass;

  @ApiProperty({ description: 'Maximum passengers', example: 4 })
  @IsInt()
  @Min(1)
  maxPassengers!: number;

  @ApiPropertyOptional({ description: 'Transmission type (automatic, manual)', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  transmission?: string;

  @ApiPropertyOptional({ description: 'Fuel type (petrol, diesel, electric, hybrid)', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fuelType?: string;

  @ApiPropertyOptional({ description: 'Vehicle comes with driver', default: false })
  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @ApiPropertyOptional({
    description: 'Features (e.g., ["GPS", "child_seat", "wifi", "AC"])',
  })
  @IsOptional()
  @IsObject()
  features?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Insurance included', default: true })
  @IsOptional()
  @IsBoolean()
  insuranceIncluded?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
