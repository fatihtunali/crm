import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import {
  createPaginatedResponse,
  PaginatedResponse,
} from '../common/interfaces/paginated-response.interface';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: number,
    filterDto: AuditLogFilterDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      skip,
      take,
      sortBy = 'createdAt',
      order = 'desc',
      entity,
      entityId,
      userId,
      action,
      dateFrom,
      dateTo,
      ipAddress,
    } = filterDto;

    // Build where clause with filters
    const where: any = {
      tenantId,
    };

    if (entity) {
      where.entity = entity;
    }

    if (entityId !== undefined) {
      where.entityId = entityId;
    }

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (ipAddress) {
      where.ipAddress = ipAddress;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of day
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return createPaginatedResponse(
      data,
      total,
      filterDto.page ?? 1,
      filterDto.limit ?? 50,
    );
  }

  async findOne(id: number, tenantId: number) {
    const auditLog = await this.prisma.auditLog.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return auditLog;
  }

  async getStats(tenantId: number) {
    const [actionStats, entityStats, recentActivity] = await Promise.all([
      // Group by action type
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),

      // Group by entity type
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where: { tenantId },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),

      // Recent activity (last 24 hours)
      this.prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      actionStats,
      entityStats,
      recentActivity24h: recentActivity,
    };
  }
}
