import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehicleRateDto } from './dto/create-vehicle-rate.dto';
import { UpdateVehicleRateDto } from './dto/update-vehicle-rate.dto';
import { ServiceType, VehicleClass } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // VEHICLES (Details)
  // ============================================

  async createVehicle(tenantId: number, dto: CreateVehicleDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.VEHICLE_HIRE,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a vehicle hire type`,
      );
    }

    const existing = await this.prisma.vehicle.findUnique({
      where: { serviceOfferingId: dto.serviceOfferingId },
    });

    if (existing) {
      throw new ConflictException(
        `Vehicle already exists for this service offering`,
      );
    }

    return this.prisma.vehicle.create({
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

  async findAllVehicles(
    tenantId: number,
    vehicleClass?: VehicleClass,
    withDriver?: boolean,
    supplierId?: number,
  ) {
    return this.prisma.vehicle.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
          ...(supplierId ? { supplierId } : {}),
        },
        ...(vehicleClass ? { vehicleClass } : {}),
        ...(withDriver !== undefined ? { withDriver } : {}),
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
                vehicleRates: { where: { isActive: true } },
              },
            },
          },
        },
      },
      orderBy: [{ vehicleClass: 'asc' }, { make: 'asc' }, { model: 'asc' }],
    });
  }

  async findOneVehicle(serviceOfferingId: number, tenantId: number) {
    const vehicle = await this.prisma.vehicle.findFirst({
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
            vehicleRates: {
              where: { isActive: true },
              orderBy: [{ seasonFrom: 'asc' }],
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle not found`);
    }

    return vehicle;
  }

  async updateVehicle(
    serviceOfferingId: number,
    tenantId: number,
    dto: UpdateVehicleDto,
  ) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle not found`);
    }

    return this.prisma.vehicle.update({
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

  async removeVehicle(serviceOfferingId: number, tenantId: number) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle not found`);
    }

    return this.prisma.serviceOffering.update({
      where: { id: serviceOfferingId },
      data: { isActive: false },
    });
  }

  // ============================================
  // VEHICLE RATES
  // ============================================

  async createVehicleRate(tenantId: number, dto: CreateVehicleRateDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.VEHICLE_HIRE,
      },
      include: {
        vehicle: true,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a vehicle hire type`,
      );
    }

    if (!offering.vehicle) {
      throw new BadRequestException(
        `Vehicle details must be created before adding rates`,
      );
    }

    return this.prisma.vehicleRate.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        serviceOffering: {
          include: {
            vehicle: true,
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

  async findAllVehicleRates(
    tenantId: number,
    serviceOfferingId?: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return this.prisma.vehicleRate.findMany({
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
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
                vehicleClass: true,
                maxPassengers: true,
                withDriver: true,
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
      orderBy: [{ seasonFrom: 'asc' }, { dailyRateTry: 'asc' }],
    });
  }

  async findOneVehicleRate(id: number, tenantId: number) {
    const rate = await this.prisma.vehicleRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            vehicle: true,
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
      throw new NotFoundException(`Vehicle rate with ID ${id} not found`);
    }

    return rate;
  }

  async updateVehicleRate(
    id: number,
    tenantId: number,
    dto: UpdateVehicleRateDto,
  ) {
    const rate = await this.prisma.vehicleRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Vehicle rate with ID ${id} not found`);
    }

    return this.prisma.vehicleRate.update({
      where: { id },
      data: dto,
      include: {
        serviceOffering: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async removeVehicleRate(id: number, tenantId: number) {
    const rate = await this.prisma.vehicleRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Vehicle rate with ID ${id} not found`);
    }

    return this.prisma.vehicleRate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async searchVehicles(tenantId: number, searchTerm: string) {
    return this.prisma.vehicle.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
        },
        OR: [
          { make: { contains: searchTerm, mode: 'insensitive' } },
          { model: { contains: searchTerm, mode: 'insensitive' } },
          { plateNumber: { contains: searchTerm, mode: 'insensitive' } },
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
      orderBy: { make: 'asc' },
    });
  }
}
