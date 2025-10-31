import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'code', order = 'asc' } = paginationDto;
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        include: {
          _count: {
            select: { itineraries: true, quotations: true },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.tour.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const tour = await this.prisma.tour.findFirst({
      where: { id, tenantId },
      include: {
        itineraries: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return tour;
  }

  async create(createTourDto: CreateTourDto, tenantId: number) {
    // Check if tour code already exists for this tenant
    const existingTour = await this.prisma.tour.findFirst({
      where: {
        tenantId,
        code: createTourDto.code,
      },
    });

    if (existingTour) {
      throw new ConflictException(
        `Tour with code ${createTourDto.code} already exists`,
      );
    }

    const tour = await this.prisma.tour.create({
      data: {
        tenantId,
        code: createTourDto.code,
        name: createTourDto.name,
        description: createTourDto.description,
        baseCapacity: createTourDto.baseCapacity,
        seasonStart: createTourDto.seasonStart,
        seasonEnd: createTourDto.seasonEnd,
        defaultMarkupPct: createTourDto.defaultMarkupPct,
        isActive: createTourDto.isActive ?? true,
        itineraries: createTourDto.itineraries
          ? {
              create: createTourDto.itineraries.map((itinerary) => ({
                tenantId,
                dayNumber: itinerary.dayNumber,
                title: itinerary.title,
                description: itinerary.description,
                transport: itinerary.transport,
                accommodation: itinerary.accommodation,
                meals: itinerary.meals,
              })),
            }
          : undefined,
      },
      include: {
        itineraries: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto, tenantId: number) {
    // Check if tour exists
    const tour = await this.prisma.tour.findFirst({
      where: { id, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // If updating code, check for conflicts
    if (updateTourDto.code && updateTourDto.code !== tour.code) {
      const existingTour = await this.prisma.tour.findFirst({
        where: {
          tenantId,
          code: updateTourDto.code,
          id: { not: id },
        },
      });

      if (existingTour) {
        throw new ConflictException(
          `Tour with code ${updateTourDto.code} already exists`,
        );
      }
    }

    const updatedTour = await this.prisma.tour.update({
      where: { id },
      data: {
        code: updateTourDto.code,
        name: updateTourDto.name,
        description: updateTourDto.description,
        baseCapacity: updateTourDto.baseCapacity,
        seasonStart: updateTourDto.seasonStart,
        seasonEnd: updateTourDto.seasonEnd,
        defaultMarkupPct: updateTourDto.defaultMarkupPct,
        isActive: updateTourDto.isActive,
      },
      include: {
        itineraries: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return updatedTour;
  }

  async remove(id: number, tenantId: number) {
    // Check if tour exists
    const tour = await this.prisma.tour.findFirst({
      where: { id, tenantId },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.tour.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Tour deactivated successfully' };
  }

  async search(query: string, tenantId: number) {
    return this.prisma.tour.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { code: 'asc' },
    });
  }
}
