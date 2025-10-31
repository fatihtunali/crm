import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { CreateGuideRateDto } from './dto/create-guide-rate.dto';
import { UpdateGuideRateDto } from './dto/update-guide-rate.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // GUIDES (Details)
  // ============================================

  async createGuide(tenantId: number, dto: CreateGuideDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.GUIDE_SERVICE,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a guide service type`,
      );
    }

    const existing = await this.prisma.guide.findUnique({
      where: { serviceOfferingId: dto.serviceOfferingId },
    });

    if (existing) {
      throw new ConflictException(
        `Guide already exists for this service offering`,
      );
    }

    return this.prisma.guide.create({
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

  async findAllGuides(
    tenantId: number,
    region?: string,
    language?: string,
    supplierId?: number,
  ) {
    return this.prisma.guide.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
          ...(supplierId ? { supplierId } : {}),
        },
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
                guideRates: { where: { isActive: true } },
              },
            },
          },
        },
      },
      orderBy: [{ guideName: 'asc' }],
    });
  }

  async findOneGuide(serviceOfferingId: number, tenantId: number) {
    const guide = await this.prisma.guide.findFirst({
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
            guideRates: {
              where: { isActive: true },
              orderBy: [{ seasonFrom: 'asc' }],
            },
          },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException(`Guide not found`);
    }

    return guide;
  }

  async updateGuide(
    serviceOfferingId: number,
    tenantId: number,
    dto: UpdateGuideDto,
  ) {
    const guide = await this.prisma.guide.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!guide) {
      throw new NotFoundException(`Guide not found`);
    }

    return this.prisma.guide.update({
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

  async removeGuide(serviceOfferingId: number, tenantId: number) {
    const guide = await this.prisma.guide.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!guide) {
      throw new NotFoundException(`Guide not found`);
    }

    return this.prisma.serviceOffering.update({
      where: { id: serviceOfferingId },
      data: { isActive: false },
    });
  }

  // ============================================
  // GUIDE RATES
  // ============================================

  async createGuideRate(tenantId: number, dto: CreateGuideRateDto) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.GUIDE_SERVICE,
      },
      include: {
        guide: true,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a guide service type`,
      );
    }

    if (!offering.guide) {
      throw new BadRequestException(
        `Guide details must be created before adding rates`,
      );
    }

    return this.prisma.guideRate.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        serviceOffering: {
          include: {
            guide: true,
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

  async findAllGuideRates(
    tenantId: number,
    serviceOfferingId?: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return this.prisma.guideRate.findMany({
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
            guide: {
              select: {
                guideName: true,
                languages: true,
                regions: true,
                maxGroupSize: true,
                rating: true,
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
      orderBy: [{ seasonFrom: 'asc' }, { dayCostTry: 'asc' }],
    });
  }

  async findOneGuideRate(id: number, tenantId: number) {
    const rate = await this.prisma.guideRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            guide: true,
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
      throw new NotFoundException(`Guide rate with ID ${id} not found`);
    }

    return rate;
  }

  async updateGuideRate(
    id: number,
    tenantId: number,
    dto: UpdateGuideRateDto,
  ) {
    const rate = await this.prisma.guideRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Guide rate with ID ${id} not found`);
    }

    return this.prisma.guideRate.update({
      where: { id },
      data: dto,
      include: {
        serviceOffering: {
          include: {
            guide: true,
          },
        },
      },
    });
  }

  async removeGuideRate(id: number, tenantId: number) {
    const rate = await this.prisma.guideRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Guide rate with ID ${id} not found`);
    }

    return this.prisma.guideRate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async searchGuides(tenantId: number, searchTerm: string) {
    return this.prisma.guide.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
        },
        OR: [
          { guideName: { contains: searchTerm, mode: 'insensitive' } },
          { licenseNo: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
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
      orderBy: { guideName: 'asc' },
    });
  }
}
