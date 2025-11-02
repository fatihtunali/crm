import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelRoomRateDto } from './dto/create-hotel-room-rate.dto';
import { UpdateHotelRoomRateDto } from './dto/update-hotel-room-rate.dto';
import { buildOverlapWhereClause } from '../common/utils/date-range-overlap.util';

/**
 * Issue #32: Hotel Room Rates Service with Season Overlap Detection
 *
 * This service manages hotel room rates with validation to prevent
 * overlapping rate seasons for the same service offering.
 */
@Injectable()
export class HotelRoomRatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new hotel room rate with overlap validation
   */
  async create(dto: CreateHotelRoomRateDto, tenantId: number) {
    // Validate dates
    if (dto.seasonFrom >= dto.seasonTo) {
      throw new BadRequestException('Season start date must be before end date');
    }

    // Verify service offering exists and belongs to tenant
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: 'HOTEL_ROOM',
      },
    });

    if (!offering) {
      throw new NotFoundException(
        `Hotel room service offering with ID ${dto.serviceOfferingId} not found`
      );
    }

    // Issue #32: Check for overlapping rate seasons
    const overlapWhere = buildOverlapWhereClause(dto.seasonFrom, dto.seasonTo);

    const overlapping = await this.prisma.hotelRoomRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: dto.serviceOfferingId,
        boardType: dto.boardType, // Same board type
        isActive: true,
        ...overlapWhere,
      },
    });

    if (overlapping) {
      throw new ConflictException(
        `Rate season overlaps with existing rate (${overlapping.seasonFrom.toISOString().split('T')[0]} - ${overlapping.seasonTo.toISOString().split('T')[0]}) for board type ${dto.boardType}`
      );
    }

    // Create the rate
    return this.prisma.hotelRoomRate.create({
      data: {
        tenantId,
        serviceOfferingId: dto.serviceOfferingId,
        seasonFrom: dto.seasonFrom,
        seasonTo: dto.seasonTo,
        boardType: dto.boardType,
        pricePerPersonDouble: dto.pricePerPersonDouble,
        singleSupplement: dto.singleSupplement,
        pricePerPersonTriple: dto.pricePerPersonTriple,
        childPrice0to2: dto.childPrice0to2,
        childPrice3to5: dto.childPrice3to5,
        childPrice6to11: dto.childPrice6to11,
        allotment: dto.allotment,
        releaseDays: dto.releaseDays,
        minStay: dto.minStay ?? 1,
        notes: dto.notes,
        isActive: dto.isActive ?? true,
      },
      include: {
        serviceOffering: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing hotel room rate with overlap validation
   */
  async update(id: number, dto: UpdateHotelRoomRateDto, tenantId: number) {
    // Check if rate exists
    const existing = await this.prisma.hotelRoomRate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Hotel room rate with ID ${id} not found`);
    }

    // If dates are being updated, validate and check for overlaps
    if (dto.seasonFrom || dto.seasonTo) {
      const seasonFrom = dto.seasonFrom ?? existing.seasonFrom;
      const seasonTo = dto.seasonTo ?? existing.seasonTo;

      if (seasonFrom >= seasonTo) {
        throw new BadRequestException('Season start date must be before end date');
      }

      // Issue #32: Check for overlapping rate seasons (excluding current rate)
      const overlapWhere = buildOverlapWhereClause(seasonFrom, seasonTo);
      const boardType = dto.boardType ?? existing.boardType;

      const overlapping = await this.prisma.hotelRoomRate.findFirst({
        where: {
          tenantId,
          serviceOfferingId: existing.serviceOfferingId,
          boardType,
          isActive: true,
          id: { not: id }, // Exclude current rate
          ...overlapWhere,
        },
      });

      if (overlapping) {
        throw new ConflictException(
          `Rate season overlaps with existing rate (${overlapping.seasonFrom.toISOString().split('T')[0]} - ${overlapping.seasonTo.toISOString().split('T')[0]}) for board type ${boardType}`
        );
      }
    }

    // Update the rate
    return this.prisma.hotelRoomRate.update({
      where: { id },
      data: {
        seasonFrom: dto.seasonFrom,
        seasonTo: dto.seasonTo,
        boardType: dto.boardType,
        pricePerPersonDouble: dto.pricePerPersonDouble,
        singleSupplement: dto.singleSupplement,
        pricePerPersonTriple: dto.pricePerPersonTriple,
        childPrice0to2: dto.childPrice0to2,
        childPrice3to5: dto.childPrice3to5,
        childPrice6to11: dto.childPrice6to11,
        allotment: dto.allotment,
        releaseDays: dto.releaseDays,
        minStay: dto.minStay,
        notes: dto.notes,
        isActive: dto.isActive,
      },
      include: {
        serviceOffering: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Find all hotel room rates for a service offering
   */
  async findAll(tenantId: number, serviceOfferingId?: number, includeInactive = false) {
    return this.prisma.hotelRoomRate.findMany({
      where: {
        tenantId,
        ...(serviceOfferingId && { serviceOfferingId }),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        serviceOffering: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { serviceOfferingId: 'asc' },
        { seasonFrom: 'asc' },
      ],
    });
  }

  /**
   * Find a single hotel room rate by ID
   */
  async findOne(id: number, tenantId: number) {
    const rate = await this.prisma.hotelRoomRate.findFirst({
      where: { id, tenantId },
      include: {
        serviceOffering: {
          include: {
            hotelRoom: true,
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
      throw new NotFoundException(`Hotel room rate with ID ${id} not found`);
    }

    return rate;
  }

  /**
   * Delete (deactivate) a hotel room rate
   */
  async remove(id: number, tenantId: number) {
    const rate = await this.prisma.hotelRoomRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Hotel room rate with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.hotelRoomRate.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Hotel room rate deactivated successfully' };
  }

  /**
   * Find rate for a specific date
   */
  async findRateForDate(
    serviceOfferingId: number,
    date: Date,
    boardType: string,
    tenantId: number
  ) {
    return this.prisma.hotelRoomRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId,
        boardType: boardType as any,
        seasonFrom: { lte: date },
        seasonTo: { gte: date },
        isActive: true,
      },
      orderBy: [
        { seasonFrom: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }
}
