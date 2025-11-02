import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { LeadStatus } from '@tour-crm/shared';
import { ErrorMessages } from '../common/errors/error-messages';
import { BusinessRules, BusinessRulesHelper } from '../config/business-rules.config';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto, status?: LeadStatus): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'inquiryDate', order = 'desc' } = paginationDto;
    const where = {
      tenantId,
      deletedAt: null, // Issue #33: Exclude soft-deleted leads
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
        throw new BadRequestException(ErrorMessages.CLIENT_NOT_FOUND(createLeadDto.clientId));
      }

      // Check for duplicate active leads within deduplication window
      const deduplicationDate = new Date();
      deduplicationDate.setDate(
        deduplicationDate.getDate() - BusinessRules.lead.deduplicationWindowDays
      );

      const existingLead = await this.prisma.lead.findFirst({
        where: {
          tenantId,
          clientId: createLeadDto.clientId,
          status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUOTED] },
          inquiryDate: { gte: deduplicationDate },
        },
      });

      if (existingLead) {
        throw new ConflictException(ErrorMessages.LEAD_DUPLICATE(existingLead.id));
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
      where: { id, tenantId, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Issue #33: Soft delete for leads using deletedAt timestamp
    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Lead soft deleted successfully' };
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
