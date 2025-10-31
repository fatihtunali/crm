import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsDecimal,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItineraryDto } from './create-itinerary.dto';

export class CreateTourDto {
  @ApiProperty({ example: 'IST-7D', description: 'Unique tour code' })
  @IsString()
  code!: string;

  @ApiProperty({ example: '7 Days Istanbul & Cappadocia', description: 'Tour name' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Explore the wonders of Istanbul and magical landscapes of Cappadocia',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 20, description: 'Base capacity for pricing' })
  @IsInt()
  @Min(1)
  baseCapacity!: number;

  @ApiProperty({ example: '2024-04-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  seasonStart?: string;

  @ApiProperty({ example: '2024-10-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  seasonEnd?: string;

  @ApiProperty({ example: 25.00, description: 'Default markup percentage', required: false })
  @IsDecimal()
  @IsOptional()
  defaultMarkupPct?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    type: [CreateItineraryDto],
    description: 'Itinerary days for the tour',
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItineraryDto)
  @IsOptional()
  itineraries?: CreateItineraryDto[];
}
