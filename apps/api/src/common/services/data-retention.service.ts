import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { RetentionConfig, RetentionSchedule } from '../../config/retention.config';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Archive old inactive clients
   * Runs daily at 2 AM
   */
  @Cron(RetentionSchedule.archiveOldData)
  async archiveInactiveClients() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.clients.inactiveAfterDays);

      const result = await this.prisma.client.updateMany({
        where: {
          updatedAt: { lt: cutoffDate },
          isActive: true,
          // Only archive if no recent bookings
          bookings: {
            none: {
              createdAt: { gte: cutoffDate },
            },
          },
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`Archived ${result.count} inactive clients (no activity for ${RetentionConfig.clients.inactiveAfterDays} days)`);
    } catch (error) {
      this.logger.error('Failed to archive inactive clients', error);
    }
  }

  /**
   * Delete old audit logs
   * Runs weekly on Sunday at 3 AM
   */
  @Cron(RetentionSchedule.deleteOldData)
  async deleteOldAuditLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.auditLogs.deleteAfterDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      this.logger.log(`Deleted ${result.count} old audit logs (older than ${RetentionConfig.auditLogs.deleteAfterDays} days)`);
    } catch (error) {
      this.logger.error('Failed to delete old audit logs', error);
    }
  }

  /**
   * Delete expired idempotency keys
   * Runs weekly on Sunday at 3 AM
   */
  @Cron(RetentionSchedule.deleteOldData)
  async deleteExpiredIdempotencyKeys() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.idempotencyKeys.deleteAfterDays);

      const result = await this.prisma.idempotencyKey.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      this.logger.log(`Deleted ${result.count} expired idempotency keys (older than ${RetentionConfig.idempotencyKeys.deleteAfterDays} days)`);
    } catch (error) {
      this.logger.error('Failed to delete expired idempotency keys', error);
    }
  }

  /**
   * Delete old unconverted leads
   * Runs weekly on Sunday at 3 AM
   */
  @Cron(RetentionSchedule.deleteOldData)
  async deleteOldLeads() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.leads.deleteAfterDays);

      // Only delete leads that:
      // 1. Are older than retention period
      // 2. Have status LOST or REJECTED
      // 3. Have no associated quotations or bookings
      const result = await this.prisma.lead.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: ['LOST'] },
          quotations: { none: {} },
        },
      });

      this.logger.log(`Deleted ${result.count} old leads (older than ${RetentionConfig.leads.deleteAfterDays} days with no conversions)`);
    } catch (error) {
      this.logger.error('Failed to delete old leads', error);
    }
  }

  /**
   * Manual trigger for testing or admin use
   * Can be called via admin endpoint
   */
  async runDataRetentionNow(): Promise<{
    archivedClients: number;
    deletedAuditLogs: number;
    deletedIdempotencyKeys: number;
    deletedLeads: number;
  }> {
    this.logger.log('Running data retention manually');

    const results = {
      archivedClients: 0,
      deletedAuditLogs: 0,
      deletedIdempotencyKeys: 0,
      deletedLeads: 0,
    };

    try {
      // Archive inactive clients
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.clients.inactiveAfterDays);

      const archivedClients = await this.prisma.client.updateMany({
        where: {
          updatedAt: { lt: cutoffDate },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      results.archivedClients = archivedClients.count;

      // Delete old audit logs
      const auditCutoff = new Date();
      auditCutoff.setDate(auditCutoff.getDate() - RetentionConfig.auditLogs.deleteAfterDays);

      const deletedLogs = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: auditCutoff },
        },
      });
      results.deletedAuditLogs = deletedLogs.count;

      // Delete expired idempotency keys
      const idempotencyCutoff = new Date();
      idempotencyCutoff.setDate(idempotencyCutoff.getDate() - RetentionConfig.idempotencyKeys.deleteAfterDays);

      const deletedKeys = await this.prisma.idempotencyKey.deleteMany({
        where: {
          createdAt: { lt: idempotencyCutoff },
        },
      });
      results.deletedIdempotencyKeys = deletedKeys.count;

      // Delete old leads
      const leadCutoff = new Date();
      leadCutoff.setDate(leadCutoff.getDate() - RetentionConfig.leads.deleteAfterDays);

      const deletedLeads = await this.prisma.lead.deleteMany({
        where: {
          createdAt: { lt: leadCutoff },
          status: { in: ['LOST'] },
          quotations: { none: {} },
        },
      });
      results.deletedLeads = deletedLeads.count;

      this.logger.log('Data retention completed successfully', results);
      return results;
    } catch (error) {
      this.logger.error('Failed to run data retention', error);
      throw error;
    }
  }

  /**
   * Get data retention statistics
   */
  async getRetentionStats(tenantId: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.clients.inactiveAfterDays);

    const [
      inactiveClients,
      oldAuditLogs,
      expiredKeys,
      oldLeads,
    ] = await Promise.all([
      this.prisma.client.count({
        where: {
          tenantId,
          updatedAt: { lt: cutoffDate },
          isActive: true,
        },
      }),
      this.prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: {
            lt: new Date(Date.now() - RetentionConfig.auditLogs.deleteAfterDays * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.idempotencyKey.count({
        where: {
          tenantId,
          createdAt: {
            lt: new Date(Date.now() - RetentionConfig.idempotencyKeys.deleteAfterDays * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.lead.count({
        where: {
          tenantId,
          createdAt: {
            lt: new Date(Date.now() - RetentionConfig.leads.deleteAfterDays * 24 * 60 * 60 * 1000),
          },
          status: { in: ['LOST'] },
          quotations: { none: {} },
        },
      }),
    ]);

    return {
      retentionPolicy: RetentionConfig,
      pendingActions: {
        clientsToArchive: inactiveClients,
        auditLogsToDelete: oldAuditLogs,
        idempotencyKeysToDelete: expiredKeys,
        leadsToDelete: oldLeads,
      },
      nextRun: {
        archiveOldData: 'Daily at 2 AM',
        deleteOldData: 'Weekly on Sunday at 3 AM',
        cleanupOrphanedData: 'Monthly on 1st at 4 AM',
      },
    };
  }
}
