import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Number of seats', default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiProperty({ description: 'Vehicle class (economy, comfort, luxury, SUV, van)', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  vehicleClass!: string;

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
