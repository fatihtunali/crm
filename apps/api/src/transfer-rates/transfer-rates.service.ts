import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferRateDto } from './dto/create-transfer-rate.dto';
import { UpdateTransferRateDto } from './dto/update-transfer-rate.dto';
import { buildOverlapWhereClause } from '../common/utils/date-range-overlap.util';

/**
 * Issue #32: Transfer Rates Service with Season Overlap Detection
 */
@Injectable()
export class TransferRatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransferRateDto, tenantId: number) {
    if (dto.seasonFrom >= dto.seasonTo) {
      throw new BadRequestException('Season start date must be before end date');
    }

    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: 'TRANSFER',
      },
    });

    if (!offering) {
      throw new NotFoundException(
        `Transfer service offering with ID ${dto.serviceOfferingId} not found`
      );
    }

    // Issue #32: Check for overlapping rate seasons
    const overlapWhere = buildOverlapWhereClause(dto.seasonFrom, dto.seasonTo);

    const overlapping = await this.prisma.transferRate.findFirst({
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

    return this.prisma.transferRate.create({
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

  async update(id: number, dto: UpdateTransferRateDto, tenantId: number) {
    const existing = await this.prisma.transferRate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Transfer rate with ID ${id} not found`);
    }

    if (dto.seasonFrom || dto.seasonTo) {
      const seasonFrom = dto.seasonFrom ?? existing.seasonFrom;
      const seasonTo = dto.seasonTo ?? existing.seasonTo;

      if (seasonFrom >= seasonTo) {
        throw new BadRequestException('Season start date must be before end date');
      }

      // Issue #32: Check for overlapping rate seasons
      const overlapWhere = buildOverlapWhereClause(seasonFrom, seasonTo);

      const overlapping = await this.prisma.transferRate.findFirst({
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

    return this.prisma.transferRate.update({
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
    return this.prisma.transferRate.findMany({
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
    const rate = await this.prisma.transferRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            transfer: true,
            supplier: { include: { party: true } },
          },
        },
      },
    });

    if (!rate) {
      throw new NotFoundException(`Transfer rate with ID ${id} not found`);
    }

    return rate;
  }

  async remove(id: number, tenantId: number) {
    const rate = await this.prisma.transferRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Transfer rate with ID ${id} not found`);
    }

    await this.prisma.transferRate.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Transfer rate deactivated successfully' };
  }
}
