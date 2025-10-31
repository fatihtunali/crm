import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@tour-crm/shared';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchBookingDto extends PaginationDto {
  @ApiProperty({
    description: 'Search by booking code',
    example: 'BK-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  bookingCode?: string;

  @ApiProperty({
    description: 'Search by client name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({
    description: 'Search by client email',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientEmail?: string;

  @ApiProperty({
    description: 'Filter by booking status',
    enum: BookingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Filter by start date from (ISO 8601)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiProperty({
    description: 'Filter by start date to (ISO 8601)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;
}
