import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsEnum,
  IsDecimal,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { ItemType } from '@tour-crm/shared';

export class UpdateBookingItemDto {
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  bookingId?: number;

  @ApiProperty({ enum: ItemType, example: ItemType.HOTEL, required: false })
  @IsEnum(ItemType)
  @IsOptional()
  itemType?: ItemType;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  vendorId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  qty?: number;

  @ApiProperty({ example: 5000.0, required: false })
  @IsDecimal()
  @IsOptional()
  unitCostTry?: number;

  @ApiProperty({ example: 150.0, required: false })
  @IsDecimal()
  @IsOptional()
  unitPriceEur?: number;

  @ApiProperty({
    example: 'Standard double room with breakfast',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
