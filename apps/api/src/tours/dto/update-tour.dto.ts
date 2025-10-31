import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsDecimal,
  IsDateString,
  Min,
  IsBoolean
} from 'class-validator';

export class UpdateTourDto {
  @ApiProperty({ example: 'IST-7D', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: '7 Days Istanbul & Cappadocia', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Explore the wonders of Istanbul and magical landscapes of Cappadocia',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 20, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  baseCapacity?: number;

  @ApiProperty({ example: '2024-04-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  seasonStart?: string;

  @ApiProperty({ example: '2024-10-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  seasonEnd?: string;

  @ApiProperty({ example: 25.00, required: false })
  @IsDecimal()
  @IsOptional()
  defaultMarkupPct?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
