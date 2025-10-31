import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class ServiceOfferingsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, dto: CreateServiceOfferingDto) {
    // Verify the supplier belongs to this tenant
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, tenantId },
    });

    if (!supplier) {
      throw new BadRequestException(
        `Supplier with ID ${dto.supplierId} not found or doesn't belong to your organization`,
      );
    }

    return this.prisma.serviceOffering.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        supplier: {
          include: {
            party: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    tenantId: number,
    serviceType?: ServiceType,
    supplierId?: number,
    location?: string,
    includeInactive = false,
  ) {
    return this.prisma.serviceOffering.findMany({
      where: {
        tenantId,
        ...(serviceType ? { serviceType } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        supplier: {
          include: {
            party: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
        _count: {
          select: {
            hotelRoomRates: { where: { isActive: true } },
            transferRates: { where: { isActive: true } },
            vehicleRates: { where: { isActive: true } },
            guideRates: { where: { isActive: true } },
            activityRates: { where: { isActive: true } },
            bookingItems: true,
          },
        },
      },
      orderBy: [{ serviceType: 'asc' }, { title: 'asc' }],
    });
  }

  async findOne(id: number, tenantId: number) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: { id, tenantId },
      include: {
        supplier: {
          include: {
            party: {
              include: {
                contacts: {
                  where: { isActive: true },
                  orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
                },
              },
            },
          },
        },
        hotelRoom: true,
        transfer: true,
        vehicle: true,
        guide: true,
        activity: true,
        hotelRoomRates: {
          where: { isActive: true },
          orderBy: [{ seasonFrom: 'asc' }],
        },
        transferRates: {
          where: { isActive: true },
          orderBy: [{ seasonFrom: 'asc' }],
        },
        vehicleRates: {
          where: { isActive: true },
          orderBy: [{ seasonFrom: 'asc' }],
        },
        guideRates: {
          where: { isActive: true },
          orderBy: [{ seasonFrom: 'asc' }],
        },
        activityRates: {
          where: { isActive: true },
          orderBy: [{ seasonFrom: 'asc' }],
        },
      },
    });

    if (!offering) {
      throw new NotFoundException(`Service offering with ID ${id} not found`);
    }

    return offering;
  }

  async update(id: number, tenantId: number, dto: UpdateServiceOfferingDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: { id, tenantId },
    });

    if (!offering) {
      throw new NotFoundException(`Service offering with ID ${id} not found`);
    }

    return this.prisma.serviceOffering.update({
      where: { id },
      data: dto,
      include: {
        supplier: {
          include: {
            party: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: { id, tenantId },
    });

    if (!offering) {
      throw new NotFoundException(`Service offering with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.serviceOffering.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(
    tenantId: number,
    searchTerm: string,
    serviceType?: ServiceType,
  ) {
    return this.prisma.serviceOffering.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(serviceType ? { serviceType } : {}),
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        supplier: {
          include: {
            party: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: 20,
      orderBy: { title: 'asc' },
    });
  }

  async getStatsByType(tenantId: number) {
    const stats = await this.prisma.serviceOffering.groupBy({
      by: ['serviceType'],
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
