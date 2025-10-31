import { IsOptional, IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PreferredLanguage {
  EN = 'en',
  TR = 'tr',
}

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({
    description: 'Preferred language for UI and notifications',
    enum: PreferredLanguage,
    example: PreferredLanguage.EN,
    required: false,
  })
  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage;
}
