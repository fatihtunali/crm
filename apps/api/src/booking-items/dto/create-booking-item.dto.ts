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

export class CreateBookingItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  bookingId!: number;

  @ApiProperty({ enum: ItemType, example: ItemType.HOTEL })
  @IsEnum(ItemType)
  itemType!: ItemType;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  vendorId?: number;

  @ApiProperty({ example: 2, default: 1 })
  @IsInt()
  @Min(1)
  qty: number = 1;

  @ApiProperty({ example: 5000.0 })
  @IsDecimal()
  unitCostTry!: number;

  @ApiProperty({ example: 150.0 })
  @IsDecimal()
  unitPriceEur!: number;

  @ApiProperty({ example: 'Standard double room with breakfast', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
