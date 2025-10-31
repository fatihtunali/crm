import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsNumber,
  IsDecimal,
  MaxLength,
  Min,
} from 'class-validator';
import { SupplierType } from '@prisma/client';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Party ID' })
  @IsInt()
  partyId!: number;

  @ApiProperty({
    description: 'Supplier type',
    enum: SupplierType,
  })
  @IsEnum(SupplierType)
  type!: SupplierType;

  @ApiPropertyOptional({ description: 'Bank name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank account number', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountNo?: string;

  @ApiPropertyOptional({ description: 'Bank IBAN', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankIban?: string;

  @ApiPropertyOptional({ description: 'Bank SWIFT code', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankSwift?: string;

  @ApiPropertyOptional({ description: 'Payment terms', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Default currency', default: 'TRY' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  defaultCurrency?: string;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Commission percentage', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commissionPct?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
