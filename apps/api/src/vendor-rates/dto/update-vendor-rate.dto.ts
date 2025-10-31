import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsDecimal,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class UpdateVendorRateDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  vendorId?: number;

  @ApiProperty({ example: '2024-04-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  seasonFrom?: string;

  @ApiProperty({ example: '2024-10-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  seasonTo?: string;

  @ApiProperty({ example: 'Double Room per night', required: false })
  @IsString()
  @IsOptional()
  serviceType?: string;

  @ApiProperty({ example: 2500.0, required: false })
  @IsDecimal()
  @IsOptional()
  costTry?: number;

  @ApiProperty({ example: 'Breakfast included', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
