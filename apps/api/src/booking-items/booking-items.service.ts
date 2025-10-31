import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingItemDto } from './dto/create-booking-item.dto';
import { UpdateBookingItemDto } from './dto/update-booking-item.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class BookingItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, bookingId?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'id', order = 'asc' } = paginationDto;
    const where = {
      tenantId,
      ...(bookingId && { bookingId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.bookingItem.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              startDate: true,
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.bookingItem.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const bookingItem = await this.prisma.bookingItem.findFirst({
      where: { id, tenantId },
      include: {
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
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
        vendor: true,
      },
    });

    if (!bookingItem) {
      throw new NotFoundException(`Booking item with ID ${id} not found`);
    }

    return bookingItem;
  }

  async create(createBookingItemDto: CreateBookingItemDto, tenantId: number) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: createBookingItemDto.bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createBookingItemDto.bookingId} not found`,
      );
    }

    // Verify vendor exists if provided
    if (createBookingItemDto.vendorId) {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: createBookingItemDto.vendorId, tenantId },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor with ID ${createBookingItemDto.vendorId} not found`,
        );
      }
    }

    const bookingItem = await this.prisma.bookingItem.create({
      data: {
        tenantId,
        bookingId: createBookingItemDto.bookingId,
        itemType: createBookingItemDto.itemType,
        vendorId: createBookingItemDto.vendorId,
        qty: createBookingItemDto.qty,
        unitCostTry: createBookingItemDto.unitCostTry,
        unitPriceEur: createBookingItemDto.unitPriceEur,
        notes: createBookingItemDto.notes,
      },
      include: {
        booking: {
          select: {
            id: true,
            startDate: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
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

    return bookingItem;
  }

  async update(
    id: number,
    updateBookingItemDto: UpdateBookingItemDto,
    tenantId: number,
  ) {
    const bookingItem = await this.prisma.bookingItem.findFirst({
      where: { id, tenantId },
    });

    if (!bookingItem) {
      throw new NotFoundException(`Booking item with ID ${id} not found`);
    }

    // Verify booking exists if being updated
    if (updateBookingItemDto.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: updateBookingItemDto.bookingId, tenantId },
      });

      if (!booking) {
        throw new NotFoundException(
          `Booking with ID ${updateBookingItemDto.bookingId} not found`,
        );
      }
    }

    // Verify vendor exists if being updated
    if (updateBookingItemDto.vendorId) {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: updateBookingItemDto.vendorId, tenantId },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor with ID ${updateBookingItemDto.vendorId} not found`,
        );
      }
    }

    const updatedBookingItem = await this.prisma.bookingItem.update({
      where: { id },
      data: {
        bookingId: updateBookingItemDto.bookingId,
        itemType: updateBookingItemDto.itemType,
        vendorId: updateBookingItemDto.vendorId,
        qty: updateBookingItemDto.qty,
        unitCostTry: updateBookingItemDto.unitCostTry,
        unitPriceEur: updateBookingItemDto.unitPriceEur,
        notes: updateBookingItemDto.notes,
      },
      include: {
        booking: {
          select: {
            id: true,
            startDate: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
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

    return updatedBookingItem;
  }

  async remove(id: number, tenantId: number) {
    const bookingItem = await this.prisma.bookingItem.findFirst({
      where: { id, tenantId },
    });

    if (!bookingItem) {
      throw new NotFoundException(`Booking item with ID ${id} not found`);
    }

    await this.prisma.bookingItem.delete({
      where: { id },
    });

    return { message: 'Booking item deleted successfully' };
  }
}
