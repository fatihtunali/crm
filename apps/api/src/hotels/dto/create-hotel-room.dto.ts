import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateHotelRoomDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Hotel name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  hotelName!: string;

  @ApiPropertyOptional({ description: 'Star rating (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  stars?: number;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Country', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Geo coordinates (lat,lng)', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  geo?: string;

  @ApiProperty({ description: 'Room type (e.g., DBL, TWN, TRP, SUITE)', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  roomType!: string;

  @ApiPropertyOptional({ description: 'Maximum occupancy', default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxOccupancy?: number;

  @ApiPropertyOptional({ description: 'Available board types (RO, BB, HB, FB, AI)' })
  @IsOptional()
  @IsArray()
  boardTypes?: string[];

  @ApiPropertyOptional({ description: 'Amenities (wifi, pool, spa, parking, etc.)' })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Check-in time (e.g., 14:00)', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  checkInTime?: string;

  @ApiPropertyOptional({ description: 'Check-out time (e.g., 11:00)', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  checkOutTime?: string;

  @ApiPropertyOptional({ description: 'Cancellation policy' })
  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
