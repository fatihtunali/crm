import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ description: 'Party ID' })
  @IsInt()
  partyId: number;

  @ApiProperty({ description: 'Contact type (e.g., operations, accounting, sales)', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  contactType: string;

  @ApiProperty({ description: 'Contact name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Position/Title', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ description: 'Is primary contact', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
