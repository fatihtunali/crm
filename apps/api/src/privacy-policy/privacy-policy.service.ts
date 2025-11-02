import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AcceptPrivacyPolicyDto } from './dto/accept-privacy-policy.dto';

@Injectable()
export class PrivacyPolicyService {
  // Current privacy policy version - update this when policy changes
  private readonly CURRENT_VERSION = '1.0.0';

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Record privacy policy acceptance
   */
  async recordAcceptance(
    dto: AcceptPrivacyPolicyDto,
    tenantId: number,
    ipAddress: string,
    userAgent: string,
  ) {
    // Validate that either userId or clientId is provided
    if (!dto.userId && !dto.clientId) {
      throw new BadRequestException(
        'Either userId or clientId must be provided',
      );
    }

    // Check if already accepted this version
    const existingAcceptance = await this.prisma.privacyPolicyAcceptance.findFirst({
      where: {
        tenantId,
        userId: dto.userId || null,
        clientId: dto.clientId || null,
        version: dto.version,
      },
    });

    if (existingAcceptance) {
      return {
        message: 'Privacy policy already accepted for this version',
        acceptance: existingAcceptance,
      };
    }

    // Create new acceptance record
    const acceptance = await this.prisma.privacyPolicyAcceptance.create({
      data: {
        tenantId,
        userId: dto.userId || null,
        clientId: dto.clientId || null,
        version: dto.version,
        acceptedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    // Log the action
    await this.auditLogsService.create({
      tenantId,
      userId: dto.userId || null,
      entity: 'PrivacyPolicyAcceptance',
      entityId: acceptance.id,
      action: 'PRIVACY_POLICY_ACCEPTED',
      diffJson: {
        version: dto.version,
        userId: dto.userId,
        clientId: dto.clientId,
      },
      ipAddress,
      userAgent,
    });

    return {
      message: 'Privacy policy accepted successfully',
      acceptance,
    };
  }

  /**
   * Get latest privacy policy acceptance for a user or client
   */
  async getLatestAcceptance(
    userId: number | null,
    clientId: number | null,
    tenantId: number,
  ) {
    return this.prisma.privacyPolicyAcceptance.findFirst({
      where: {
        tenantId,
        userId: userId || null,
        clientId: clientId || null,
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    });
  }

  /**
   * Check if user/client needs to re-accept privacy policy
   */
  async requiresReAcceptance(
    userId: number | null,
    clientId: number | null,
    tenantId: number,
  ): Promise<boolean> {
    const latestAcceptance = await this.getLatestAcceptance(
      userId,
      clientId,
      tenantId,
    );

    // If no acceptance found, re-acceptance is required
    if (!latestAcceptance) {
      return true;
    }

    // If accepted version is not current version, re-acceptance is required
    return latestAcceptance.version !== this.CURRENT_VERSION;
  }

  /**
   * Get current privacy policy version
   */
  async getCurrentVersion(tenantId: number): Promise<string> {
    // In a real implementation, this might be stored in the database per tenant
    // For now, we'll return the constant
    return this.CURRENT_VERSION;
  }

  /**
   * Get all privacy policy acceptances for a user
   */
  async getUserAcceptances(userId: number, tenantId: number) {
    return this.prisma.privacyPolicyAcceptance.findMany({
      where: {
        tenantId,
        userId,
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    });
  }

  /**
   * Get all privacy policy acceptances for a client
   */
  async getClientAcceptances(clientId: number, tenantId: number) {
    return this.prisma.privacyPolicyAcceptance.findMany({
      where: {
        tenantId,
        clientId,
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    });
  }

  /**
   * Get privacy policy acceptance statistics
   */
  async getAcceptanceStatistics(tenantId: number) {
    const [totalAcceptances, byVersion, recentAcceptances] = await Promise.all([
      this.prisma.privacyPolicyAcceptance.count({ where: { tenantId } }),

      this.prisma.privacyPolicyAcceptance.groupBy({
        by: ['version'],
        where: { tenantId },
        _count: true,
      }),

      this.prisma.privacyPolicyAcceptance.count({
        where: {
          tenantId,
          acceptedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalAcceptances,
      currentVersion: this.CURRENT_VERSION,
      acceptancesLast30Days: recentAcceptances,
      byVersion: byVersion.map((v) => ({
        version: v.version,
        count: v._count,
      })),
    };
  }
}
