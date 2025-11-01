/**
 * Catalog Service - Query hotels, tours, transfers for quotations
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}
  /**
   * Get hotels for a city with pricing for date range
   */
  async getHotelsForCity(params: {
    tenantId: number;
    cityId: number;
    category?: string;
    startDate: Date;
    endDate: Date;
    isBoutique?: boolean;
  }) {
    const { tenantId, cityId, category, startDate, endDate, isBoutique } = params;

    const hotels = await this.prisma.quoteHotel.findMany({
      where: {
        tenantId,
        cityId,
        isActive: true,
        ...(category && { category }),
        ...(isBoutique !== undefined && { isBoutique }),
      },
      include: {
        city: true,
        pricing: {
          where: {
            OR: [
              // Date range overlaps
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
              // No date restrictions
              {
                startDate: null,
                endDate: null,
              },
            ],
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 1, // Get most recent applicable pricing
        },
      },
    });

    return hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.hotelName,
      category: hotel.category,
      city: hotel.city.name,
      address: hotel.address,
      rating: hotel.rating,
      photoUrl: hotel.photoUrl1,
      pricing: hotel.pricing[0] || null,
      isBoutique: hotel.isBoutique,
    }));
  }

  /**
   * Get tours for a city with pricing
   */
  async getToursForCity(params: {
    tenantId: number;
    cityId: number;
    tourType?: 'SIC' | 'PRIVATE';
    startDate: Date;
    endDate: Date;
  }) {
    const { tenantId, cityId, tourType, startDate, endDate } = params;

    const tours = await this.prisma.sICTour.findMany({
      where: {
        tenantId,
        cityId,
        isActive: true,
        ...(tourType && { tourType }),
      },
      include: {
        city: true,
        pricing: {
          where: {
            OR: [
              // Date range overlaps
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
              // No date restrictions
              {
                startDate: null,
                endDate: null,
              },
            ],
            isActive: true,
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 1,
        },
      },
    });

    return tours.map((tour) => ({
      id: tour.id,
      name: tour.tourName,
      city: tour.city.name,
      description: tour.description,
      duration: tour.durationDays,
      tourType: tour.tourType,
      inclusions: tour.inclusions,
      exclusions: tour.exclusions,
      rating: tour.rating,
      photoUrl: tour.photoUrl1,
      pricing: tour.pricing[0] || null,
    }));
  }

  /**
   * Get intercity transfers (including airport transfers)
   */
  async getTransfers(params: {
    tenantId: number;
    fromCityId: number;
    toCityId: number;
    startDate: Date;
    endDate: Date;
  }) {
    const { tenantId, fromCityId, toCityId, startDate, endDate } = params;

    const transfers = await this.prisma.intercityTransfer.findMany({
      where: {
        tenantId,
        isActive: true,
        AND: [
          // Route matching (direct or reverse)
          {
            OR: [
              { fromCityId, toCityId },
              { fromCityId: toCityId, toCityId: fromCityId },
            ],
          },
          // Date matching
          {
            OR: [
              // Date range overlaps
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
              // No date restrictions
              {
                startDate: null,
                endDate: null,
              },
            ],
          },
        ],
      },
      include: {
        fromCity: true,
        toCity: true,
        catalogVehicle: true,
      },
      orderBy: {
        priceOneway: 'asc', // Cheapest first
      },
    });

    return transfers.map((transfer) => ({
      id: transfer.id,
      from: transfer.fromCity.name,
      to: transfer.toCity.name,
      priceOneway: transfer.priceOneway,
      priceRoundtrip: transfer.priceRoundtrip,
      duration: transfer.estimatedDurationHours,
      vehicle: transfer.catalogVehicle
        ? {
            type: transfer.catalogVehicle.vehicleType,
            capacity: transfer.catalogVehicle.maxCapacity,
          }
        : null,
    }));
  }

  /**
   * Get all cities (for dropdowns)
   */
  async getCities(tenantId: number, includeAirports = false) {
    const cities = await this.prisma.city.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(includeAirports ? {} : { isAirport: false }),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities.map((city) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      isAirport: city.isAirport,
    }));
  }

  /**
   * Calculate pricing for specific PAX count
   */
  calculatePriceForPax(pricing: any, pax: number, tourType: 'SIC' | 'PRIVATE'): number {
    if (!pricing) return 0;

    const prefix = tourType === 'SIC' ? 'sicPrice' : 'pvtPrice';

    // Find closest PAX tier (2, 4, 6, 8, 10)
    const tiers = [2, 4, 6, 8, 10];
    const tier = tiers.find((t) => pax <= t) || 10;

    const priceKey = `${prefix}${tier}Pax` as keyof typeof pricing;
    return Number(pricing[priceKey] || 0);
  }
}
