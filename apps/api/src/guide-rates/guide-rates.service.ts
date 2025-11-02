import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuideRateDto } from './dto/create-guide-rate.dto';
import { UpdateGuideRateDto } from './dto/update-guide-rate.dto';
import { buildOverlapWhereClause } from '../common/utils/date-range-overlap.util';

/**
 * Issue #32: Guide Rates Service with Season Overlap Detection
 */
@Injectable()
export class GuideRatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGuideRateDto, tenantId: number) {
    if (dto.seasonFrom >= dto.seasonTo) {
      throw new BadRequestException('Season start date must be before end date');
    }

    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: 'GUIDE_SERVICE',
      },
    });

    if (!offering) {
      throw new NotFoundException(
        `Guide service offering with ID ${dto.serviceOfferingId} not found`
      );
    }

    // Issue #32: Check for overlapping rate seasons
    const overlapWhere = buildOverlapWhereClause(dto.seasonFrom, dto.seasonTo);

    const overlapping = await this.prisma.guideRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: dto.serviceOfferingId,
        isActive: true,
        ...overlapWhere,
      },
    });

    if (overlapping) {
      throw new ConflictException(
        `Rate season overlaps with existing rate (${overlapping.seasonFrom.toISOString().split('T')[0]} - ${overlapping.seasonTo.toISOString().split('T')[0]})`
      );
    }

    return this.prisma.guideRate.create({
      data: {
        tenantId,
        ...dto,
        isActive: dto.isActive ?? true,
      },
      include: {
        serviceOffering: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async update(id: number, dto: UpdateGuideRateDto, tenantId: number) {
    const existing = await this.prisma.guideRate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Guide rate with ID ${id} not found`);
    }

    if (dto.seasonFrom || dto.seasonTo) {
      const seasonFrom = dto.seasonFrom ?? existing.seasonFrom;
      const seasonTo = dto.seasonTo ?? existing.seasonTo;

      if (seasonFrom >= seasonTo) {
        throw new BadRequestException('Season start date must be before end date');
      }

      // Issue #32: Check for overlapping rate seasons
      const overlapWhere = buildOverlapWhereClause(seasonFrom, seasonTo);

      const overlapping = await this.prisma.guideRate.findFirst({
        where: {
          tenantId,
          serviceOfferingId: existing.serviceOfferingId,
          isActive: true,
          id: { not: id },
          ...overlapWhere,
        },
      });

      if (overlapping) {
        throw new ConflictException(
          `Rate season overlaps with existing rate (${overlapping.seasonFrom.toISOString().split('T')[0]} - ${overlapping.seasonTo.toISOString().split('T')[0]})`
        );
      }
    }

    return this.prisma.guideRate.update({
      where: { id },
      data: dto,
      include: {
        serviceOffering: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findAll(tenantId: number, serviceOfferingId?: number, includeInactive = false) {
    return this.prisma.guideRate.findMany({
      where: {
        tenantId,
        ...(serviceOfferingId && { serviceOfferingId }),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        serviceOffering: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ serviceOfferingId: 'asc' }, { seasonFrom: 'asc' }],
    });
  }

  async findOne(id: number, tenantId: number) {
    const rate = await this.prisma.guideRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            guide: true,
            supplier: { include: { party: true } },
          },
        },
      },
    });

    if (!rate) {
      throw new NotFoundException(`Guide rate with ID ${id} not found`);
    }

    return rate;
  }

  async remove(id: number, tenantId: number) {
    const rate = await this.prisma.guideRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Guide rate with ID ${id} not found`);
    }

    await this.prisma.guideRate.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Guide rate deactivated successfully' };
  }
}
