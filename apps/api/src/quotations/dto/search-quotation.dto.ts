import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuotationStatus } from '@tour-crm/shared';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchQuotationDto extends PaginationDto {
  @ApiProperty({
    description: 'Search by client name (from lead)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({
    description: 'Search by tour name',
    example: 'Istanbul Heritage',
    required: false,
  })
  @IsOptional()
  @IsString()
  tourName?: string;

  @ApiProperty({
    description: 'Filter by quotation status',
    enum: QuotationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @ApiProperty({
    description: 'Filter by created date from (ISO 8601)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({
    description: 'Filter by created date to (ISO 8601)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiProperty({
    description: 'Filter by valid until date',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
