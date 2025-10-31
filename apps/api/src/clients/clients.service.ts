import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'createdAt', order = 'desc' } = paginationDto;
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.client.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async create(createClientDto: CreateClientDto, tenantId: number) {
    // Check if email already exists for this tenant (if email provided)
    if (createClientDto.email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          email: createClientDto.email,
          tenantId,
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    const client = await this.prisma.client.create({
      data: {
        tenantId,
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        nationality: createClientDto.nationality,
        preferredLanguage: createClientDto.preferredLanguage || 'en',
        passportNumber: createClientDto.passportNumber,
        dateOfBirth: createClientDto.dateOfBirth ? new Date(createClientDto.dateOfBirth) : null,
        notes: createClientDto.notes,
      },
    });

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto, tenantId: number) {
    // Check if client exists
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Check if email is being updated and already exists
    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          email: updateClientDto.email,
          tenantId,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this email already exists');
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        name: updateClientDto.name,
        email: updateClientDto.email,
        phone: updateClientDto.phone,
        nationality: updateClientDto.nationality,
        preferredLanguage: updateClientDto.preferredLanguage,
        passportNumber: updateClientDto.passportNumber,
        dateOfBirth: updateClientDto.dateOfBirth ? new Date(updateClientDto.dateOfBirth) : undefined,
        notes: updateClientDto.notes,
        isActive: updateClientDto.isActive,
      },
    });

    return updatedClient;
  }

  async remove(id: number, tenantId: number) {
    // Check if client exists
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Client deactivated successfully' };
  }

  async search(query: string, tenantId: number) {
    return this.prisma.client.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { passportNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }
}
