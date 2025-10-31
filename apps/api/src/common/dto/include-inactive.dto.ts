import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class IncludeInactiveDto {
  @ApiProperty({
    description: 'Include inactive (soft-deleted) records in the results',
    example: false,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  include?: boolean = false;
}
