import { ApiProperty } from '@nestjs/swagger';

export enum TimelineEntryType {
  LEAD = 'LEAD',
  QUOTATION = 'QUOTATION',
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  AUDIT = 'AUDIT',
}

export class TimelineEntryDto {
  @ApiProperty({
    enum: TimelineEntryType,
    description: 'Type of timeline entry',
    example: 'BOOKING',
  })
  type!: TimelineEntryType;

  @ApiProperty({
    description: 'Date of the event',
    type: Date,
    example: '2024-11-01T10:30:00Z',
  })
  date!: Date;

  @ApiProperty({
    description: 'Title/summary of the event',
    example: 'Booking BK-2024-001 - CONFIRMED',
  })
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: '2024-12-15 to 2024-12-20',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Associated data object for the event',
    type: 'object',
    required: false,
  })
  data?: any;
}

export class TimelineResponseDto {
  @ApiProperty({
    description: 'Array of timeline entries',
    type: [TimelineEntryDto],
  })
  timeline!: TimelineEntryDto[];

  @ApiProperty({
    description: 'Total number of timeline entries',
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: 'Client ID',
    example: 1,
  })
  clientId!: number;
}
