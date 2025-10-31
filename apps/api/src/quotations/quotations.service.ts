import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationStatus } from '@tour-crm/shared';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, status?: QuotationStatus) {
    return this.prisma.quotation.findMany({
      where: {
        tenantId,
        ...(status && { status }),
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
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
}
