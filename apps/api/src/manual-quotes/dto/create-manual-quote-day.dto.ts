import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateManualQuoteExpenseDto } from './create-manual-quote-expense.dto';

export class CreateManualQuoteDayDto {
  @ApiProperty({
    description: 'Day number in the itinerary',
    example: 1,
  })
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @ApiProperty({
    description: 'Date for this day',
    example: '2025-11-15',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Expenses for this day',
    type: [CreateManualQuoteExpenseDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateManualQuoteExpenseDto)
  expenses?: CreateManualQuoteExpenseDto[];
}
