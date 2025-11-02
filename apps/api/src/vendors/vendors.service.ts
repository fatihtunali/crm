import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { VendorType } from '@tour-crm/shared';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: number,
    paginationDto: PaginationDto,
    type?: VendorType,
    includeInactive: boolean = false,
  ): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'name', order = 'asc' } = paginationDto;
    const where = {
      tenantId,
      ...(type && { type }),
      // Issue #33: Soft delete - exclude deleted vendors by default
      ...(!includeInactive && { isActive: true, deletedAt: null }),
    };

    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, tenantId },
      include: {
        rates: {
          orderBy: { seasonFrom: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async create(createVendorDto: CreateVendorDto, tenantId: number) {
    const vendor = await this.prisma.vendor.create({
      data: {
        tenantId,
        name: createVendorDto.name,
        type: createVendorDto.type,
        contactName: createVendorDto.contactName,
        phone: createVendorDto.phone,
        email: createVendorDto.email,
        taxId: createVendorDto.taxId,
        address: createVendorDto.address,
        notes: createVendorDto.notes,
        isActive: createVendorDto.isActive ?? true,
      },
    });

    return vendor;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto, tenantId: number) {
    // Check if vendor exists
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    const updatedVendor = await this.prisma.vendor.update({
      where: { id },
      data: {
        name: updateVendorDto.name,
        type: updateVendorDto.type,
        contactName: updateVendorDto.contactName,
        phone: updateVendorDto.phone,
        email: updateVendorDto.email,
        taxId: updateVendorDto.taxId,
        address: updateVendorDto.address,
        notes: updateVendorDto.notes,
        isActive: updateVendorDto.isActive,
      },
    });

    return updatedVendor;
  }

  async remove(id: number, tenantId: number) {
    // Check if vendor exists
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    // Issue #33: Soft delete by setting isActive to false and deletedAt timestamp
    await this.prisma.vendor.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { message: 'Vendor soft deleted successfully' };
  }

  async search(query: string, tenantId: number) {
    return this.prisma.vendor.findMany({
      where: {
        tenantId,
        isActive: true,
        deletedAt: null, // Issue #33: Exclude soft-deleted records
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }
}
