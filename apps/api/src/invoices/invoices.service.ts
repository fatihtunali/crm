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
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

  async generatePDF(id: number, tenantId: number): Promise<Readable> {
    // Get invoice with full details
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Get tenant and tour details separately
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        address: true,
        phone: true,
        email: true,
        taxId: true,
      },
    });

    const booking = await this.prisma.booking.findUnique({
      where: { id: invoice.bookingId },
      include: {
        quotation: {
          include: {
            tour: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Header - Company Info
    doc
      .fontSize(20)
      .text(tenant?.name || 'N/A', 50, 50)
      .fontSize(10)
      .text(tenant?.address || '', 50, 75)
      .text(
        `Phone: ${tenant?.phone || 'N/A'} | Email: ${tenant?.email || 'N/A'}`,
        50,
        90,
      )
      .text(`Tax ID: ${tenant?.taxId || 'N/A'}`, 50, 105);

    // Invoice title and details
    doc
      .fontSize(24)
      .text('INVOICE', 400, 50, { align: 'right' })
      .fontSize(10)
      .text(`Invoice #: ${invoice.number}`, 400, 80, { align: 'right' })
      .text(
        `Date: ${new Date(invoice.issueDate).toLocaleDateString()}`,
        400,
        95,
        { align: 'right' },
      );

    // Client Info
    doc
      .fontSize(12)
      .text('Bill To:', 50, 150)
      .fontSize(10)
      .text(invoice.booking.client.name, 50, 170)
      .text(invoice.booking.client.email || '', 50, 185)
      .text(invoice.booking.client.phone || '', 50, 200)
      .text(
        `Nationality: ${invoice.booking.client.nationality || 'N/A'}`,
        50,
        215,
      );

    // Booking details
    doc
      .fontSize(12)
      .text('Booking Details:', 50, 250)
      .fontSize(10)
      .text(`Booking Code: ${booking?.bookingCode || 'N/A'}`, 50, 270)
      .text(
        `Tour: ${booking?.quotation?.tour?.name || 'N/A'}`,
        50,
        285,
      )
      .text(
        `Travel Dates: ${booking ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} - ${booking ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}`,
        50,
        300,
      );

    // Line separator
    doc
      .moveTo(50, 330)
      .lineTo(550, 330)
      .stroke();

    // Invoice items table header
    const tableTop = 350;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Description', 50, tableTop)
      .text('Amount', 400, tableTop, { align: 'right' });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Invoice line item
    const itemY = tableTop + 25;
    doc
      .font('Helvetica')
      .text(
        `Tour Package - ${booking?.quotation?.tour?.name || 'Travel Services'}`,
        50,
        itemY,
      )
      .text(
        `${Number(invoice.netAmount).toFixed(2)} ${invoice.currency}`,
        400,
        itemY,
        { align: 'right' },
      );

    // Totals section
    const totalsY = itemY + 60;
    doc
      .moveTo(350, totalsY - 10)
      .lineTo(550, totalsY - 10)
      .stroke();

    doc
      .text('Subtotal:', 350, totalsY)
      .text(
        `${Number(invoice.netAmount).toFixed(2)} ${invoice.currency}`,
        400,
        totalsY,
        { align: 'right' },
      )
      .text(`VAT (${Number(invoice.vatRate).toFixed(0)}%):`, 350, totalsY + 20)
      .text(
        `${Number(invoice.vatAmount).toFixed(2)} ${invoice.currency}`,
        400,
        totalsY + 20,
        { align: 'right' },
      );

    doc
      .moveTo(350, totalsY + 35)
      .lineTo(550, totalsY + 35)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Total:', 350, totalsY + 45)
      .text(
        `${Number(invoice.grossAmount).toFixed(2)} ${invoice.currency}`,
        400,
        totalsY + 45,
        { align: 'right' },
      );

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Thank you for your business!',
        50,
        700,
        { align: 'center', width: 500 },
      )
      .text(
        'For any questions, please contact us at the details above.',
        50,
        715,
        { align: 'center', width: 500 },
      );

    // Finalize PDF
    doc.end();

    return doc as unknown as Readable;
  }
}
