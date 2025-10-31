import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsDecimal,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateVendorRateDto {
  @ApiProperty({ example: 1, description: 'Vendor ID' })
  @IsInt()
  vendorId!: number;

  @ApiProperty({
    example: '2024-04-01T00:00:00Z',
    description: 'Season start date',
  })
  @IsDateString()
  seasonFrom!: string;

  @ApiProperty({
    example: '2024-10-31T00:00:00Z',
    description: 'Season end date',
  })
  @IsDateString()
  seasonTo!: string;

  @ApiProperty({
    example: 'Double Room per night',
    description: 'Service type description',
  })
  @IsString()
  serviceType!: string;

  @ApiProperty({ example: 2500.0, description: 'Cost in TRY' })
  @IsDecimal()
  costTry!: number;

  @ApiProperty({ example: 'Breakfast included', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
