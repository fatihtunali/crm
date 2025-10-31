import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { LeadStatus } from '@tour-crm/shared';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, status?: LeadStatus): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'inquiryDate', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
  }

  async findOne(id: number, tenantId: number) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        quotations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async create(createLeadDto: CreateLeadDto, tenantId: number) {
    // Verify client exists if clientId is provided
    if (createLeadDto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: {
          id: createLeadDto.clientId,
          tenantId,
        },
      });

      if (!client) {
        throw new BadRequestException('Client not found');
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        clientId: createLeadDto.clientId,
        source: createLeadDto.source,
        inquiryDate: new Date(createLeadDto.inquiryDate),
        destination: createLeadDto.destination,
        paxAdults: createLeadDto.paxAdults ?? 0,
        paxChildren: createLeadDto.paxChildren ?? 0,
        budgetEur: createLeadDto.budgetEur,
        status: createLeadDto.status ?? LeadStatus.NEW,
        notes: createLeadDto.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto, tenantId: number) {
    // Check if lead exists
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Verify client exists if clientId is being updated
    if (updateLeadDto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: {
          id: updateLeadDto.clientId,
          tenantId,
        },
      });

      if (!client) {
        throw new BadRequestException('Client not found');
      }
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        clientId: updateLeadDto.clientId,
        source: updateLeadDto.source,
        inquiryDate: updateLeadDto.inquiryDate ? new Date(updateLeadDto.inquiryDate) : undefined,
        destination: updateLeadDto.destination,
        paxAdults: updateLeadDto.paxAdults,
        paxChildren: updateLeadDto.paxChildren,
        budgetEur: updateLeadDto.budgetEur,
        status: updateLeadDto.status,
        notes: updateLeadDto.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return updatedLead;
  }

  async remove(id: number, tenantId: number) {
    // Check if lead exists
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Hard delete for leads (no isActive field in schema)
    await this.prisma.lead.delete({
      where: { id },
    });

    return { message: 'Lead deleted successfully' };
  }

  async getStatsByStatus(tenantId: number) {
    const stats = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: {
        id: true,
      },
    });

    return stats.map((stat) => ({
      status: stat.status,
      count: stat._count.id,
    }));
  }
}
