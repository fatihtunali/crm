import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import {
  createPaginatedResponse,
  PaginatedResponse,
} from '../common/interfaces/paginated-response.interface';

interface CreateAuditLogDto {
  tenantId: number;
  userId: number | null;
  entity: string;
  entityId: number;
  action: string;
  diffJson?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: dto.tenantId,
        userId: dto.userId,
        entity: dto.entity,
        entityId: dto.entityId,
        action: dto.action,
        diffJson: dto.diffJson,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }

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

  /**
   * PII Access Report (Issue #22 - Enhanced Audit Logging)
   * Generate report of who accessed PII data and when
   */
  async getPiiAccessReport(
    tenantId: number,
    filters?: {
      userId?: number;
      dateFrom?: string;
      dateTo?: string;
      entity?: string;
    },
  ) {
    const where: any = {
      tenantId,
      action: 'PII_ACCESSED',
    };

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.entity) {
      where.entity = filters.entity;
    }

    // Date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [accessLogs, totalAccesses, uniqueUsers, byEntity] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to recent 100 accesses
      }),

      this.prisma.auditLog.count({ where }),

      this.prisma.auditLog.findMany({
        where,
        distinct: ['userId'],
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      totalAccesses,
      uniqueUsers: uniqueUsers.length,
      recentAccesses: accessLogs.map((log) => ({
        id: log.id,
        timestamp: log.createdAt,
        user: log.user,
        entity: log.entity,
        entityId: log.entityId,
        piiFields: (log.diffJson as any)?.piiFieldsAccessed || [],
        endpoint: (log.diffJson as any)?.endpoint,
        method: (log.diffJson as any)?.method,
        ipAddress: log.ipAddress,
      })),
      accessesByEntity: byEntity.map((item) => ({
        entity: item.entity,
        count: item._count.id,
      })),
    };
  }

  /**
   * GDPR Compliance Report (Issue #22)
   * Report on data exports, deletions, consent changes, and policy acceptances
   */
  async getGdprComplianceReport(
    tenantId: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: any = {
      tenantId,
      action: {
        in: [
          'CLIENT_ANONYMIZED',
          'DATA_EXPORTED',
          'CONSENT_GRANTED',
          'CONSENT_REVOKED',
          'CONSENT_DENIED',
          'PRIVACY_POLICY_ACCEPTED',
        ],
      },
    };

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [gdprActions, actionBreakdown] = await Promise.all([
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
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),

      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    const summary = {
      dataExports: actionBreakdown.find((a) => a.action === 'DATA_EXPORTED')?._count.id || 0,
      anonymizations: actionBreakdown.find((a) => a.action === 'CLIENT_ANONYMIZED')?._count.id || 0,
      consentsGranted: actionBreakdown.find((a) => a.action === 'CONSENT_GRANTED')?._count.id || 0,
      consentsRevoked: actionBreakdown.find((a) => a.action === 'CONSENT_REVOKED')?._count.id || 0,
      consentsDenied: actionBreakdown.find((a) => a.action === 'CONSENT_DENIED')?._count.id || 0,
      policyAcceptances: actionBreakdown.find((a) => a.action === 'PRIVACY_POLICY_ACCEPTED')?._count.id || 0,
    };

    return {
      summary,
      recentActions: gdprActions.map((log) => ({
        id: log.id,
        timestamp: log.createdAt,
        action: log.action,
        user: log.user,
        entity: log.entity,
        entityId: log.entityId,
        details: log.diffJson,
        ipAddress: log.ipAddress,
      })),
    };
  }
}
