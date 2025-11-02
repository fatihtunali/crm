import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleRateDto } from './dto/create-vehicle-rate.dto';
import { UpdateVehicleRateDto } from './dto/update-vehicle-rate.dto';
import { buildOverlapWhereClause } from '../common/utils/date-range-overlap.util';

/**
 * Issue #32: Vehicle Rates Service with Season Overlap Detection
 */
@Injectable()
export class VehicleRatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVehicleRateDto, tenantId: number) {
    if (dto.seasonFrom >= dto.seasonTo) {
      throw new BadRequestException('Season start date must be before end date');
    }

    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: 'VEHICLE_HIRE',
      },
    });

    if (!offering) {
      throw new NotFoundException(
        `Vehicle hire service offering with ID ${dto.serviceOfferingId} not found`
      );
    }

    // Issue #32: Check for overlapping rate seasons
    const overlapWhere = buildOverlapWhereClause(dto.seasonFrom, dto.seasonTo);

    const overlapping = await this.prisma.vehicleRate.findFirst({
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

    return this.prisma.vehicleRate.create({
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

  async update(id: number, dto: UpdateVehicleRateDto, tenantId: number) {
    const existing = await this.prisma.vehicleRate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Vehicle rate with ID ${id} not found`);
    }

    if (dto.seasonFrom || dto.seasonTo) {
      const seasonFrom = dto.seasonFrom ?? existing.seasonFrom;
      const seasonTo = dto.seasonTo ?? existing.seasonTo;

      if (seasonFrom >= seasonTo) {
        throw new BadRequestException('Season start date must be before end date');
      }

      // Issue #32: Check for overlapping rate seasons
      const overlapWhere = buildOverlapWhereClause(seasonFrom, seasonTo);

      const overlapping = await this.prisma.vehicleRate.findFirst({
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

    return this.prisma.vehicleRate.update({
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
    return this.prisma.vehicleRate.findMany({
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
    const rate = await this.prisma.vehicleRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            vehicle: true,
            supplier: { include: { party: true } },
          },
        },
      },
    });

    if (!rate) {
      throw new NotFoundException(`Vehicle rate with ID ${id} not found`);
    }

    return rate;
  }

  async remove(id: number, tenantId: number) {
    const rate = await this.prisma.vehicleRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Vehicle rate with ID ${id} not found`);
    }

    await this.prisma.vehicleRate.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Vehicle rate deactivated successfully' };
  }
}
