import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.smith@email.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1 555 123 4567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'American', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ example: 'en', required: false, default: 'en' })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({ example: 'AB1234567', required: false })
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @ApiProperty({ example: '1985-06-15', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: 'VIP client, prefers luxury hotels', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
