import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsArray,
  IsInt,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CityNightDto {
  @ApiProperty({
    description: 'City name',
    example: 'Istanbul',
  })
  @IsString()
  city!: string;

  @ApiProperty({
    description: 'Number of nights in this city',
    example: 3,
  })
  @IsInt()
  @Min(1)
  nights!: number;
}

export class GenerateItineraryDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsString()
  customerName!: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john@example.com',
  })
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({
    description: 'Main destination or tour name',
    example: 'Turkey Grand Tour',
  })
  @IsString()
  destination!: string;

  @ApiProperty({
    description: 'Cities and nights breakdown',
    type: [CityNightDto],
    example: [
      { city: 'Istanbul', nights: 3 },
      { city: 'Cappadocia', nights: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CityNightDto)
  cityNights!: CityNightDto[];

  @ApiProperty({
    description: 'Tour start date',
    example: '2025-11-15',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Number of adults',
    example: 2,
  })
  @IsInt()
  @Min(1)
  adults!: number;

  @ApiPropertyOptional({
    description: 'Number of children',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({
    description: 'Preferred hotel category',
    example: '4 stars',
    enum: ['3 stars', '4 stars', '5 stars'],
  })
  @IsOptional()
  @IsString()
  hotelCategory?: string;

  @ApiPropertyOptional({
    description: 'Tour type preference',
    enum: ['SIC', 'PRIVATE'],
    example: 'SIC',
  })
  @IsOptional()
  @IsEnum(['SIC', 'PRIVATE'])
  tourType?: 'SIC' | 'PRIVATE';

  @ApiPropertyOptional({
    description: 'Special requests or preferences',
    example: 'Vegetarian meals, wheelchair accessible',
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
