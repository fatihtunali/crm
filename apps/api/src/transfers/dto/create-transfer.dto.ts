import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { TransferType } from '@prisma/client';

export class CreateTransferDto {
  @ApiProperty({ description: 'Service offering ID' })
  @IsInt()
  serviceOfferingId!: number;

  @ApiProperty({ description: 'Origin zone', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  originZone!: string;

  @ApiProperty({ description: 'Destination zone', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  destZone!: string;

  @ApiProperty({
    description: 'Transfer type',
    enum: TransferType,
  })
  @IsEnum(TransferType)
  transferType!: TransferType;

  @ApiProperty({ description: 'Vehicle class (sedan, van, minibus, coach)', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  vehicleClass!: string;

  @ApiPropertyOptional({ description: 'Passenger capacity', default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Meet and greet service', default: false })
  @IsOptional()
  @IsBoolean()
  meetGreet?: boolean;

  @ApiPropertyOptional({ description: 'Luggage allowance', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  luggageAllowance?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Distance in kilometers' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distance?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
