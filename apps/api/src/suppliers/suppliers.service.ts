import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierType } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, dto: CreateSupplierDto) {
    // Verify the party belongs to this tenant
    const party = await this.prisma.party.findFirst({
      where: { id: dto.partyId, tenantId },
    });

    if (!party) {
      throw new BadRequestException(
        `Party with ID ${dto.partyId} not found or doesn't belong to your organization`,
      );
    }

    // Check if supplier already exists for this party
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        tenantId,
        partyId: dto.partyId,
      },
    });

    if (existingSupplier) {
      throw new ConflictException(
        `A supplier already exists for party ${party.name}`,
      );
    }

    return this.prisma.supplier.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        party: {
          include: {
            contacts: {
              where: { isActive: true },
              orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
            },
          },
        },
        serviceOfferings: {
          where: { isActive: true },
          take: 5,
        },
      },
    });
  }

  async findAll(
    tenantId: number,
    type?: SupplierType,
    includeInactive = false,
  ) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        ...(type ? { type } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        party: {
          include: {
            contacts: {
              where: { isActive: true, isPrimary: true },
            },
          },
        },
        _count: {
          select: {
            serviceOfferings: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ type: 'asc' }, { party: { name: 'asc' } }],
    });
  }

  async findOne(id: number, tenantId: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        party: {
          include: {
            contacts: {
              orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
            },
          },
        },
        serviceOfferings: {
          where: { isActive: true },
          include: {
            hotelRoom: true,
            transfer: true,
            vehicle: true,
            guide: true,
            activity: true,
            _count: {
              select: {
                hotelRoomRates: { where: { isActive: true } },
                transferRates: { where: { isActive: true } },
                vehicleRates: { where: { isActive: true } },
                guideRates: { where: { isActive: true } },
                activityRates: { where: { isActive: true } },
              },
            },
          },
          orderBy: { title: 'asc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: number, tenantId: number, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
      include: {
        party: {
          include: {
            contacts: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByType(tenantId: number, type: SupplierType) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        type,
        isActive: true,
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
        _count: {
          select: {
            serviceOfferings: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { party: { name: 'asc' } },
    });
  }

  async search(tenantId: number, searchTerm: string, type?: SupplierType) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(type ? { type } : {}),
        party: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
            { country: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      take: 20,
      orderBy: { party: { name: 'asc' } },
    });
  }

  async getStatsByType(tenantId: number) {
    const stats = await this.prisma.supplier.groupBy({
      by: ['type'],
      where: {
        tenantId,
        isActive: true,
      },
      _count: {
        id: true,
      },
    });

    return stats;
  }
}
