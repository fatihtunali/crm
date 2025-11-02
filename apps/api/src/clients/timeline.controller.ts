import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TimelineService } from './timeline.service';
import { TimelineResponseDto } from './dto/timeline-entry.dto';

@ApiTags('Client Timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients/:clientId/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({
    summary: 'Get client activity timeline',
    description: 'Retrieve a comprehensive timeline of all client interactions including leads, quotations, bookings, payments, and audit logs',
  })
  @ApiParam({
    name: 'clientId',
    description: 'Client ID',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of timeline entries to return (default: no limit)',
    type: Number,
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Timeline retrieved successfully',
    type: TimelineResponseDto,
    content: {
      'application/json': {
        example: {
          timeline: [
            {
              type: 'PAYMENT',
              date: '2024-11-01T10:30:00.000Z',
              title: 'Payment received: €500.00',
              description: 'Method: BANK_TRANSFER | Booking: BK-2024-001 | Status: COMPLETED',
              data: {
                id: 15,
                amountEur: 500,
                method: 'BANK_TRANSFER',
                status: 'COMPLETED',
                bookingId: 5,
                bookingCode: 'BK-2024-001',
                txnRef: 'TXN123456',
              },
            },
            {
              type: 'BOOKING',
              date: '2024-10-28T14:20:00.000Z',
              title: 'Booking BK-2024-001 - CONFIRMED',
              description: '2024-12-15 to 2024-12-20 | 2 pax | €1500.00',
              data: {
                id: 5,
                code: 'BK-2024-001',
                status: 'CONFIRMED',
                startDate: '2024-12-15',
                endDate: '2024-12-20',
                pax: 2,
                totalSellEur: 1500,
              },
            },
            {
              type: 'QUOTATION',
              date: '2024-10-25T09:15:00.000Z',
              title: 'Quotation QT-2024-001 - ACCEPTED',
              description: 'Total: €1500.00 | Istanbul & Cappadocia Tour',
              data: {
                id: 3,
                code: 'QT-2024-001',
                status: 'ACCEPTED',
                totalSellEur: 1500,
                tourName: 'Istanbul & Cappadocia Tour',
                leadId: 2,
              },
            },
            {
              type: 'LEAD',
              date: '2024-10-20T08:00:00.000Z',
              title: 'Lead created from WEBSITE',
              description: 'Lead inquiry for Istanbul',
              data: {
                id: 2,
                source: 'WEBSITE',
                destination: 'Istanbul',
                status: 'CONVERTED',
                pax: 2,
              },
            },
          ],
          total: 4,
          clientId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTimeline(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ): Promise<TimelineResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    return this.timelineService.getClientTimeline(clientId, user.tenantId, limitNum);
  }
}
