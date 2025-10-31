import { IsString, IsInt, IsOptional, IsIn, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RequestUploadUrlDto {
  @ApiProperty({
    description: 'Original file name with extension',
    example: 'passport-scan.pdf',
  })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsIn([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ])
  mimeType!: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fileSize!: number;

  @ApiPropertyOptional({
    description: 'Entity type this file belongs to (e.g., Client, Booking, Invoice)',
    example: 'Client',
  })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({
    description: 'Entity ID this file belongs to',
    example: 123,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number;
}
