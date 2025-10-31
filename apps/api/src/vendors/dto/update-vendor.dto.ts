import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { VendorType } from '@tour-crm/shared';

export class UpdateVendorDto {
  @ApiProperty({ example: 'Grand Istanbul Hotel', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: VendorType, example: VendorType.HOTEL, required: false })
  @IsEnum(VendorType)
  @IsOptional()
  type?: VendorType;

  @ApiProperty({ example: 'Mehmet Yılmaz', required: false })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiProperty({ example: '+90 212 555 1234', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'reservations@grandistanbul.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'TR9876543210', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ example: 'Sultanahmet, Istanbul', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Preferred hotel for group bookings', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
