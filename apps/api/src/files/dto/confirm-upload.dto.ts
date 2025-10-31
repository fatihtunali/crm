import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ConfirmUploadDto {
  @ApiProperty({
    description: 'File ID to confirm upload',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  fileId!: number;
}
