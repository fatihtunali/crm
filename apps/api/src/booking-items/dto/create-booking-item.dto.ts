import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsEnum,
  IsDecimal,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { ItemType } from '@tour-crm/shared';

export class CreateBookingItemDto {
  @ApiProperty({ example: 1, description: 'Booking ID' })
  @IsInt()
  bookingId!: number;

  @ApiProperty({ enum: ItemType, example: ItemType.HOTEL, description: 'Item type' })
  @IsEnum(ItemType)
  itemType!: ItemType;

  // Legacy vendor reference (deprecated but kept for backward compatibility)
  @ApiPropertyOptional({ example: 1, description: 'Legacy vendor ID (deprecated)' })
  @IsInt()
  @IsOptional()
  vendorId?: number;

  // New catalog reference with auto-pricing
  @ApiPropertyOptional({ example: 1, description: 'Service offering ID from catalog' })
  @IsInt()
  @IsOptional()
  serviceOfferingId?: number;

  @ApiPropertyOptional({ example: '2025-06-15', description: 'Service date for pricing calculation (required with serviceOfferingId)' })
  @ValidateIf((o) => o.serviceOfferingId !== undefined)
  @IsDateString()
  serviceDate?: string;

  // Optional pricing parameters for catalog items
  @ApiPropertyOptional({ example: 2, description: 'Number of passengers/participants' })
  @IsOptional()
  @IsInt()
  @Min(1)
  pax?: number;

  @ApiPropertyOptional({ example: 3, description: 'Number of nights (hotels)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  nights?: number;

  @ApiPropertyOptional({ example: 5, description: 'Number of days (vehicles, guides)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @ApiPropertyOptional({ example: 8, description: 'Number of hours (transfers, guides)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hours?: number;

  @ApiPropertyOptional({ example: 150, description: 'Distance in km (transfers)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiPropertyOptional({ example: 1, description: 'Number of children (activities)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  // Manual pricing (used when not using catalog, or to override)
  @ApiPropertyOptional({ example: 2, description: 'Quantity', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  qty?: number;

  @ApiPropertyOptional({ example: 5000.0, description: 'Unit cost in TRY (manual override)' })
  @IsDecimal()
  @IsOptional()
  unitCostTry?: number;

  @ApiPropertyOptional({ example: 150.0, description: 'Unit price in EUR (manual override)' })
  @IsDecimal()
  @IsOptional()
  unitPriceEur?: number;

  @ApiPropertyOptional({ example: 'Standard double room with breakfast', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
