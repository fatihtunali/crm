import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorRateDto } from './dto/create-vendor-rate.dto';
import { UpdateVendorRateDto } from './dto/update-vendor-rate.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class VendorRatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, vendorId?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'seasonFrom', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      ...(vendorId && { vendorId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.vendorRate.findMany({
        where,
        include: {
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
      this.prisma.vendorRate.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const vendorRate = await this.prisma.vendorRate.findFirst({
      where: { id, tenantId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            type: true,
            contactName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!vendorRate) {
      throw new NotFoundException(`Vendor rate with ID ${id} not found`);
    }

    return vendorRate;
  }

  async create(createVendorRateDto: CreateVendorRateDto, tenantId: number) {
    const vendorRate = await this.prisma.vendorRate.create({
      data: {
        tenantId,
        vendorId: createVendorRateDto.vendorId,
        seasonFrom: createVendorRateDto.seasonFrom,
        seasonTo: createVendorRateDto.seasonTo,
        serviceType: createVendorRateDto.serviceType,
        costTry: createVendorRateDto.costTry,
        notes: createVendorRateDto.notes,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return vendorRate;
  }

  async update(
    id: number,
    updateVendorRateDto: UpdateVendorRateDto,
    tenantId: number,
  ) {
    // Check if vendor rate exists
    const vendorRate = await this.prisma.vendorRate.findFirst({
      where: { id, tenantId },
    });

    if (!vendorRate) {
      throw new NotFoundException(`Vendor rate with ID ${id} not found`);
    }

    const updatedVendorRate = await this.prisma.vendorRate.update({
      where: { id },
      data: {
        vendorId: updateVendorRateDto.vendorId,
        seasonFrom: updateVendorRateDto.seasonFrom,
        seasonTo: updateVendorRateDto.seasonTo,
        serviceType: updateVendorRateDto.serviceType,
        costTry: updateVendorRateDto.costTry,
        notes: updateVendorRateDto.notes,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return updatedVendorRate;
  }

  async remove(id: number, tenantId: number) {
    // Check if vendor rate exists
    const vendorRate = await this.prisma.vendorRate.findFirst({
      where: { id, tenantId },
    });

    if (!vendorRate) {
      throw new NotFoundException(`Vendor rate with ID ${id} not found`);
    }

    // Hard delete
    await this.prisma.vendorRate.delete({
      where: { id },
    });

    return { message: 'Vendor rate deleted successfully' };
  }
}
