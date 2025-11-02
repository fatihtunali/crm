import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CreateActivityRateDto } from './dto/create-activity-rate.dto';
import { UpdateActivityRateDto } from './dto/update-activity-rate.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // ACTIVITY DETAILS CRUD
  // ============================================

  async createActivity(tenantId: number, dto: CreateActivityDto) {
    // Verify service offering exists and is of type ACTIVITY
    const offering = await this.prisma.serviceOffering.findUnique({
      where: { id: dto.serviceOfferingId },
      include: {
        supplier: { include: { party: true } },
      },
    });

    if (!offering) {
      throw new NotFoundException('Service offering not found');
    }

    if (offering.tenantId !== tenantId) {
      throw new NotFoundException('Service offering not found');
    }

    if (offering.serviceType !== 'ACTIVITY') {
      throw new BadRequestException('Service offering must be of type ACTIVITY');
    }

    // Check if activity details already exist for this offering
    const existing = await this.prisma.activity.findUnique({
      where: { serviceOfferingId: dto.serviceOfferingId },
    });

    if (existing) {
      throw new ConflictException(
        'Activity details already exist for this service offering',
      );
    }

    const activity = await this.prisma.activity.create({
      data: {
        serviceOfferingId: dto.serviceOfferingId,
        operatorName: dto.operatorName,
        activityType: dto.activityType,
        durationMinutes: dto.durationMinutes,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        difficulty: dto.difficulty,
        includedItems: dto.includedItems as any,
        meetingPoint: dto.meetingPoint,
        pickupAvailable: dto.pickupAvailable,
        cancellationPolicy: dto.cancellationPolicy,
        notes: dto.notes,
      },
      include: {
        serviceOffering: {
          include: {
            supplier: { include: { party: true } },
          },
        },
      },
    });

    return activity;
  }

  async findAllActivities(
    tenantId: number,
    activityType?: string,
    difficulty?: string,
    supplierId?: number,
  ) {
    const where: any = {
      serviceOffering: { tenantId },
    };

    if (activityType) {
      where.activityType = activityType;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (supplierId) {
      where.serviceOffering = {
        ...where.serviceOffering,
        supplierId,
      };
    }

    const activities = await this.prisma.activity.findMany({
      where,
      include: {
        serviceOffering: {
          include: {
            supplier: { include: { party: true } },
            _count: { select: { activityRates: true } },
          },
        },
      },
      orderBy: { operatorName: 'asc' },
    });

    return activities;
  }

  async findOneActivity(tenantId: number, serviceOfferingId: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { serviceOfferingId },
      include: {
        serviceOffering: {
          include: {
            supplier: { include: { party: true } },
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.serviceOffering.tenantId !== tenantId) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async searchActivities(tenantId: number, query: string) {
    const activities = await this.prisma.activity.findMany({
      where: {
        serviceOffering: { tenantId },
        OR: [
          { operatorName: { contains: query, mode: 'insensitive' } },
          { activityType: { contains: query, mode: 'insensitive' } },
          {
            serviceOffering: {
              title: { contains: query, mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        serviceOffering: {
          include: {
            supplier: { include: { party: true } },
          },
        },
      },
      take: 20,
    });

    return activities;
  }

  async updateActivity(
    tenantId: number,
    serviceOfferingId: number,
    dto: UpdateActivityDto,
  ) {
    await this.findOneActivity(tenantId, serviceOfferingId);

    const activity = await this.prisma.activity.update({
      where: { serviceOfferingId },
      data: {
        operatorName: dto.operatorName,
        activityType: dto.activityType,
        durationMinutes: dto.durationMinutes,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        difficulty: dto.difficulty,
        includedItems: dto.includedItems as any,
        meetingPoint: dto.meetingPoint,
        pickupAvailable: dto.pickupAvailable,
        cancellationPolicy: dto.cancellationPolicy,
        notes: dto.notes,
      },
      include: {
        serviceOffering: {
          include: {
            supplier: { include: { party: true } },
          },
        },
      },
    });

    return activity;
  }

  async removeActivity(tenantId: number, serviceOfferingId: number) {
    await this.findOneActivity(tenantId, serviceOfferingId);

    await this.prisma.activity.delete({
      where: { serviceOfferingId },
    });

    return { message: 'Activity deleted successfully' };
  }

  // ============================================
  // ACTIVITY RATES CRUD
  // ============================================

  async createActivityRate(tenantId: number, dto: CreateActivityRateDto) {
    // Verify activity details exist for this offering
    const activity = await this.prisma.activity.findUnique({
      where: { serviceOfferingId: dto.serviceOfferingId },
      include: { serviceOffering: true },
    });

    if (!activity) {
      throw new NotFoundException(
        'Activity details not found. Please create activity details first.',
      );
    }

    if (activity.serviceOffering.tenantId !== tenantId) {
      throw new NotFoundException('Activity not found');
    }

    const rate = await this.prisma.activityRate.create({
      data: {
        tenantId,
        serviceOfferingId: dto.serviceOfferingId,
        seasonFrom: new Date(dto.seasonFrom),
        seasonTo: new Date(dto.seasonTo),
        pricingModel: dto.pricingModel,
        baseCostTry: dto.baseCostTry,
        minPax: dto.minPax,
        maxPax: dto.maxPax,
        tieredPricingJson: dto.tieredPricingJson as any,
        childDiscountPct: dto.childDiscountPct,
        groupDiscountPct: dto.groupDiscountPct,
        notes: dto.notes,
        isActive: dto.isActive,
      },
      include: {
        serviceOffering: {
          include: {
            activity: true,
            supplier: { include: { party: true } },
          },
        },
      },
    });

    return rate;
  }

  async findAllActivityRates(
    tenantId: number,
    serviceOfferingId?: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: any = { tenantId };

    if (serviceOfferingId) {
      where.serviceOfferingId = serviceOfferingId;
    }

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      where.OR = [
        { seasonFrom: { lte: to }, seasonTo: { gte: from } },
      ];
    }

    const rates = await this.prisma.activityRate.findMany({
      where,
      include: {
        serviceOffering: {
          include: {
            activity: true,
            supplier: { include: { party: true } },
          },
        },
      },
      orderBy: [{ seasonFrom: 'desc' }, { id: 'desc' }],
    });

    return rates;
  }

  async findOneActivityRate(tenantId: number, id: number) {
    const rate = await this.prisma.activityRate.findUnique({
      where: { id },
      include: {
        serviceOffering: {
          include: {
            activity: true,
            supplier: { include: { party: true } },
          },
        },
      },
    });

    if (!rate) {
      throw new NotFoundException('Activity rate not found');
    }

    if (rate.tenantId !== tenantId) {
      throw new NotFoundException('Activity rate not found');
    }

    return rate;
  }

  async updateActivityRate(
    tenantId: number,
    id: number,
    dto: UpdateActivityRateDto,
  ) {
    await this.findOneActivityRate(tenantId, id);

    const updateData: any = {};
    if (dto.seasonFrom) updateData.seasonFrom = new Date(dto.seasonFrom);
    if (dto.seasonTo) updateData.seasonTo = new Date(dto.seasonTo);
    if (dto.pricingModel) updateData.pricingModel = dto.pricingModel;
    if (dto.baseCostTry !== undefined) updateData.baseCostTry = dto.baseCostTry;
    if (dto.minPax !== undefined) updateData.minPax = dto.minPax;
    if (dto.maxPax !== undefined) updateData.maxPax = dto.maxPax;
    if (dto.tieredPricingJson !== undefined)
      updateData.tieredPricingJson = dto.tieredPricingJson as any;
    if (dto.childDiscountPct !== undefined)
      updateData.childDiscountPct = dto.childDiscountPct;
    if (dto.groupDiscountPct !== undefined)
      updateData.groupDiscountPct = dto.groupDiscountPct;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const rate = await this.prisma.activityRate.update({
      where: { id },
      data: updateData,
      include: {
        serviceOffering: {
          include: {
            activity: true,
            supplier: { include: { party: true } },
          },
        },
      },
    });

    return rate;
  }

  async removeActivityRate(tenantId: number, id: number) {
    await this.findOneActivityRate(tenantId, id);

    await this.prisma.activityRate.delete({
      where: { id },
    });

    return { message: 'Activity rate deleted successfully' };
  }
}
