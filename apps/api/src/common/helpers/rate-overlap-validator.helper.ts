import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Issue #32: Rate Season Overlap Detection Helper
 *
 * This helper provides reusable overlap detection for all rate types.
 */

export interface OverlapCheckParams {
  tenantId: number;
  serviceOfferingId: number;
  seasonFrom: Date;
  seasonTo: Date;
  boardType?: string; // For hotel rates
  excludeId?: number; // For update operations
}

export class RateOverlapValidator {
  /**
   * Build Prisma where clause for overlap detection
   */
  static buildOverlapWhere(params: OverlapCheckParams) {
    const { tenantId, serviceOfferingId, seasonFrom, seasonTo, boardType, excludeId } = params;

    return {
      tenantId,
      serviceOfferingId,
      ...(boardType && { boardType }),
      ...(excludeId && { id: { not: excludeId } }),
      isActive: true,
      OR: [
        {
          // New range starts within existing range
          seasonFrom: { lte: seasonFrom },
          seasonTo: { gte: seasonFrom },
        },
        {
          // New range ends within existing range
          seasonFrom: { lte: seasonTo },
          seasonTo: { gte: seasonTo },
        },
        {
          // New range completely contains existing range
          seasonFrom: { gte: seasonFrom },
          seasonTo: { lte: seasonTo },
        },
      ],
    };
  }

  /**
   * Check for overlapping hotel room rates
   */
  static async checkHotelRoomRateOverlap(
    prisma: PrismaService,
    params: OverlapCheckParams,
  ): Promise<void> {
    const overlappingRate = await prisma.hotelRoomRate.findFirst({
      where: this.buildOverlapWhere(params),
    });

    if (overlappingRate) {
      const boardTypeMsg = params.boardType ? ` for board type ${params.boardType}` : '';
      throw new ConflictException(
        `Rate season overlaps with existing rate (ID: ${overlappingRate.id}, ${overlappingRate.seasonFrom.toISOString().split('T')[0]} - ${overlappingRate.seasonTo.toISOString().split('T')[0]})${boardTypeMsg}`,
      );
    }
  }

  /**
   * Check for overlapping transfer rates
   */
  static async checkTransferRateOverlap(
    prisma: PrismaService,
    params: OverlapCheckParams,
  ): Promise<void> {
    const overlappingRate = await prisma.transferRate.findFirst({
      where: this.buildOverlapWhere(params),
    });

    if (overlappingRate) {
      throw new ConflictException(
        `Rate season overlaps with existing rate (ID: ${overlappingRate.id}, ${overlappingRate.seasonFrom.toISOString().split('T')[0]} - ${overlappingRate.seasonTo.toISOString().split('T')[0]})`,
      );
    }
  }

  /**
   * Check for overlapping vehicle rates
   */
  static async checkVehicleRateOverlap(
    prisma: PrismaService,
    params: OverlapCheckParams,
  ): Promise<void> {
    const overlappingRate = await prisma.vehicleRate.findFirst({
      where: this.buildOverlapWhere(params),
    });

    if (overlappingRate) {
      throw new ConflictException(
        `Rate season overlaps with existing rate (ID: ${overlappingRate.id}, ${overlappingRate.seasonFrom.toISOString().split('T')[0]} - ${overlappingRate.seasonTo.toISOString().split('T')[0]})`,
      );
    }
  }

  /**
   * Check for overlapping guide rates
   */
  static async checkGuideRateOverlap(
    prisma: PrismaService,
    params: OverlapCheckParams,
  ): Promise<void> {
    const overlappingRate = await prisma.guideRate.findFirst({
      where: this.buildOverlapWhere(params),
    });

    if (overlappingRate) {
      throw new ConflictException(
        `Rate season overlaps with existing rate (ID: ${overlappingRate.id}, ${overlappingRate.seasonFrom.toISOString().split('T')[0]} - ${overlappingRate.seasonTo.toISOString().split('T')[0]})`,
      );
    }
  }

  /**
   * Check for overlapping activity rates
   */
  static async checkActivityRateOverlap(
    prisma: PrismaService,
    params: OverlapCheckParams,
  ): Promise<void> {
    const overlappingRate = await prisma.activityRate.findFirst({
      where: this.buildOverlapWhere(params),
    });

    if (overlappingRate) {
      throw new ConflictException(
        `Rate season overlaps with existing rate (ID: ${overlappingRate.id}, ${overlappingRate.seasonFrom.toISOString().split('T')[0]} - ${overlappingRate.seasonTo.toISOString().split('T')[0]})`,
      );
    }
  }
}
