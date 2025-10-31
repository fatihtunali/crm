import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorType } from '@tour-crm/shared';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, type?: VendorType) {
    return this.prisma.vendor.findMany({
      where: {
        tenantId,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    });
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
      where: { id, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.vendor.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Vendor deactivated successfully' };
  }

  async search(query: string, tenantId: number) {
    return this.prisma.vendor.findMany({
      where: {
        tenantId,
        isActive: true,
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
