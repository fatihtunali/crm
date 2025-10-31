import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class QuoteRequestDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Service date (YYYY-MM-DD)' })
  @IsDateString()
  serviceDate!: string;

  @ApiPropertyOptional({ description: 'Number of passengers/participants', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pax?: number;

  @ApiPropertyOptional({ description: 'Number of nights (for hotels)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  nights?: number;

  @ApiPropertyOptional({ description: 'Number of days (for vehicles/guides)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @ApiPropertyOptional({ description: 'Distance in kilometers (for transfers)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiPropertyOptional({ description: 'Duration in hours (for transfers/guides)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hours?: number;

  @ApiPropertyOptional({ description: 'Number of children' })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;
}
