import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreateServiceOfferingDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsInt()
  supplierId: number;

  @ApiProperty({
    description: 'Service type',
    enum: ServiceType,
  })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ description: 'Service title', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Location', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
