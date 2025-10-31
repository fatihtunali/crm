import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentClientDto } from './dto/create-payment-client.dto';
import { UpdatePaymentClientDto } from './dto/update-payment-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class PaymentClientService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, bookingId?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'paidAt', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      ...(bookingId && { bookingId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.paymentClient.findMany({
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
                  phone: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.paymentClient.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const payment = await this.prisma.paymentClient.findFirst({
      where: { id, tenantId },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            totalSellEur: true,
            depositDueEur: true,
            balanceDueEur: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async create(createPaymentClientDto: CreatePaymentClientDto, tenantId: number) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: createPaymentClientDto.bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createPaymentClientDto.bookingId} not found`,
      );
    }

    const payment = await this.prisma.paymentClient.create({
      data: {
        tenantId,
        bookingId: createPaymentClientDto.bookingId,
        amountEur: createPaymentClientDto.amountEur,
        method: createPaymentClientDto.method,
        paidAt: createPaymentClientDto.paidAt,
        txnRef: createPaymentClientDto.txnRef,
        status: createPaymentClientDto.status,
        notes: createPaymentClientDto.notes,
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

    return payment;
  }

  async update(
    id: number,
    updatePaymentClientDto: UpdatePaymentClientDto,
    tenantId: number,
  ) {
    const payment = await this.prisma.paymentClient.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Verify booking exists if being updated
    if (updatePaymentClientDto.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: updatePaymentClientDto.bookingId, tenantId },
      });

      if (!booking) {
        throw new NotFoundException(
          `Booking with ID ${updatePaymentClientDto.bookingId} not found`,
        );
      }
    }

    const updatedPayment = await this.prisma.paymentClient.update({
      where: { id },
      data: {
        bookingId: updatePaymentClientDto.bookingId,
        amountEur: updatePaymentClientDto.amountEur,
        method: updatePaymentClientDto.method,
        paidAt: updatePaymentClientDto.paidAt,
        txnRef: updatePaymentClientDto.txnRef,
        status: updatePaymentClientDto.status,
        notes: updatePaymentClientDto.notes,
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

    return updatedPayment;
  }

  async remove(id: number, tenantId: number) {
    const payment = await this.prisma.paymentClient.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    await this.prisma.paymentClient.delete({
      where: { id },
    });

    return { message: 'Client payment deleted successfully' };
  }

  async getStats(tenantId: number) {
    const stats = await this.prisma.paymentClient.groupBy({
      by: ['method', 'status'],
      where: { tenantId },
      _sum: {
        amountEur: true,
      },
      _count: {
        id: true,
      },
    });

    return stats;
  }
}
