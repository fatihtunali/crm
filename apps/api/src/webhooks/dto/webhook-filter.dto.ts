import { IsString, IsOptional, IsIn, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { WebhookEventStatus, WebhookEventType } from '@prisma/client';

export class WebhookFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by payment provider',
    example: 'stripe',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Filter by webhook event type',
    enum: WebhookEventType,
    example: 'PAYMENT_SUCCESS',
  })
  @IsOptional()
  @IsEnum(WebhookEventType)
  eventType?: WebhookEventType;

  @ApiPropertyOptional({
    description: 'Filter by webhook status',
    enum: WebhookEventStatus,
    example: 'SUCCESS',
  })
  @IsOptional()
  @IsEnum(WebhookEventStatus)
  status?: WebhookEventStatus;

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
    description: 'Filter by verification status',
    example: 'true',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  isVerified?: string;
}
