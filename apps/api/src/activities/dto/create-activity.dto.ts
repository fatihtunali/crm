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

export class CreateActivityDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Operator name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  operatorName!: string;

  @ApiProperty({ description: 'Activity type (tour, attraction, experience)', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  activityType!: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Maximum participants capacity' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Minimum age requirement' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiPropertyOptional({ description: 'Maximum age limit' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAge?: number;

  @ApiPropertyOptional({ description: 'Difficulty level (easy, moderate, difficult)', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Included items (e.g., ["entrance", "guide", "lunch", "equipment"])',
  })
  @IsOptional()
  @IsObject()
  includedItems?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Meeting point location' })
  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @ApiPropertyOptional({ description: 'Pickup service available', default: false })
  @IsOptional()
  @IsBoolean()
  pickupAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Cancellation policy details' })
  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
