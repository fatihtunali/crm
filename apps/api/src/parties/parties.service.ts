import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';

@Injectable()
export class PartiesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, dto: CreatePartyDto) {
    return this.prisma.party.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        contacts: true,
        suppliers: true,
      },
    });
  }

  async findAll(tenantId: number, includeInactive = false) {
    return this.prisma.party.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        contacts: {
          where: { isActive: true },
          orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
        },
        suppliers: {
          where: { isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, tenantId: number) {
    const party = await this.prisma.party.findFirst({
      where: { id, tenantId },
      include: {
        contacts: {
          orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
        },
        suppliers: {
          include: {
            serviceOfferings: {
              where: { isActive: true },
              take: 10,
            },
          },
        },
      },
    });

    if (!party) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }

    return party;
  }

  async update(id: number, tenantId: number, dto: UpdatePartyDto) {
    const party = await this.prisma.party.findFirst({
      where: { id, tenantId },
    });

    if (!party) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }

    return this.prisma.party.update({
      where: { id },
      data: dto,
      include: {
        contacts: true,
        suppliers: true,
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const party = await this.prisma.party.findFirst({
      where: { id, tenantId },
    });

    if (!party) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.party.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(tenantId: number, searchTerm: string) {
    return this.prisma.party.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { country: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        contacts: {
          where: { isActive: true, isPrimary: true },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }
}
