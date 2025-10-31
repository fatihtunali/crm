import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@tour-crm/shared';

export class ReportFilterDto {
  @ApiProperty({
    description: 'Start date for the report (ISO 8601)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'End date for the report (ISO 8601)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class LeadReportFilterDto extends ReportFilterDto {
  @ApiProperty({
    description: 'Filter by lead status',
    enum: LeadStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
