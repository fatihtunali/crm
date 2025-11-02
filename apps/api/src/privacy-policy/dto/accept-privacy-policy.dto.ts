import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class AcceptPrivacyPolicyDto {
  @ApiProperty({ description: 'Privacy policy version being accepted', example: '1.0.0' })
  @IsString()
  version!: string;

  @ApiProperty({ description: 'User ID accepting the policy (optional)', required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ description: 'Client ID accepting the policy (optional)', required: false })
  @IsOptional()
  @IsInt()
  clientId?: number;
}
