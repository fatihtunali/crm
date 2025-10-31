import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentVendorDto } from './dto/create-payment-vendor.dto';
import { UpdatePaymentVendorDto } from './dto/update-payment-vendor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class PaymentVendorService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, bookingId?: number, vendorId?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'dueAt', order = 'asc' } = paginationDto;
    const where = {
      tenantId,
      ...(bookingId && { bookingId }),
      ...(vendorId && { vendorId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.paymentVendor.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              type: true,
              email: true,
              phone: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.paymentVendor.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const payment = await this.prisma.paymentVendor.findFirst({
      where: { id, tenantId },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            totalCostTry: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        vendor: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Vendor payment with ID ${id} not found`);
    }

    return payment;
  }

  async create(createPaymentVendorDto: CreatePaymentVendorDto, tenantId: number) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: createPaymentVendorDto.bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createPaymentVendorDto.bookingId} not found`,
      );
    }

    // Verify vendor exists and belongs to tenant
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: createPaymentVendorDto.vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException(
        `Vendor with ID ${createPaymentVendorDto.vendorId} not found`,
      );
    }

    const payment = await this.prisma.paymentVendor.create({
      data: {
        tenantId,
        bookingId: createPaymentVendorDto.bookingId,
        vendorId: createPaymentVendorDto.vendorId,
        amountTry: createPaymentVendorDto.amountTry,
        dueAt: createPaymentVendorDto.dueAt,
        paidAt: createPaymentVendorDto.paidAt,
        status: createPaymentVendorDto.status,
        notes: createPaymentVendorDto.notes,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return payment;
  }

  async update(
    id: number,
    updatePaymentVendorDto: UpdatePaymentVendorDto,
    tenantId: number,
  ) {
    const payment = await this.prisma.paymentVendor.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException(`Vendor payment with ID ${id} not found`);
    }

    // Verify booking exists if being updated
    if (updatePaymentVendorDto.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: updatePaymentVendorDto.bookingId, tenantId },
      });

      if (!booking) {
        throw new NotFoundException(
          `Booking with ID ${updatePaymentVendorDto.bookingId} not found`,
        );
      }
    }

    // Verify vendor exists if being updated
    if (updatePaymentVendorDto.vendorId) {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: updatePaymentVendorDto.vendorId, tenantId },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor with ID ${updatePaymentVendorDto.vendorId} not found`,
        );
      }
    }

    const updatedPayment = await this.prisma.paymentVendor.update({
      where: { id },
      data: {
        bookingId: updatePaymentVendorDto.bookingId,
        vendorId: updatePaymentVendorDto.vendorId,
        amountTry: updatePaymentVendorDto.amountTry,
        dueAt: updatePaymentVendorDto.dueAt,
        paidAt: updatePaymentVendorDto.paidAt,
        status: updatePaymentVendorDto.status,
        notes: updatePaymentVendorDto.notes,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return updatedPayment;
  }

  async remove(id: number, tenantId: number) {
    const payment = await this.prisma.paymentVendor.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException(`Vendor payment with ID ${id} not found`);
    }

    await this.prisma.paymentVendor.delete({
      where: { id },
    });

    return { message: 'Vendor payment deleted successfully' };
  }

  async getStats(tenantId: number) {
    const stats = await this.prisma.paymentVendor.groupBy({
      by: ['status'],
      where: { tenantId },
      _sum: {
        amountTry: true,
      },
      _count: {
        id: true,
      },
    });

    return stats;
  }
}
