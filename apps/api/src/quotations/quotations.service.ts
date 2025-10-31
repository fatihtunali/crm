import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { SearchQuotationDto } from './dto/search-quotation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { QuotationStatus } from '@tour-crm/shared';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, status?: QuotationStatus): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'createdAt', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              source: true,
              notes: true,
            },
          },
          tour: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        lead: {
          select: {
            id: true,
            source: true,
            notes: true,
          },
        },
        tour: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            itineraries: {
              orderBy: { dayNumber: 'asc' },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async create(createQuotationDto: CreateQuotationDto, tenantId: number) {
    const quotation = await this.prisma.quotation.create({
      data: {
        tenantId,
        leadId: createQuotationDto.leadId,
        tourId: createQuotationDto.tourId,
        customJson: createQuotationDto.customJson,
        calcCostTry: createQuotationDto.calcCostTry,
        sellPriceEur: createQuotationDto.sellPriceEur,
        exchangeRateUsed: createQuotationDto.exchangeRateUsed,
        validUntil: createQuotationDto.validUntil,
        status: createQuotationDto.status ?? QuotationStatus.DRAFT,
        notes: createQuotationDto.notes,
      },
      include: {
        lead: {
          select: {
            id: true,
            source: true,
            notes: true,
          },
        },
        tour: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return quotation;
  }

  async update(
    id: number,
    updateQuotationDto: UpdateQuotationDto,
    tenantId: number,
  ) {
    // Check if quotation exists
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        leadId: updateQuotationDto.leadId,
        tourId: updateQuotationDto.tourId,
        customJson: updateQuotationDto.customJson,
        calcCostTry: updateQuotationDto.calcCostTry,
        sellPriceEur: updateQuotationDto.sellPriceEur,
        exchangeRateUsed: updateQuotationDto.exchangeRateUsed,
        validUntil: updateQuotationDto.validUntil,
        status: updateQuotationDto.status,
        notes: updateQuotationDto.notes,
      },
      include: {
        lead: {
          select: {
            id: true,
            source: true,
            notes: true,
          },
        },
        tour: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updatedQuotation;
  }

  async remove(id: number, tenantId: number) {
    // Check if quotation exists
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    // Hard delete since there's no isActive field
    await this.prisma.quotation.delete({
      where: { id },
    });

    return { message: 'Quotation deleted successfully' };
  }

  async getStatsByStatus(tenantId: number) {
    const stats = await this.prisma.quotation.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
      _sum: {
        calcCostTry: true,
        sellPriceEur: true,
      },
    });

    return stats.map((stat) => ({
      status: stat.status,
      count: stat._count.id,
      totalCostTry: stat._sum.calcCostTry || 0,
      totalPriceEur: stat._sum.sellPriceEur || 0,
    }));
  }

  // Workflow methods
  async sendQuotation(id: number, tenantId: number) {
    // Verify quotation exists and belongs to tenant
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        lead: {
          include: {
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    // Validate status transition
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new Error(
        `Cannot send quotation with status ${quotation.status}. Only DRAFT quotations can be sent.`,
      );
    }

    // Validate client email exists
    if (!quotation.lead?.client?.email) {
      throw new Error(
        'Cannot send quotation: No email address found for the associated client.',
      );
    }

    // Update status to SENT
    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: QuotationStatus.SENT },
      include: {
        lead: {
          include: {
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        tour: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    // TODO: Send email notification to client
    // For now, we'll just log it
    // await this.emailService.sendQuotation(updatedQuotation);

    return {
      ...updatedQuotation,
      message: `Quotation sent successfully to ${quotation.lead.client.email}`,
    };
  }

  async acceptQuotation(id: number, tenantId: number) {
    // Verify quotation exists and belongs to tenant
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        lead: {
          include: {
            client: true,
          },
        },
        tour: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    // Validate status transition
    if (quotation.status !== QuotationStatus.SENT) {
      throw new Error(
        `Cannot accept quotation with status ${quotation.status}. Only SENT quotations can be accepted.`,
      );
    }

    // Validate that lead has a client
    if (!quotation.lead?.client) {
      throw new Error(
        'Cannot accept quotation: No client associated with this quotation.',
      );
    }

    const acceptanceDate = new Date();
    const clientId = quotation.lead.client.id;

    // Get the latest exchange rate for the acceptance date (TRY → EUR)
    const exchangeRate = await this.prisma.exchangeRate.findFirst({
      where: {
        tenantId,
        fromCurrency: 'TRY',
        toCurrency: 'EUR',
        rateDate: {
          lte: acceptanceDate,
        },
      },
      orderBy: { rateDate: 'desc' },
    });

    if (!exchangeRate) {
      throw new Error(
        'Cannot accept quotation: No exchange rate found for TRY to EUR. Please add exchange rates first.',
      );
    }

    // Parse items from customJson
    const quotationItems = (quotation.customJson as any)?.items || [];

    // Use Prisma transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Generate booking code
      const bookingCount = await tx.booking.count({ where: { tenantId } });
      const bookingCode = `BK-${new Date().getFullYear()}-${String(bookingCount + 1).padStart(4, '0')}`;

      // Determine start/end dates from tour or custom data
      const tourDuration = 7; // Default tour duration
      const startDate = (quotation.customJson as any)?.startDate
        ? new Date((quotation.customJson as any).startDate)
        : new Date(acceptanceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const endDate = new Date(
        startDate.getTime() + tourDuration * 24 * 60 * 60 * 1000,
      );

      // Create booking with locked exchange rate
      const booking = await tx.booking.create({
        data: {
          tenantId,
          quotationId: id,
          clientId,
          bookingCode,
          startDate,
          endDate,
          lockedExchangeRate: exchangeRate.rate,
          totalCostTry: quotation.calcCostTry,
          totalSellEur: quotation.sellPriceEur,
          depositDueEur: Number(quotation.sellPriceEur) * 0.3, // 30% deposit
          balanceDueEur: Number(quotation.sellPriceEur) * 0.7, // 70% balance
          status: 'CONFIRMED',
          notes: quotation.notes || null,
        },
      });

      // Create booking items from quotation items
      if (quotationItems.length > 0) {
        await tx.bookingItem.createMany({
          data: quotationItems.map((item: any) => ({
            tenantId,
            bookingId: booking.id,
            itemType: item.itemType || 'FEE',
            vendorId: item.vendorId || null,
            qty: item.qty || 1,
            unitCostTry: item.unitCostTry || 0,
            unitPriceEur: item.unitPriceEur || 0,
            notes: item.notes || null,
          })),
        });
      }

      // Update quotation status to ACCEPTED
      const updatedQuotation = await tx.quotation.update({
        where: { id },
        data: { status: QuotationStatus.ACCEPTED },
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
              code: true,
              name: true,
            },
          },
          bookings: true,
        },
      });

      return { updatedQuotation, booking };
    });

    return {
      ...result.updatedQuotation,
      booking: result.booking,
      message: `Quotation accepted successfully. Booking ${result.booking.bookingCode} created with locked exchange rate ${exchangeRate.rate.toFixed(4)} (TRY/EUR).`,
    };
  }

  async rejectQuotation(id: number, tenantId: number) {
    // Verify quotation exists and belongs to tenant
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    // Validate status transition
    if (quotation.status !== QuotationStatus.SENT) {
      throw new Error(
        `Cannot reject quotation with status ${quotation.status}. Only SENT quotations can be rejected.`,
      );
    }

    // Update status to REJECTED
    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: { status: QuotationStatus.REJECTED },
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
            code: true,
            name: true,
          },
        },
      },
    });

    return {
      ...updatedQuotation,
      message: 'Quotation rejected.',
    };
  }

  async search(tenantId: number, searchDto: SearchQuotationDto): Promise<PaginatedResponse<any>> {
    const {
      skip,
      take,
      sortBy = 'createdAt',
      order = 'desc',
      clientName,
      tourName,
      status,
      createdFrom,
      createdTo,
      validUntil,
    } = searchDto;

    const where: any = {
      tenantId,
      ...(status && { status }),
      ...(createdFrom || createdTo ? {
        createdAt: {
          ...(createdFrom && { gte: new Date(createdFrom) }),
          ...(createdTo && { lte: new Date(createdTo) }),
        }
      } : {}),
      ...(validUntil && {
        validUntil: {
          lte: new Date(validUntil)
        }
      }),
      ...(tourName && {
        tour: {
          name: {
            contains: tourName,
            mode: 'insensitive'
          }
        }
      }),
      ...(clientName && {
        lead: {
          client: {
            name: {
              contains: clientName,
              mode: 'insensitive'
            }
          }
        }
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              source: true,
              notes: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            },
          },
          tour: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return createPaginatedResponse(data, total, searchDto.page ?? 1, searchDto.limit ?? 50);
  }
}
