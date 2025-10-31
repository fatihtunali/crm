import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, dto: CreateContactDto) {
    // Verify the party belongs to this tenant
    const party = await this.prisma.party.findFirst({
      where: { id: dto.partyId, tenantId },
    });

    if (!party) {
      throw new BadRequestException(
        `Party with ID ${dto.partyId} not found or doesn't belong to your organization`,
      );
    }

    // If this is marked as primary, unmark other primary contacts for this party
    if (dto.isPrimary) {
      await this.prisma.contact.updateMany({
        where: {
          partyId: dto.partyId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.contact.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        party: true,
      },
    });
  }

  async findAll(tenantId: number, partyId?: number, includeInactive = false) {
    return this.prisma.contact.findMany({
      where: {
        tenantId,
        ...(partyId ? { partyId } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { partyId: 'asc' },
        { isPrimary: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number, tenantId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        party: true,
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async update(id: number, tenantId: number, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    // If updating to primary, unmark other primary contacts for this party
    if (dto.isPrimary && !contact.isPrimary) {
      await this.prisma.contact.updateMany({
        where: {
          partyId: contact.partyId,
          isPrimary: true,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.contact.update({
      where: { id },
      data: dto,
      include: {
        party: true,
      },
    });
  }

  async remove(id: number, tenantId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    // Soft delete
    return this.prisma.contact.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByType(tenantId: number, contactType: string) {
    return this.prisma.contact.findMany({
      where: {
        tenantId,
        contactType,
        isActive: true,
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
