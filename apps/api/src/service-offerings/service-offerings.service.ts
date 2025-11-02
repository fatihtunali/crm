import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class ServiceOfferingsService {
  private readonly logger = new Logger(ServiceOfferingsService.name);
  private readonly CACHE_TTL_10_MIN = 600 * 1000; // 10 minutes in milliseconds

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

    const result = await this.prisma.serviceOffering.create({
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

    // Invalidate cache for this tenant
    await this.invalidateCache(tenantId);

    return result;
  }

  async findAll(
    tenantId: number,
    serviceType?: ServiceType,
    supplierId?: number,
    location?: string,
    includeInactive = false,
  ) {
    // Create cache key based on query parameters
    const cacheKey = `service_offerings:${tenantId}:${serviceType || 'all'}:${supplierId || 'all'}:${location || 'all'}:${includeInactive}`;

    try {
      // Try to get from cache
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      this.logger.debug(`Cache miss for ${cacheKey}`);
    } catch (error) {
      // Cache read error - log and continue without cache
      this.logger.warn(`Cache read error for ${cacheKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Fetch from database
    const result = await this.prisma.serviceOffering.findMany({
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

    // Store in cache with 10 minute TTL
    try {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_10_MIN);
      this.logger.debug(`Cached ${cacheKey} with 10 minute TTL`);
    } catch (error) {
      // Cache write error - log but don't fail the request
      this.logger.warn(`Cache write error for ${cacheKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
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

    const result = await this.prisma.serviceOffering.update({
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

    // Invalidate cache for this tenant
    await this.invalidateCache(tenantId);

    return result;
  }

  async remove(id: number, tenantId: number) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: { id, tenantId },
    });

    if (!offering) {
      throw new NotFoundException(`Service offering with ID ${id} not found`);
    }

    // Soft delete
    const result = await this.prisma.serviceOffering.update({
      where: { id },
      data: { isActive: false },
    });

    // Invalidate cache for this tenant
    await this.invalidateCache(tenantId);

    return result;
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

  /**
   * Invalidate all cache entries for a specific tenant
   * Uses pattern matching to clear all service_offerings cache keys for the tenant
   */
  private async invalidateCache(tenantId: number): Promise<void> {
    try {
      // Since we're using different cache keys based on query params,
      // we need to clear all variations. With Redis, we could use pattern matching,
      // but with the cache-manager abstraction, we'll clear the main cache key variations.

      // Common cache key patterns to clear
      const patterns = [
        `service_offerings:${tenantId}:all:all:all:false`, // Default active only
        `service_offerings:${tenantId}:all:all:all:true`,  // Include inactive
      ];

      for (const pattern of patterns) {
        await this.cacheManager.del(pattern);
      }

      this.logger.debug(`Invalidated service offerings cache for tenant ${tenantId}`);
    } catch (error) {
      // Cache deletion error - log but don't fail the request
      this.logger.warn(
        `Cache invalidation error for tenant ${tenantId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
