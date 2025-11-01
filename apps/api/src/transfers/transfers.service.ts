import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { CreateTransferRateDto } from './dto/create-transfer-rate.dto';
import { UpdateTransferRateDto } from './dto/update-transfer-rate.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // TRANSFERS (Details)
  // ============================================

  async createTransfer(tenantId: number, dto: CreateTransferDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.TRANSFER,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a transfer type`,
      );
    }

    const existing = await this.prisma.transfer.findUnique({
      where: { serviceOfferingId: dto.serviceOfferingId },
    });

    if (existing) {
      throw new ConflictException(
        `Transfer already exists for this service offering`,
      );
    }

    return this.prisma.transfer.create({
      data: dto,
      include: {
        serviceOffering: {
          include: {
            supplier: {
              include: {
                party: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllTransfers(
    tenantId: number,
    originZone?: string,
    destZone?: string,
    transferType?: string,
    supplierId?: number,
  ) {
    return this.prisma.transfer.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
          ...(supplierId ? { supplierId } : {}),
        },
        ...(originZone ? { originZone: { contains: originZone, mode: 'insensitive' } } : {}),
        ...(destZone ? { destZone: { contains: destZone, mode: 'insensitive' } } : {}),
        ...(transferType ? { transferType: transferType as any } : {}),
      },
      include: {
        serviceOffering: {
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
            _count: {
              select: {
                transferRates: { where: { isActive: true } },
              },
            },
          },
        },
      },
      orderBy: [{ originZone: 'asc' }, { destZone: 'asc' }],
    });
  }

  async findOneTransfer(serviceOfferingId: number, tenantId: number) {
    const transfer = await this.prisma.transfer.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
      include: {
        serviceOffering: {
          include: {
            supplier: {
              include: {
                party: {
                  include: {
                    contacts: {
                      where: { isActive: true },
                      orderBy: [{ isPrimary: 'desc' }],
                    },
                  },
                },
              },
            },
            transferRates: {
              where: { isActive: true },
              orderBy: [{ seasonFrom: 'asc' }],
            },
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer not found`);
    }

    return transfer;
  }

  async updateTransfer(
    serviceOfferingId: number,
    tenantId: number,
    dto: UpdateTransferDto,
  ) {
    const transfer = await this.prisma.transfer.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer not found`);
    }

    return this.prisma.transfer.update({
      where: { serviceOfferingId },
      data: dto,
      include: {
        serviceOffering: {
          include: {
            supplier: {
              include: {
                party: true,
              },
            },
          },
        },
      },
    });
  }

  async removeTransfer(serviceOfferingId: number, tenantId: number) {
    const transfer = await this.prisma.transfer.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer not found`);
    }

    return this.prisma.serviceOffering.update({
      where: { id: serviceOfferingId },
      data: { isActive: false },
    });
  }

  // ============================================
  // TRANSFER RATES
  // ============================================

  async createTransferRate(tenantId: number, dto: CreateTransferRateDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.TRANSFER,
      },
      include: {
        transfer: true,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a transfer type`,
      );
    }

    if (!offering.transfer) {
      throw new BadRequestException(
        `Transfer details must be created before adding rates`,
      );
    }

    return this.prisma.transferRate.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        serviceOffering: {
          include: {
            transfer: true,
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
        },
      },
    });
  }

  async findAllTransferRates(
    tenantId: number,
    serviceOfferingId?: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return this.prisma.transferRate.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(serviceOfferingId ? { serviceOfferingId } : {}),
        ...(dateFrom && dateTo
          ? {
              OR: [
                {
                  seasonFrom: { lte: new Date(dateFrom) },
                  seasonTo: { gte: new Date(dateFrom) },
                },
                {
                  seasonFrom: { lte: new Date(dateTo) },
                  seasonTo: { gte: new Date(dateTo) },
                },
                {
                  seasonFrom: { gte: new Date(dateFrom) },
                  seasonTo: { lte: new Date(dateTo) },
                },
              ],
            }
          : {}),
      },
      include: {
        serviceOffering: {
          include: {
            transfer: {
              select: {
                city: true,
                originZone: true,
                destZone: true,
                transferType: true,
                vehicleClass: true,
                maxPassengers: true,
              },
            },
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
        },
      },
      orderBy: [{ seasonFrom: 'asc' }, { baseCostTry: 'asc' }],
    });
  }

  async findOneTransferRate(id: number, tenantId: number) {
    const rate = await this.prisma.transferRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            transfer: true,
            supplier: {
              include: {
                party: true,
              },
            },
          },
        },
      },
    });

    if (!rate) {
      throw new NotFoundException(`Transfer rate with ID ${id} not found`);
    }

    return rate;
  }

  async updateTransferRate(
    id: number,
    tenantId: number,
    dto: UpdateTransferRateDto,
  ) {
    const rate = await this.prisma.transferRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Transfer rate with ID ${id} not found`);
    }

    return this.prisma.transferRate.update({
      where: { id },
      data: dto,
      include: {
        serviceOffering: {
          include: {
            transfer: true,
          },
        },
      },
    });
  }

  async removeTransferRate(id: number, tenantId: number) {
    const rate = await this.prisma.transferRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Transfer rate with ID ${id} not found`);
    }

    return this.prisma.transferRate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async searchTransfers(tenantId: number, searchTerm: string) {
    return this.prisma.transfer.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
        },
        OR: [
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { originZone: { contains: searchTerm, mode: 'insensitive' } },
          { destZone: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        serviceOffering: {
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
        },
      },
      take: 20,
      orderBy: { originZone: 'asc' },
    });
  }
}
