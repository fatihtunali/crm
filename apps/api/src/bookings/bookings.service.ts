import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { BookingStatus } from '@tour-crm/shared';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, status?: BookingStatus): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'startDate', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          quotation: {
            select: {
              id: true,
              status: true,
            },
          },
          _count: {
            select: {
              items: true,
              paymentsClient: true,
              invoices: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            passportNumber: true,
            nationality: true,
          },
        },
        quotation: {
          select: {
            id: true,
            status: true,
            sellPriceEur: true,
          },
        },
        items: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        paymentsClient: {
          select: {
            id: true,
            amountEur: true,
            method: true,
            status: true,
            paidAt: true,
          },
          orderBy: { paidAt: 'desc' },
        },
        invoices: {
          select: {
            id: true,
            number: true,
            grossAmount: true,
            issueDate: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async create(createBookingDto: CreateBookingDto, tenantId: number) {
    // Check if booking code already exists for this tenant
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        tenantId,
        bookingCode: createBookingDto.bookingCode,
      },
    });

    if (existingBooking) {
      throw new ConflictException(
        `Booking with code ${createBookingDto.bookingCode} already exists`,
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        quotationId: createBookingDto.quotationId,
        clientId: createBookingDto.clientId,
        bookingCode: createBookingDto.bookingCode,
        startDate: createBookingDto.startDate,
        endDate: createBookingDto.endDate,
        lockedExchangeRate: createBookingDto.lockedExchangeRate,
        totalCostTry: createBookingDto.totalCostTry,
        totalSellEur: createBookingDto.totalSellEur,
        depositDueEur: createBookingDto.depositDueEur,
        balanceDueEur: createBookingDto.balanceDueEur,
        status: createBookingDto.status ?? BookingStatus.PENDING,
        notes: createBookingDto.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quotation: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
    tenantId: number,
  ) {
    // Check if booking exists
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // If updating booking code, check for conflicts
    if (
      updateBookingDto.bookingCode &&
      updateBookingDto.bookingCode !== booking.bookingCode
    ) {
      const existingBooking = await this.prisma.booking.findFirst({
        where: {
          tenantId,
          bookingCode: updateBookingDto.bookingCode,
          id: { not: id },
        },
      });

      if (existingBooking) {
        throw new ConflictException(
          `Booking with code ${updateBookingDto.bookingCode} already exists`,
        );
      }
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        quotationId: updateBookingDto.quotationId,
        clientId: updateBookingDto.clientId,
        bookingCode: updateBookingDto.bookingCode,
        startDate: updateBookingDto.startDate,
        endDate: updateBookingDto.endDate,
        lockedExchangeRate: updateBookingDto.lockedExchangeRate,
        totalCostTry: updateBookingDto.totalCostTry,
        totalSellEur: updateBookingDto.totalSellEur,
        depositDueEur: updateBookingDto.depositDueEur,
        balanceDueEur: updateBookingDto.balanceDueEur,
        status: updateBookingDto.status,
        notes: updateBookingDto.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quotation: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return updatedBooking;
  }

  async remove(id: number, tenantId: number) {
    // Check if booking exists
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Hard delete
    await this.prisma.booking.delete({
      where: { id },
    });

    return { message: 'Booking deleted successfully' };
  }

  async getStatsByStatus(tenantId: number) {
    const stats = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
      _sum: {
        totalCostTry: true,
        totalSellEur: true,
      },
    });

    return stats.map((stat) => ({
      status: stat.status,
      count: stat._count.id,
      totalCostTry: stat._sum.totalCostTry || 0,
      totalSellEur: stat._sum.totalSellEur || 0,
    }));
  }
}
