import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineEntryDto, TimelineEntryType, TimelineResponseDto } from './dto/timeline-entry.dto';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive timeline of all client interactions and activities
   * Issue #42: Missing Activity Timeline implementation
   */
  async getClientTimeline(
    clientId: number,
    tenantId: number,
    limit?: number,
  ): Promise<TimelineResponseDto> {
    // Verify client exists and belongs to tenant
    const client = await this.prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Fetch all related data in parallel for optimal performance
    const [leads, quotations, bookings, payments, auditLogs] = await Promise.all([
      // Get all leads for this client
      this.prisma.lead.findMany({
        where: {
          clientId,
          tenantId,
        },
        orderBy: { inquiryDate: 'desc' },
      }),

      // Get all quotations for this client (via lead relationship)
      this.prisma.quotation.findMany({
        where: {
          lead: {
            clientId,
          },
          tenantId,
        },
        include: {
          lead: {
            select: {
              id: true,
              source: true,
            },
          },
          tour: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Get all bookings for this client
      this.prisma.booking.findMany({
        where: {
          clientId,
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Get all client payments
      this.prisma.paymentClient.findMany({
        where: {
          booking: {
            clientId,
          },
          tenantId,
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),

      // Get audit logs related to this client (limited to last 50)
      this.prisma.auditLog.findMany({
        where: {
          entity: 'Client',
          entityId: clientId,
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    // Transform each data type into timeline entries
    const timeline: TimelineEntryDto[] = [];

    // Add lead entries
    leads.forEach((lead) => {
      const totalPax = lead.paxAdults + lead.paxChildren;
      timeline.push({
        type: TimelineEntryType.LEAD,
        date: lead.inquiryDate,
        title: `Lead created from ${lead.source || 'Unknown source'}`,
        description: lead.notes || `Lead inquiry for ${lead.destination || 'tour'} - ${totalPax} pax`,
        data: {
          id: lead.id,
          source: lead.source,
          destination: lead.destination,
          status: lead.status,
          paxAdults: lead.paxAdults,
          paxChildren: lead.paxChildren,
          totalPax,
        },
      });
    });

    // Add quotation entries
    quotations.forEach((quotation) => {
      const tourName = quotation.tour?.name || 'Custom quotation';
      timeline.push({
        type: TimelineEntryType.QUOTATION,
        date: quotation.createdAt,
        title: `Quotation - ${quotation.status}`,
        description: `Total: €${Number(quotation.sellPriceEur).toFixed(2)} | ${tourName}`,
        data: {
          id: quotation.id,
          status: quotation.status,
          sellPriceEur: quotation.sellPriceEur,
          tourName,
          leadId: quotation.leadId,
        },
      });
    });

    // Add booking entries
    bookings.forEach((booking) => {
      timeline.push({
        type: TimelineEntryType.BOOKING,
        date: booking.createdAt,
        title: `Booking ${booking.bookingCode} - ${booking.status}`,
        description: `${booking.startDate.toISOString().split('T')[0]} to ${booking.endDate.toISOString().split('T')[0]} | €${Number(booking.totalSellEur).toFixed(2)}`,
        data: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalSellEur: booking.totalSellEur,
        },
      });
    });

    // Add payment entries
    payments.forEach((payment) => {
      timeline.push({
        type: TimelineEntryType.PAYMENT,
        date: payment.paidAt,
        title: `Payment received: €${Number(payment.amountEur).toFixed(2)}`,
        description: `Method: ${payment.method} | Booking: ${payment.booking.bookingCode} | Status: ${payment.status}`,
        data: {
          id: payment.id,
          amountEur: payment.amountEur,
          method: payment.method,
          status: payment.status,
          bookingId: payment.bookingId,
          bookingCode: payment.booking.bookingCode,
          txnRef: payment.txnRef,
        },
      });
    });

    // Add audit log entries
    auditLogs.forEach((log) => {
      timeline.push({
        type: TimelineEntryType.AUDIT,
        date: log.createdAt,
        title: `${log.action.replace(/_/g, ' ')}`,
        description: log.diffJson ? JSON.stringify(log.diffJson) : log.action,
        data: {
          id: log.id,
          action: log.action,
          userId: log.userId,
          entity: log.entity,
          entityId: log.entityId,
          diffJson: log.diffJson,
        },
      });
    });

    // Sort all entries by date descending (most recent first)
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply limit if specified
    const limitedTimeline = limit ? timeline.slice(0, limit) : timeline;

    return {
      timeline: limitedTimeline,
      total: timeline.length,
      clientId,
    };
  }
}
