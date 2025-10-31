import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEmail,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateGuideDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Guide name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  guideName!: string;

  @ApiPropertyOptional({ description: 'License number', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNo?: string;

  @ApiProperty({
    description: 'Languages spoken (e.g., ["English", "Turkish", "Spanish"])',
  })
  @IsObject()
  languages!: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Regions covered (e.g., ["Istanbul", "Cappadocia", "Ephesus"])',
  })
  @IsOptional()
  @IsObject()
  regions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Specializations (e.g., ["historical", "adventure", "culinary"])',
  })
  @IsOptional()
  @IsObject()
  specializations?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Maximum group size', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGroupSize?: number;

  @ApiPropertyOptional({ description: 'Rating (0.00 - 5.00)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address', maxLength: 255 })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
