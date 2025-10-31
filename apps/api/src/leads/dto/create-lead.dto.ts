import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { LeadStatus } from '@tour-crm/shared';

export class CreateLeadDto {
  @ApiProperty({ example: 1, required: false, description: 'Client ID (optional, can create lead without client)' })
  @IsInt()
  @IsOptional()
  clientId?: number;

  @ApiProperty({ example: 'Website form', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: '2025-11-15' })
  @IsDateString()
  inquiryDate!: string;

  @ApiProperty({ example: 'Istanbul & Cappadocia', required: false })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiProperty({ example: 2, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  paxAdults?: number;

  @ApiProperty({ example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  paxChildren?: number;

  @ApiProperty({ example: 2500.00, required: false })
  @IsNumber()
  @IsOptional()
  budgetEur?: number;

  @ApiProperty({ enum: LeadStatus, example: LeadStatus.NEW, default: LeadStatus.NEW })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ example: 'Client interested in luxury 5-star hotels', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
