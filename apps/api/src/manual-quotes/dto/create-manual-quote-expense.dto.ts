import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateManualQuoteExpenseDto {
  @ApiProperty({
    description: 'Expense category',
    example: 'hotelAccommodation',
    enum: [
      'hotelAccommodation',
      'meals',
      'entranceFees',
      'sicTourCost',
      'tips',
      'transportation',
      'guide',
      'guideDriverAccommodation',
      'parking',
    ],
  })
  @IsString()
  category!: string;

  @ApiPropertyOptional({
    description: 'Hotel category (for hotel accommodations)',
    example: '4 stars',
  })
  @IsOptional()
  @IsString()
  hotelCategory?: string;

  @ApiPropertyOptional({
    description: 'Location/venue name',
    example: 'Istanbul',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example: 'Overnight stay at 4-star hotel in Istanbul',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Base price per person',
    example: 50.0,
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    description: 'Single supplement charge',
    example: 25.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  singleSupplement?: number;

  @ApiPropertyOptional({
    description: 'Child pricing (age 0-2)',
    example: 0.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  child0to2?: number;

  @ApiPropertyOptional({
    description: 'Child pricing (age 3-5)',
    example: 25.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  child3to5?: number;

  @ApiPropertyOptional({
    description: 'Child pricing (age 6-11)',
    example: 35.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  child6to11?: number;

  @ApiPropertyOptional({
    description: 'Number of vehicles (for transportation pricing)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  vehicleCount?: number;

  @ApiPropertyOptional({
    description: 'Price per vehicle (for vehicle-based pricing)',
    example: 150.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerVehicle?: number;
}
