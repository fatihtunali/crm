import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class AuditLogFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by entity type (e.g., Booking, Client, Invoice)',
    example: 'Booking',
  })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: 123,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter by action type (e.g., CREATE, UPDATE, DELETE)',
    example: 'UPDATE',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (ISO 8601 format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (ISO 8601 format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
