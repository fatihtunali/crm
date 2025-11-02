import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsBoolean, IsOptional, ArrayMaxSize } from 'class-validator';
import { CreateClientDto } from './create-client.dto';

export class BulkImportClientsDto {
  @ApiProperty({
    description: 'Array of clients to import',
    type: [CreateClientDto],
    example: [
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+905551234567',
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+905559876543',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClientDto)
  @ArrayMaxSize(1000, { message: 'Cannot import more than 1000 clients at once' })
  clients!: CreateClientDto[];

  @ApiProperty({
    description: 'If true, all imports succeed or all fail (atomic transaction)',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  atomic?: boolean;

  @ApiProperty({
    description: 'If true, only validate without actually importing',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  dryRun?: boolean;

  @ApiProperty({
    description: 'If true, skip duplicate clients instead of failing',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  skipDuplicates?: boolean;
}

export interface BulkImportResult {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    client: Partial<CreateClientDto>;
    error: string;
  }>;
  imported: Array<{
    row: number;
    id: number;
    name: string;
    email?: string;
  }>;
  skipped: Array<{
    row: number;
    client: Partial<CreateClientDto>;
    reason: string;
  }>;
}
