import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConsentPurpose } from './create-consent.dto';

export class ConsentPurposeDto {
  @ApiProperty({
    description: 'Purpose of consent',
    enum: ConsentPurpose
  })
  purpose!: ConsentPurpose;
}

export class BulkGrantConsentDto {
  @ApiProperty({ description: 'Client ID' })
  @IsInt()
  clientId!: number;

  @ApiProperty({
    description: 'Array of consent purposes to grant',
    type: [ConsentPurposeDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsentPurposeDto)
  purposes!: ConsentPurposeDto[];

  @ApiProperty({ description: 'Privacy policy version', example: '1.0.0' })
  @IsString()
  version!: string;
}
