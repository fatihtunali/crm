import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, Matches } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.smith@email.com', required: false })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+905551234567',
    description: 'Phone number in E.164 format (e.g., +905551234567)',
    required: false
  })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be in E.164 format (e.g., +905551234567)'
  })
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
