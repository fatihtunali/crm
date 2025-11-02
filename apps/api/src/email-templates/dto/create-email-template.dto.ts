import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsBoolean, IsOptional, MaxLength, ArrayMaxSize } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({
    example: 'QUOTATION_SENT',
    description: 'Unique template name (e.g., QUOTATION_SENT, BOOKING_CONFIRMED)',
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Your Tour Quotation - {{quotationId}}',
    description: 'Email subject line (supports variables like {{variableName}})',
  })
  @IsString()
  @MaxLength(500)
  subject!: string;

  @ApiProperty({
    example: '<h2>Dear {{clientName}},</h2><p>Your quotation is ready...</p>',
    description: 'HTML email body with variable placeholders',
  })
  @IsString()
  bodyHtml!: string;

  @ApiProperty({
    example: 'Dear {{clientName}}, Your quotation is ready...',
    description: 'Plain text email body with variable placeholders',
  })
  @IsString()
  bodyText!: string;

  @ApiProperty({
    example: ['clientName', 'quotationId', 'tourName', 'totalPrice'],
    description: 'List of available variables for this template',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  variables!: string[];

  @ApiProperty({
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
