import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierType } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, dto: CreateSupplierDto) {
    // Verify the party belongs to this tenant
    const party = await this.prisma.party.findFirst({
      where: { id: dto.partyId, tenantId },
    });

    if (!party) {
      throw new BadRequestException(
        `Party with ID ${dto.partyId} not found or doesn't belong to your organization`,
      );
    }

    // Check if supplier already exists for this party
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        tenantId,
        partyId: dto.partyId,
      },
    });

    if (existingSupplier) {
      throw new ConflictException(
        `A supplier already exists for party ${party.name}`,
      );
    }

    return this.prisma.supplier.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        party: {
          include: {
            contacts: {
              where: { isActive: true },
              orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
            },
          },
        },
        serviceOfferings: {
          where: { isActive: true },
          take: 5,
        },
      },
    });
  }

  async findAll(
    tenantId: number,
    type?: SupplierType,
    includeInactive = false,
  ) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        ...(type ? { type } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        party: {
          include: {
            contacts: {
              where: { isActive: true, isPrimary: true },
            },
          },
        },
        _count: {
          select: {
            serviceOfferings: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ type: 'asc' }, { party: { name: 'asc' } }],
    });
  }

  async findOne(id: number, tenantId: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        party: {
          include: {
            contacts: {
              orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
            },
          },
        },
        serviceOfferings: {
          where: { isActive: true },
          include: {
            hotelRoom: true,
            transfer: true,
            vehicle: true,
            guide: true,
            activity: true,
            _count: {
              select: {
                hotelRoomRates: { where: { isActive: true } },
                transferRates: { where: { isActive: true } },
                vehicleRates: { where: { isActive: true } },
                guideRates: { where: { isActive: true } },
                activityRates: { where: { isActive: true } },
              },
            },
          },
          orderBy: { title: 'asc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: number, tenantId: number, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
      include: {
        party: {
          include: {
            contacts: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByType(tenantId: number, type: SupplierType) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        type,
        isActive: true,
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
        _count: {
          select: {
            serviceOfferings: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { party: { name: 'asc' } },
    });
  }

  async search(tenantId: number, searchTerm: string, type?: SupplierType) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(type ? { type } : {}),
        party: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
            { country: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      take: 20,
      orderBy: { party: { name: 'asc' } },
    });
  }

  async getStatsByType(tenantId: number) {
    const stats = await this.prisma.supplier.groupBy({
      by: ['type'],
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

  // ============================================
  // HOTEL MANAGEMENT (Quote Hotels)
  // ============================================

  async getAllHotels(tenantId: number, includeInactive: boolean = false) {
    const hotels = await this.prisma.quoteHotel.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
        pricing: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { hotelName: 'asc' },
    });

    return hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.hotelName,
      category: hotel.category,
      address: hotel.address,
      city: hotel.city,
      supplier: hotel.supplier
        ? {
            id: hotel.supplier.id,
            name: hotel.supplier.party.name,
            type: hotel.supplier.type,
          }
        : null,
      hasPricing: hotel.pricing.length > 0,
      isActive: hotel.isActive,
    }));
  }

  async getHotel(id: number, tenantId: number) {
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id, tenantId },
      include: {
        city: true,
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
        pricing: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return {
      id: hotel.id,
      name: hotel.hotelName,
      category: hotel.category,
      address: hotel.address,
      city: hotel.city,
      supplier: hotel.supplier
        ? {
            id: hotel.supplier.id,
            name: hotel.supplier.party.name,
            type: hotel.supplier.type,
            contacts: hotel.supplier.party.contacts,
          }
        : null,
      pricing: hotel.pricing,
      isActive: hotel.isActive,
      isBoutique: hotel.isBoutique,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,
    };
  }

  async createHotel(tenantId: number, createHotelDto: any) {
    // Validate city exists
    const city = await this.prisma.city.findFirst({
      where: { id: createHotelDto.cityId, tenantId },
    });

    if (!city) {
      throw new BadRequestException(
        `City with ID ${createHotelDto.cityId} not found`,
      );
    }

    // Validate supplier if provided
    if (createHotelDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createHotelDto.supplierId, tenantId },
      });

      if (!supplier) {
        throw new BadRequestException(
          `Supplier with ID ${createHotelDto.supplierId} not found`,
        );
      }
    }

    return this.prisma.quoteHotel.create({
      data: {
        hotelName: createHotelDto.name,
        category: createHotelDto.category,
        address: createHotelDto.address,
        cityId: createHotelDto.cityId,
        supplierId: createHotelDto.supplierId || null,
        isBoutique: createHotelDto.isBoutique || false,
        tenantId,
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });
  }

  async updateHotel(id: number, tenantId: number, updateHotelDto: any) {
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    // Validate city if provided
    if (updateHotelDto.cityId) {
      const city = await this.prisma.city.findFirst({
        where: { id: updateHotelDto.cityId, tenantId },
      });

      if (!city) {
        throw new BadRequestException(
          `City with ID ${updateHotelDto.cityId} not found`,
        );
      }
    }

    // Validate supplier if provided
    if (updateHotelDto.supplierId !== undefined) {
      if (updateHotelDto.supplierId !== null) {
        const supplier = await this.prisma.supplier.findFirst({
          where: { id: updateHotelDto.supplierId, tenantId },
        });

        if (!supplier) {
          throw new BadRequestException(
            `Supplier with ID ${updateHotelDto.supplierId} not found`,
          );
        }
      }
    }

    const updateData: any = {};
    if (updateHotelDto.name !== undefined)
      updateData.hotelName = updateHotelDto.name;
    if (updateHotelDto.category !== undefined)
      updateData.category = updateHotelDto.category;
    if (updateHotelDto.address !== undefined)
      updateData.address = updateHotelDto.address;
    if (updateHotelDto.cityId !== undefined)
      updateData.cityId = updateHotelDto.cityId;
    if (updateHotelDto.supplierId !== undefined)
      updateData.supplierId = updateHotelDto.supplierId;
    if (updateHotelDto.isBoutique !== undefined)
      updateData.isBoutique = updateHotelDto.isBoutique;

    return this.prisma.quoteHotel.update({
      where: { id },
      data: updateData,
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });
  }

  async deleteHotel(id: number, tenantId: number) {
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.quoteHotel.update({
      where: { id },
      data: { isActive: false },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });
  }

  // ============================================
  // HOTEL PRICING MANAGEMENT
  // ============================================

  async getAllHotelPricing(hotelId: number, tenantId: number) {
    // Verify hotel exists and belongs to tenant
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id: hotelId, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }

    const pricing = await this.prisma.quoteHotelPricing.findMany({
      where: {
        hotelId,
        isActive: true,
      },
      orderBy: [{ startDate: 'asc' }],
    });

    return pricing;
  }

  async getHotelPricing(id: number, hotelId: number, tenantId: number) {
    // Verify hotel exists and belongs to tenant
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id: hotelId, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }

    const pricing = await this.prisma.quoteHotelPricing.findFirst({
      where: {
        id,
        hotelId,
      },
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    return pricing;
  }

  async createHotelPricing(hotelId: number, tenantId: number, createPricingDto: any) {
    // Verify hotel exists and belongs to tenant
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id: hotelId, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }

    // Check for overlapping date ranges
    if (createPricingDto.startDate && createPricingDto.endDate) {
      const startDate = new Date(createPricingDto.startDate);
      const endDate = new Date(createPricingDto.endDate);

      const overlapping = await this.prisma.quoteHotelPricing.findFirst({
        where: {
          hotelId,
          isActive: true,
          OR: [
            {
              startDate: { lte: startDate },
              endDate: { gte: startDate },
            },
            {
              startDate: { lte: endDate },
              endDate: { gte: endDate },
            },
            {
              startDate: { gte: startDate },
              endDate: { lte: endDate },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Pricing dates overlap with existing pricing (ID: ${overlapping.id})`,
        );
      }
    }

    const pricing = await this.prisma.quoteHotelPricing.create({
      data: {
        ...createPricingDto,
        hotelId,
        startDate: createPricingDto.startDate ? new Date(createPricingDto.startDate) : null,
        endDate: createPricingDto.endDate ? new Date(createPricingDto.endDate) : null,
      },
    });

    return pricing;
  }

  async updateHotelPricing(id: number, hotelId: number, tenantId: number, updatePricingDto: any) {
    // Verify hotel exists and belongs to tenant
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id: hotelId, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }

    const existing = await this.prisma.quoteHotelPricing.findFirst({
      where: { id, hotelId },
    });

    if (!existing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    // Check for overlapping date ranges if dates are being updated
    if (updatePricingDto.startDate || updatePricingDto.endDate) {
      const startDate = updatePricingDto.startDate
        ? new Date(updatePricingDto.startDate)
        : existing.startDate;
      const endDate = updatePricingDto.endDate
        ? new Date(updatePricingDto.endDate)
        : existing.endDate;

      if (startDate && endDate) {
        const overlapping = await this.prisma.quoteHotelPricing.findFirst({
          where: {
            hotelId,
            isActive: true,
            id: { not: id }, // Exclude current pricing
            OR: [
              {
                startDate: { lte: startDate },
                endDate: { gte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
              {
                startDate: { gte: startDate },
                endDate: { lte: endDate },
              },
            ],
          },
        });

        if (overlapping) {
          throw new BadRequestException(
            `Pricing dates overlap with existing pricing (ID: ${overlapping.id})`,
          );
        }
      }
    }

    const pricing = await this.prisma.quoteHotelPricing.update({
      where: { id },
      data: {
        ...updatePricingDto,
        ...(updatePricingDto.startDate ? { startDate: new Date(updatePricingDto.startDate) } : {}),
        ...(updatePricingDto.endDate ? { endDate: new Date(updatePricingDto.endDate) } : {}),
      },
    });

    return pricing;
  }

  async deleteHotelPricing(id: number, hotelId: number, tenantId: number) {
    // Verify hotel exists and belongs to tenant
    const hotel = await this.prisma.quoteHotel.findFirst({
      where: { id: hotelId, tenantId },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }

    const pricing = await this.prisma.quoteHotelPricing.findFirst({
      where: { id, hotelId },
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.quoteHotelPricing.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Pricing deactivated successfully' };
  }

  // ============================================
  // TOURS (SIC TOURS) MANAGEMENT
  // ============================================

  async getAllTours(tenantId: number, includeInactive: boolean = false) {
    const tours = await this.prisma.sICTour.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
        pricing: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { tourName: 'asc' },
    });

    return tours.map((tour) => ({
      id: tour.id,
      name: tour.tourName,
      description: tour.description,
      city: tour.city,
      supplier: tour.supplier
        ? {
            id: tour.supplier.id,
            name: tour.supplier.party.name,
            type: tour.supplier.type,
          }
        : null,
      duration: tour.duration,
      tourType: tour.tourType,
      hasPricing: tour.pricing.length > 0,
      isActive: tour.isActive,
    }));
  }

  async getTour(id: number, tenantId: number) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id, tenantId },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return {
      id: tour.id,
      name: tour.tourName,
      description: tour.description,
      city: tour.city,
      supplier: tour.supplier
        ? {
            id: tour.supplier.id,
            name: tour.supplier.party.name,
          }
        : null,
      duration: tour.duration,
      tourCode: tour.tourCode,
      durationDays: tour.durationDays,
      durationHours: tour.durationHours,
      durationType: tour.durationType,
      tourType: tour.tourType,
      inclusions: tour.inclusions,
      exclusions: tour.exclusions,
      photoUrl1: tour.photoUrl1,
      photoUrl2: tour.photoUrl2,
      photoUrl3: tour.photoUrl3,
      isActive: tour.isActive,
    };
  }

  async createTour(tenantId: number, createTourDto: any) {
    const tour = await this.prisma.sICTour.create({
      data: {
        ...createTourDto,
        tourName: createTourDto.name,
        tenantId,
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });

    return tour;
  }

  async updateTour(id: number, tenantId: number, updateTourDto: any) {
    const existing = await this.prisma.sICTour.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    const tour = await this.prisma.sICTour.update({
      where: { id },
      data: {
        ...updateTourDto,
        ...(updateTourDto.name ? { tourName: updateTourDto.name } : {}),
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });

    return tour;
  }

  async deleteTour(id: number, tenantId: number) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    await this.prisma.sICTour.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Tour deactivated successfully' };
  }

  // ============================================
  // TOUR PRICING MANAGEMENT
  // ============================================

  async getAllTourPricing(tourId: number, tenantId: number) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id: tourId, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
    }

    const pricing = await this.prisma.sICTourPricing.findMany({
      where: {
        sicTourId: tourId,
        isActive: true,
      },
      orderBy: [{ startDate: 'asc' }],
    });

    return pricing;
  }

  async getTourPricing(id: number, tourId: number, tenantId: number) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id: tourId, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
    }

    const pricing = await this.prisma.sICTourPricing.findFirst({
      where: {
        id,
        sicTourId: tourId,
      },
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    return pricing;
  }

  async createTourPricing(tourId: number, tenantId: number, createPricingDto: any) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id: tourId, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
    }

    // Check for overlapping date ranges
    if (createPricingDto.startDate && createPricingDto.endDate) {
      const startDate = new Date(createPricingDto.startDate);
      const endDate = new Date(createPricingDto.endDate);

      const overlapping = await this.prisma.sICTourPricing.findFirst({
        where: {
          sicTourId: tourId,
          isActive: true,
          OR: [
            {
              startDate: { lte: startDate },
              endDate: { gte: startDate },
            },
            {
              startDate: { lte: endDate },
              endDate: { gte: endDate },
            },
            {
              startDate: { gte: startDate },
              endDate: { lte: endDate },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Pricing dates overlap with existing pricing (ID: ${overlapping.id})`,
        );
      }
    }

    const pricing = await this.prisma.sICTourPricing.create({
      data: {
        ...createPricingDto,
        sicTourId: tourId,
        tenantId,
        startDate: createPricingDto.startDate ? new Date(createPricingDto.startDate) : null,
        endDate: createPricingDto.endDate ? new Date(createPricingDto.endDate) : null,
      },
    });

    return pricing;
  }

  async updateTourPricing(id: number, tourId: number, tenantId: number, updatePricingDto: any) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id: tourId, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
    }

    const existing = await this.prisma.sICTourPricing.findFirst({
      where: { id, sicTourId: tourId },
    });

    if (!existing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    // Check for overlapping date ranges if dates are being updated
    if (updatePricingDto.startDate || updatePricingDto.endDate) {
      const startDate = updatePricingDto.startDate
        ? new Date(updatePricingDto.startDate)
        : existing.startDate;
      const endDate = updatePricingDto.endDate
        ? new Date(updatePricingDto.endDate)
        : existing.endDate;

      if (startDate && endDate) {
        const overlapping = await this.prisma.sICTourPricing.findFirst({
          where: {
            sicTourId: tourId,
            isActive: true,
            id: { not: id },
            OR: [
              {
                startDate: { lte: startDate },
                endDate: { gte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
              {
                startDate: { gte: startDate },
                endDate: { lte: endDate },
              },
            ],
          },
        });

        if (overlapping) {
          throw new BadRequestException(
            `Pricing dates overlap with existing pricing (ID: ${overlapping.id})`,
          );
        }
      }
    }

    const pricing = await this.prisma.sICTourPricing.update({
      where: { id },
      data: {
        ...updatePricingDto,
        ...(updatePricingDto.startDate ? { startDate: new Date(updatePricingDto.startDate) } : {}),
        ...(updatePricingDto.endDate ? { endDate: new Date(updatePricingDto.endDate) } : {}),
      },
    });

    return pricing;
  }

  async deleteTourPricing(id: number, tourId: number, tenantId: number) {
    const tour = await this.prisma.sICTour.findFirst({
      where: { id: tourId, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${tourId} not found`);
    }

    const pricing = await this.prisma.sICTourPricing.findFirst({
      where: { id, sicTourId: tourId },
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    await this.prisma.sICTourPricing.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Pricing deactivated successfully' };
  }

  // ============================================
  // RESTAURANTS MANAGEMENT
  // ============================================

  async getAllRestaurants(tenantId: number, includeInactive: boolean = false) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
        menus: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    return restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category,
      city: restaurant.city,
      supplier: restaurant.supplier
        ? {
            id: restaurant.supplier.id,
            name: restaurant.supplier.party.name,
            type: restaurant.supplier.type,
          }
        : null,
      hasMenus: restaurant.menus.length > 0,
      isActive: restaurant.isActive,
    }));
  }

  async getRestaurant(id: number, tenantId: number) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, tenantId },
      include: {
        city: true,
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
        menus: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category,
      city: restaurant.city,
      supplier: restaurant.supplier
        ? {
            id: restaurant.supplier.id,
            name: restaurant.supplier.party.name,
            type: restaurant.supplier.type,
            contacts: restaurant.supplier.party.contacts,
          }
        : null,
      menus: restaurant.menus,
      isActive: restaurant.isActive,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }

  async createRestaurant(tenantId: number, createRestaurantDto: any) {
    // Validate city exists
    const city = await this.prisma.city.findFirst({
      where: { id: createRestaurantDto.cityId, tenantId },
    });

    if (!city) {
      throw new BadRequestException(
        `City with ID ${createRestaurantDto.cityId} not found`,
      );
    }

    // Validate supplier if provided
    if (createRestaurantDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createRestaurantDto.supplierId, tenantId },
      });

      if (!supplier) {
        throw new BadRequestException(
          `Supplier with ID ${createRestaurantDto.supplierId} not found`,
        );
      }
    }

    return this.prisma.restaurant.create({
      data: {
        name: createRestaurantDto.name,
        category: createRestaurantDto.category,
        cityId: createRestaurantDto.cityId,
        supplierId: createRestaurantDto.supplierId || null,
        tenantId,
      },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });
  }

  async updateRestaurant(id: number, tenantId: number, updateRestaurantDto: any) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    // Validate city if provided
    if (updateRestaurantDto.cityId) {
      const city = await this.prisma.city.findFirst({
        where: { id: updateRestaurantDto.cityId, tenantId },
      });

      if (!city) {
        throw new BadRequestException(
          `City with ID ${updateRestaurantDto.cityId} not found`,
        );
      }
    }

    // Validate supplier if provided
    if (updateRestaurantDto.supplierId !== undefined) {
      if (updateRestaurantDto.supplierId !== null) {
        const supplier = await this.prisma.supplier.findFirst({
          where: { id: updateRestaurantDto.supplierId, tenantId },
        });

        if (!supplier) {
          throw new BadRequestException(
            `Supplier with ID ${updateRestaurantDto.supplierId} not found`,
          );
        }
      }
    }

    return this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto,
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });
  }

  async deleteRestaurant(id: number, tenantId: number) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.restaurant.update({
      where: { id },
      data: { isActive: false },
      include: {
        city: true,
        supplier: {
          include: {
            party: true,
          },
        },
      },
    });
  }

  // ============================================
  // RESTAURANT MENU MANAGEMENT
  // ============================================

  async getAllRestaurantMenus(restaurantId: number, tenantId: number) {
    // Verify restaurant exists and belongs to tenant
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const menus = await this.prisma.restaurantMenu.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
      orderBy: [{ startDate: 'asc' }],
    });

    return menus;
  }

  async getRestaurantMenu(id: number, restaurantId: number, tenantId: number) {
    // Verify restaurant exists and belongs to tenant
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const menu = await this.prisma.restaurantMenu.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async createRestaurantMenu(restaurantId: number, tenantId: number, createMenuDto: any) {
    // Verify restaurant exists and belongs to tenant
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    // Check for overlapping date ranges
    if (createMenuDto.startDate && createMenuDto.endDate) {
      const startDate = new Date(createMenuDto.startDate);
      const endDate = new Date(createMenuDto.endDate);

      const overlapping = await this.prisma.restaurantMenu.findFirst({
        where: {
          restaurantId,
          isActive: true,
          OR: [
            {
              startDate: { lte: startDate },
              endDate: { gte: startDate },
            },
            {
              startDate: { lte: endDate },
              endDate: { gte: endDate },
            },
            {
              startDate: { gte: startDate },
              endDate: { lte: endDate },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Menu dates overlap with existing menu (ID: ${overlapping.id})`,
        );
      }
    }

    const menu = await this.prisma.restaurantMenu.create({
      data: {
        ...createMenuDto,
        restaurantId,
        tenantId,
        startDate: createMenuDto.startDate ? new Date(createMenuDto.startDate) : null,
        endDate: createMenuDto.endDate ? new Date(createMenuDto.endDate) : null,
      },
    });

    return menu;
  }

  async updateRestaurantMenu(id: number, restaurantId: number, tenantId: number, updateMenuDto: any) {
    // Verify restaurant exists and belongs to tenant
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const existing = await this.prisma.restaurantMenu.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Check for overlapping date ranges if dates are being updated
    if (updateMenuDto.startDate || updateMenuDto.endDate) {
      const startDate = updateMenuDto.startDate
        ? new Date(updateMenuDto.startDate)
        : existing.startDate;
      const endDate = updateMenuDto.endDate
        ? new Date(updateMenuDto.endDate)
        : existing.endDate;

      if (startDate && endDate) {
        const overlapping = await this.prisma.restaurantMenu.findFirst({
          where: {
            restaurantId,
            isActive: true,
            id: { not: id }, // Exclude current menu
            OR: [
              {
                startDate: { lte: startDate },
                endDate: { gte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
              {
                startDate: { gte: startDate },
                endDate: { lte: endDate },
              },
            ],
          },
        });

        if (overlapping) {
          throw new BadRequestException(
            `Menu dates overlap with existing menu (ID: ${overlapping.id})`,
          );
        }
      }
    }

    const menu = await this.prisma.restaurantMenu.update({
      where: { id },
      data: {
        ...updateMenuDto,
        ...(updateMenuDto.startDate ? { startDate: new Date(updateMenuDto.startDate) } : {}),
        ...(updateMenuDto.endDate ? { endDate: new Date(updateMenuDto.endDate) } : {}),
      },
    });

    return menu;
  }

  async deleteRestaurantMenu(id: number, restaurantId: number, tenantId: number) {
    // Verify restaurant exists and belongs to tenant
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, tenantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const menu = await this.prisma.restaurantMenu.findFirst({
      where: { id, restaurantId },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.restaurantMenu.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Menu deactivated successfully' };
  }

  // ============================================
  // TRANSFERS (INTERCITY TRANSFERS) MANAGEMENT
  // ============================================

  async getAllTransfers(tenantId: number, includeInactive: boolean = false) {
    const transfers = await this.prisma.intercityTransfer.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        fromCity: true,
        toCity: true,
        supplier: {
          include: {
            party: true,
          },
        },
        catalogVehicle: true,
      },
      orderBy: [{ fromCity: { name: 'asc' } }, { toCity: { name: 'asc' } }],
    });

    return transfers.map((transfer) => ({
      id: transfer.id,
      fromCity: transfer.fromCity,
      toCity: transfer.toCity,
      supplier: transfer.supplier
        ? {
            id: transfer.supplier.id,
            name: transfer.supplier.party.name,
            type: transfer.supplier.type,
          }
        : null,
      vehicleClass: transfer.vehicleClass,
      catalogVehicle: transfer.catalogVehicle,
      priceOneway: transfer.priceOneway,
      priceRoundtrip: transfer.priceRoundtrip,
      estimatedDurationHours: transfer.estimatedDurationHours,
      notes: transfer.notes,
      isActive: transfer.isActive,
    }));
  }

  async getTransfer(id: number, tenantId: number) {
    const transfer = await this.prisma.intercityTransfer.findFirst({
      where: { id, tenantId },
      include: {
        fromCity: true,
        toCity: true,
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
        catalogVehicle: true,
      },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    return {
      id: transfer.id,
      fromCityId: transfer.fromCityId,
      fromCity: transfer.fromCity,
      toCityId: transfer.toCityId,
      toCity: transfer.toCity,
      supplierId: transfer.supplierId,
      supplier: transfer.supplier
        ? {
            id: transfer.supplier.id,
            name: transfer.supplier.party.name,
            type: transfer.supplier.type,
            contacts: transfer.supplier.party.contacts,
          }
        : null,
      catalogVehicleId: transfer.catalogVehicleId,
      catalogVehicle: transfer.catalogVehicle,
      vehicleClass: transfer.vehicleClass,
      maxPassengers: transfer.maxPassengers,
      price: transfer.price,
      priceOneway: transfer.priceOneway,
      priceRoundtrip: transfer.priceRoundtrip,
      estimatedDurationHours: transfer.estimatedDurationHours,
      notes: transfer.notes,
      seasonName: transfer.seasonName,
      startDate: transfer.startDate,
      endDate: transfer.endDate,
      isActive: transfer.isActive,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
    };
  }

  async createTransfer(tenantId: number, createTransferDto: any) {
    // Validate fromCity exists
    const fromCity = await this.prisma.city.findFirst({
      where: { id: createTransferDto.fromCityId, tenantId },
    });

    if (!fromCity) {
      throw new BadRequestException(
        `From City with ID ${createTransferDto.fromCityId} not found`,
      );
    }

    // Validate toCity exists
    const toCity = await this.prisma.city.findFirst({
      where: { id: createTransferDto.toCityId, tenantId },
    });

    if (!toCity) {
      throw new BadRequestException(
        `To City with ID ${createTransferDto.toCityId} not found`,
      );
    }

    // Validate supplier if provided
    if (createTransferDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createTransferDto.supplierId, tenantId },
      });

      if (!supplier) {
        throw new BadRequestException(
          `Supplier with ID ${createTransferDto.supplierId} not found`,
        );
      }
    }

    // Validate catalogVehicle if provided
    if (createTransferDto.catalogVehicleId) {
      const catalogVehicle = await this.prisma.catalogVehicle.findFirst({
        where: { id: createTransferDto.catalogVehicleId, tenantId },
      });

      if (!catalogVehicle) {
        throw new BadRequestException(
          `Catalog Vehicle with ID ${createTransferDto.catalogVehicleId} not found`,
        );
      }
    }

    return this.prisma.intercityTransfer.create({
      data: {
        ...createTransferDto,
        tenantId,
        startDate: createTransferDto.startDate ? new Date(createTransferDto.startDate) : null,
        endDate: createTransferDto.endDate ? new Date(createTransferDto.endDate) : null,
      },
      include: {
        fromCity: true,
        toCity: true,
        supplier: {
          include: {
            party: true,
          },
        },
        catalogVehicle: true,
      },
    });
  }

  async updateTransfer(id: number, tenantId: number, updateTransferDto: any) {
    const transfer = await this.prisma.intercityTransfer.findFirst({
      where: { id, tenantId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    // Validate fromCity if provided
    if (updateTransferDto.fromCityId) {
      const fromCity = await this.prisma.city.findFirst({
        where: { id: updateTransferDto.fromCityId, tenantId },
      });

      if (!fromCity) {
        throw new BadRequestException(
          `From City with ID ${updateTransferDto.fromCityId} not found`,
        );
      }
    }

    // Validate toCity if provided
    if (updateTransferDto.toCityId) {
      const toCity = await this.prisma.city.findFirst({
        where: { id: updateTransferDto.toCityId, tenantId },
      });

      if (!toCity) {
        throw new BadRequestException(
          `To City with ID ${updateTransferDto.toCityId} not found`,
        );
      }
    }

    // Validate supplier if provided
    if (updateTransferDto.supplierId !== undefined) {
      if (updateTransferDto.supplierId !== null) {
        const supplier = await this.prisma.supplier.findFirst({
          where: { id: updateTransferDto.supplierId, tenantId },
        });

        if (!supplier) {
          throw new BadRequestException(
            `Supplier with ID ${updateTransferDto.supplierId} not found`,
          );
        }
      }
    }

    // Validate catalogVehicle if provided
    if (updateTransferDto.catalogVehicleId !== undefined) {
      if (updateTransferDto.catalogVehicleId !== null) {
        const catalogVehicle = await this.prisma.catalogVehicle.findFirst({
          where: { id: updateTransferDto.catalogVehicleId, tenantId },
        });

        if (!catalogVehicle) {
          throw new BadRequestException(
            `Catalog Vehicle with ID ${updateTransferDto.catalogVehicleId} not found`,
          );
        }
      }
    }

    const updateData: any = { ...updateTransferDto };
    if (updateTransferDto.startDate) {
      updateData.startDate = new Date(updateTransferDto.startDate);
    }
    if (updateTransferDto.endDate) {
      updateData.endDate = new Date(updateTransferDto.endDate);
    }

    return this.prisma.intercityTransfer.update({
      where: { id },
      data: updateData,
      include: {
        fromCity: true,
        toCity: true,
        supplier: {
          include: {
            party: true,
          },
        },
        catalogVehicle: true,
      },
    });
  }

  async deleteTransfer(id: number, tenantId: number) {
    const transfer = await this.prisma.intercityTransfer.findFirst({
      where: { id, tenantId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.intercityTransfer.update({
      where: { id },
      data: { isActive: false },
      include: {
        fromCity: true,
        toCity: true,
        supplier: {
          include: {
            party: true,
          },
        },
        catalogVehicle: true,
      },
    });
  }

  // ============================================
  // TRANSFER PRICING MANAGEMENT
  // Note: IntercityTransfer model has embedded pricing (priceOneway, priceRoundtrip, dates)
  // Each transfer record IS a pricing entry for a route/vehicle/date combination
  // ============================================

  async getAllTransferPricing(transferId: number, tenantId: number) {
    // Verify base transfer exists and belongs to tenant
    const baseTransfer = await this.prisma.intercityTransfer.findFirst({
      where: { id: transferId, tenantId },
    });

    if (!baseTransfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }

    // Get all pricing variations for this route (same from/to cities, vehicle, supplier)
    const pricingVariations = await this.prisma.intercityTransfer.findMany({
      where: {
        tenantId,
        fromCityId: baseTransfer.fromCityId,
        toCityId: baseTransfer.toCityId,
        vehicleClass: baseTransfer.vehicleClass,
        supplierId: baseTransfer.supplierId,
        isActive: true,
      },
      orderBy: [{ startDate: 'asc' }],
    });

    return pricingVariations;
  }

  async getTransferPricing(id: number, transferId: number, tenantId: number) {
    // Verify base transfer exists and belongs to tenant
    const baseTransfer = await this.prisma.intercityTransfer.findFirst({
      where: { id: transferId, tenantId },
    });

    if (!baseTransfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }

    const pricing = await this.prisma.intercityTransfer.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!pricing) {
      throw new NotFoundException(`Transfer pricing with ID ${id} not found`);
    }

    return pricing;
  }

  async createTransferPricing(transferId: number, tenantId: number, createPricingDto: any) {
    // Verify base transfer exists and belongs to tenant
    const baseTransfer = await this.prisma.intercityTransfer.findFirst({
      where: { id: transferId, tenantId },
    });

    if (!baseTransfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }

    // Check for overlapping date ranges
    if (createPricingDto.startDate && createPricingDto.endDate) {
      const startDate = new Date(createPricingDto.startDate);
      const endDate = new Date(createPricingDto.endDate);

      const overlapping = await this.prisma.intercityTransfer.findFirst({
        where: {
          tenantId,
          fromCityId: baseTransfer.fromCityId,
          toCityId: baseTransfer.toCityId,
          vehicleClass: createPricingDto.vehicleClass || baseTransfer.vehicleClass,
          supplierId: createPricingDto.supplierId ?? baseTransfer.supplierId,
          isActive: true,
          OR: [
            {
              startDate: { lte: startDate },
              endDate: { gte: startDate },
            },
            {
              startDate: { lte: endDate },
              endDate: { gte: endDate },
            },
            {
              startDate: { gte: startDate },
              endDate: { lte: endDate },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Transfer pricing dates overlap with existing pricing (ID: ${overlapping.id})`,
        );
      }
    }

    // Create new pricing entry (inheriting route details from base transfer)
    const pricing = await this.prisma.intercityTransfer.create({
      data: {
        tenantId,
        fromCityId: baseTransfer.fromCityId,
        toCityId: baseTransfer.toCityId,
        supplierId: createPricingDto.supplierId ?? baseTransfer.supplierId,
        catalogVehicleId: createPricingDto.catalogVehicleId ?? baseTransfer.catalogVehicleId,
        vehicleClass: createPricingDto.vehicleClass || baseTransfer.vehicleClass,
        maxPassengers: createPricingDto.maxPassengers ?? baseTransfer.maxPassengers,
        priceOneway: createPricingDto.priceOneway,
        priceRoundtrip: createPricingDto.priceRoundtrip,
        estimatedDurationHours: createPricingDto.estimatedDurationHours ?? baseTransfer.estimatedDurationHours,
        notes: createPricingDto.notes,
        seasonName: createPricingDto.seasonName,
        startDate: createPricingDto.startDate ? new Date(createPricingDto.startDate) : null,
        endDate: createPricingDto.endDate ? new Date(createPricingDto.endDate) : null,
      },
      include: {
        fromCity: true,
        toCity: true,
        supplier: {
          include: {
            party: true,
          },
        },
        catalogVehicle: true,
      },
    });

    return pricing;
  }

  async updateTransferPricing(id: number, transferId: number, tenantId: number, updatePricingDto: any) {
    // Verify base transfer exists and belongs to tenant
    const baseTransfer = await this.prisma.intercityTransfer.findFirst({
      where: { id: transferId, tenantId },
    });

    if (!baseTransfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }

    const existing = await this.prisma.intercityTransfer.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Transfer pricing with ID ${id} not found`);
    }

    // Check for overlapping date ranges if dates are being updated
    if (updatePricingDto.startDate || updatePricingDto.endDate) {
      const startDate = updatePricingDto.startDate
        ? new Date(updatePricingDto.startDate)
        : existing.startDate;
      const endDate = updatePricingDto.endDate
        ? new Date(updatePricingDto.endDate)
        : existing.endDate;

      if (startDate && endDate) {
        const overlapping = await this.prisma.intercityTransfer.findFirst({
          where: {
            tenantId,
            id: { not: id }, // Exclude current pricing
            fromCityId: existing.fromCityId,
            toCityId: existing.toCityId,
            vehicleClass: updatePricingDto.vehicleClass ?? existing.vehicleClass,
            supplierId: updatePricingDto.supplierId ?? existing.supplierId,
            isActive: true,
            OR: [
              {
                startDate: { lte: startDate },
                endDate: { gte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
              {
                startDate: { gte: startDate },
                endDate: { lte: endDate },
              },
            ],
          },
        });

        if (overlapping) {
          throw new BadRequestException(
            `Transfer pricing dates overlap with existing pricing (ID: ${overlapping.id})`,
          );
        }
      }
    }

    const updateData: any = { ...updatePricingDto };
    if (updatePricingDto.startDate) {
      updateData.startDate = new Date(updatePricingDto.startDate);
    }
    if (updatePricingDto.endDate) {
      updateData.endDate = new Date(updatePricingDto.endDate);
    }

    const pricing = await this.prisma.intercityTransfer.update({
      where: { id },
      data: updateData,
      include: {
        fromCity: true,
        toCity: true,
        supplier: {
          include: {
            party: true,
          },
        },
        catalogVehicle: true,
      },
    });

    return pricing;
  }

  async deleteTransferPricing(id: number, transferId: number, tenantId: number) {
    // Verify base transfer exists and belongs to tenant
    const baseTransfer = await this.prisma.intercityTransfer.findFirst({
      where: { id: transferId, tenantId },
    });

    if (!baseTransfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }

    const pricing = await this.prisma.intercityTransfer.findFirst({
      where: { id, tenantId },
    });

    if (!pricing) {
      throw new NotFoundException(`Transfer pricing with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.intercityTransfer.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Transfer pricing deactivated successfully' };
  }
}
