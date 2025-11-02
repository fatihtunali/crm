import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum ConsentPurpose {
  DATA_PROCESSING = 'DATA_PROCESSING',
  MARKETING_EMAIL = 'MARKETING_EMAIL',
  MARKETING_SMS = 'MARKETING_SMS',
  MARKETING_PHONE = 'MARKETING_PHONE',
  ANALYTICS = 'ANALYTICS',
  THIRD_PARTY_SHARING = 'THIRD_PARTY_SHARING',
  PROFILING = 'PROFILING',
}

export class CreateConsentDto {
  @ApiProperty({ description: 'Client ID for whom consent is being granted' })
  @IsInt()
  clientId!: number;

  @ApiProperty({
    description: 'Purpose of the consent',
    enum: ConsentPurpose,
    example: ConsentPurpose.DATA_PROCESSING
  })
  @IsEnum(ConsentPurpose)
  purpose!: ConsentPurpose;

  @ApiProperty({ description: 'Whether consent is granted or not', default: true })
  @IsBoolean()
  granted!: boolean;

  @ApiProperty({ description: 'Privacy policy version', example: '1.0.0' })
  @IsString()
  version!: string;

  @ApiProperty({ description: 'User ID who recorded the consent (optional)', required: false })
  @IsOptional()
  @IsInt()
  userId?: number;
}
