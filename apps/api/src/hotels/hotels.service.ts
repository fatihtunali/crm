import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';
import { CreateHotelRoomRateDto } from './dto/create-hotel-room-rate.dto';
import { UpdateHotelRoomRateDto } from './dto/update-hotel-room-rate.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // HOTEL ROOMS (Details)
  // ============================================

  async createHotelRoom(tenantId: number, dto: CreateHotelRoomDto) {
    // Verify the service offering exists and is a hotel room type
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.HOTEL_ROOM,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a hotel room type`,
      );
    }

    // Check if hotel room already exists for this offering
    const existing = await this.prisma.hotelRoom.findUnique({
      where: { serviceOfferingId: dto.serviceOfferingId },
    });

    if (existing) {
      throw new ConflictException(
        `Hotel room already exists for this service offering`,
      );
    }

    return this.prisma.hotelRoom.create({
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

  async findAllHotelRooms(
    tenantId: number,
    city?: string,
    stars?: number,
    supplierId?: number,
  ) {
    return this.prisma.hotelRoom.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
          ...(supplierId ? { supplierId } : {}),
        },
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(stars ? { stars } : {}),
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
                hotelRoomRates: { where: { isActive: true } },
              },
            },
          },
        },
      },
      orderBy: [{ city: 'asc' }, { hotelName: 'asc' }],
    });
  }

  async findOneHotelRoom(serviceOfferingId: number, tenantId: number) {
    const hotelRoom = await this.prisma.hotelRoom.findFirst({
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
            hotelRoomRates: {
              where: { isActive: true },
              orderBy: [{ seasonFrom: 'asc' }],
            },
          },
        },
      },
    });

    if (!hotelRoom) {
      throw new NotFoundException(`Hotel room not found`);
    }

    return hotelRoom;
  }

  async updateHotelRoom(
    serviceOfferingId: number,
    tenantId: number,
    dto: UpdateHotelRoomDto,
  ) {
    const hotelRoom = await this.prisma.hotelRoom.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!hotelRoom) {
      throw new NotFoundException(`Hotel room not found`);
    }

    return this.prisma.hotelRoom.update({
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

  async removeHotelRoom(serviceOfferingId: number, tenantId: number) {
    const hotelRoom = await this.prisma.hotelRoom.findFirst({
      where: {
        serviceOfferingId,
        serviceOffering: { tenantId },
      },
    });

    if (!hotelRoom) {
      throw new NotFoundException(`Hotel room not found`);
    }

    // Soft delete by deactivating the service offering
    return this.prisma.serviceOffering.update({
      where: { id: serviceOfferingId },
      data: { isActive: false },
    });
  }

  // ============================================
  // HOTEL ROOM RATES
  // ============================================

  async createHotelRoomRate(tenantId: number, dto: CreateHotelRoomRateDto) {
    // Verify the service offering exists and is a hotel room type
    const offering = await this.prisma.serviceOffering.findFirst({
      where: {
        id: dto.serviceOfferingId,
        tenantId,
        serviceType: ServiceType.HOTEL_ROOM,
      },
      include: {
        hotelRoom: true,
      },
    });

    if (!offering) {
      throw new BadRequestException(
        `Service offering with ID ${dto.serviceOfferingId} not found or is not a hotel room type`,
      );
    }

    if (!offering.hotelRoom) {
      throw new BadRequestException(
        `Hotel room details must be created before adding rates`,
      );
    }

    return this.prisma.hotelRoomRate.create({
      data: {
        ...dto,
        seasonFrom: new Date(dto.seasonFrom),
        seasonTo: new Date(dto.seasonTo),
        tenantId,
      },
      include: {
        serviceOffering: {
          include: {
            hotelRoom: true,
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

  async findAllHotelRoomRates(
    tenantId: number,
    serviceOfferingId?: number,
    boardType?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return this.prisma.hotelRoomRate.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(serviceOfferingId ? { serviceOfferingId } : {}),
        ...(boardType ? { boardType: boardType as any } : {}),
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
            hotelRoom: {
              select: {
                hotelName: true,
                city: true,
                roomType: true,
                stars: true,
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
      orderBy: [{ seasonFrom: 'asc' }, { pricePerPersonDouble: 'asc' }],
    });
  }

  async findOneHotelRoomRate(id: number, tenantId: number) {
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

  async updateHotelRoomRate(
    id: number,
    tenantId: number,
    dto: UpdateHotelRoomRateDto,
  ) {
    const rate = await this.prisma.hotelRoomRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Hotel room rate with ID ${id} not found`);
    }

    return this.prisma.hotelRoomRate.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.seasonFrom ? { seasonFrom: new Date(dto.seasonFrom) } : {}),
        ...(dto.seasonTo ? { seasonTo: new Date(dto.seasonTo) } : {}),
      },
      include: {
        serviceOffering: {
          include: {
            hotelRoom: true,
          },
        },
      },
    });
  }

  async removeHotelRoomRate(id: number, tenantId: number) {
    const rate = await this.prisma.hotelRoomRate.findFirst({
      where: { id, tenantId },
    });

    if (!rate) {
      throw new NotFoundException(`Hotel room rate with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.hotelRoomRate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async searchHotels(tenantId: number, searchTerm: string) {
    return this.prisma.hotelRoom.findMany({
      where: {
        serviceOffering: {
          tenantId,
          isActive: true,
        },
        OR: [
          { hotelName: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { country: { contains: searchTerm, mode: 'insensitive' } },
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
      orderBy: { hotelName: 'asc' },
    });
  }
}
