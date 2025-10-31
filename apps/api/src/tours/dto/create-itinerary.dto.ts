import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class CreateItineraryDto {
  @ApiProperty({ example: 1, description: 'Day number of the tour' })
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @ApiProperty({ example: 'Istanbul City Tour', description: 'Title of the day' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Visit Hagia Sophia, Blue Mosque, and Grand Bazaar',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Private bus transfer', required: false })
  @IsString()
  @IsOptional()
  transport?: string;

  @ApiProperty({ example: 'Grand Istanbul Hotel 5*', required: false })
  @IsString()
  @IsOptional()
  accommodation?: string;

  @ApiProperty({ example: 'Breakfast, Lunch, Dinner', required: false })
  @IsString()
  @IsOptional()
  meals?: string;
}
