import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, bookingId?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'issueDate', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      ...(bookingId && { bookingId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            totalSellEur: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                nationality: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async create(createInvoiceDto: CreateInvoiceDto, tenantId: number) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: createInvoiceDto.bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createInvoiceDto.bookingId} not found`,
      );
    }

    // Check for unique constraint on invoice number
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        number: createInvoiceDto.number,
      },
    });

    if (existingInvoice) {
      throw new ConflictException(
        `Invoice with number ${createInvoiceDto.number} already exists`,
      );
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        bookingId: createInvoiceDto.bookingId,
        number: createInvoiceDto.number,
        issueDate: createInvoiceDto.issueDate,
        currency: createInvoiceDto.currency || 'EUR',
        netAmount: createInvoiceDto.netAmount,
        vatAmount: createInvoiceDto.vatAmount,
        grossAmount: createInvoiceDto.grossAmount,
        vatRate: createInvoiceDto.vatRate || 20.0,
        pdfUrl: createInvoiceDto.pdfUrl,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return invoice;
  }

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
    tenantId: number,
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Verify booking exists if being updated
    if (updateInvoiceDto.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: updateInvoiceDto.bookingId, tenantId },
      });

      if (!booking) {
        throw new NotFoundException(
          `Booking with ID ${updateInvoiceDto.bookingId} not found`,
        );
      }
    }

    // Check for unique constraint if invoice number is being updated
    if (updateInvoiceDto.number && updateInvoiceDto.number !== invoice.number) {
      const existingInvoice = await this.prisma.invoice.findFirst({
        where: {
          tenantId,
          number: updateInvoiceDto.number,
        },
      });

      if (existingInvoice) {
        throw new ConflictException(
          `Invoice with number ${updateInvoiceDto.number} already exists`,
        );
      }
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        bookingId: updateInvoiceDto.bookingId,
        number: updateInvoiceDto.number,
        issueDate: updateInvoiceDto.issueDate,
        currency: updateInvoiceDto.currency,
        netAmount: updateInvoiceDto.netAmount,
        vatAmount: updateInvoiceDto.vatAmount,
        grossAmount: updateInvoiceDto.grossAmount,
        vatRate: updateInvoiceDto.vatRate,
        pdfUrl: updateInvoiceDto.pdfUrl,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedInvoice;
  }

  async remove(id: number, tenantId: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Invoice deleted successfully' };
  }

  async getStats(tenantId: number) {
    const stats = await this.prisma.invoice.groupBy({
      by: ['currency'],
      where: { tenantId },
      _sum: {
        netAmount: true,
        vatAmount: true,
        grossAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return stats;
  }
}
