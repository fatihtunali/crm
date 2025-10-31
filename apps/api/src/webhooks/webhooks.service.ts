import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookFilterDto } from './dto/webhook-filter.dto';
import { WebhookEventStatus, WebhookEventType } from '@prisma/client';
import {
  PaginatedResponse,
  createPaginatedResponse,
} from '../common/interfaces/paginated-response.interface';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhookSecrets: Map<string, string> = new Map();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Load webhook secrets from environment variables
    // Format: WEBHOOK_SECRET_STRIPE=secret123
    this.webhookSecrets.set(
      'stripe',
      this.configService.get('WEBHOOK_SECRET_STRIPE', ''),
    );
    this.webhookSecrets.set(
      'paypal',
      this.configService.get('WEBHOOK_SECRET_PAYPAL', ''),
    );
    this.webhookSecrets.set(
      'iyzico',
      this.configService.get('WEBHOOK_SECRET_IYZICO', ''),
    );
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  private verifySignature(
    provider: string,
    payload: string,
    signatureHeader: string,
  ): boolean {
    const secret = this.webhookSecrets.get(provider.toLowerCase());

    if (!secret) {
      this.logger.warn(
        `No webhook secret configured for provider: ${provider}`,
      );
      return false;
    }

    try {
      // Different providers use different signature formats
      // This is a generic implementation using HMAC-SHA256
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Extract signature from header (format: "sha256=signature")
      const providedSignature = signatureHeader.replace('sha256=', '');

      return crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(providedSignature),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Signature verification failed: ${message}`);
      return false;
    }
  }

  /**
   * Map event data to WebhookEventType
   */
  private mapEventType(provider: string, eventData: any): WebhookEventType {
    const eventType = eventData.type || eventData.event_type || '';

    // Map provider-specific event types to our internal types
    if (
      eventType.includes('payment.success') ||
      eventType.includes('charge.succeeded')
    ) {
      return WebhookEventType.PAYMENT_SUCCESS;
    } else if (
      eventType.includes('payment.failed') ||
      eventType.includes('charge.failed')
    ) {
      return WebhookEventType.PAYMENT_FAILED;
    } else if (
      eventType.includes('payment.pending') ||
      eventType.includes('charge.pending')
    ) {
      return WebhookEventType.PAYMENT_PENDING;
    } else if (
      eventType.includes('refund.processed') ||
      eventType.includes('refund.succeeded')
    ) {
      return WebhookEventType.REFUND_PROCESSED;
    } else if (eventType.includes('refund.failed')) {
      return WebhookEventType.REFUND_FAILED;
    }

    // Default to PAYMENT_PENDING if unknown
    return WebhookEventType.PAYMENT_PENDING;
  }

  /**
   * Receive and process webhook event
   */
  async receiveWebhook(
    provider: string,
    payload: any,
    signatureHeader: string,
    ipAddress: string,
    userAgent: string,
    tenantId: number,
  ) {
    this.logger.log(
      `Received webhook from ${provider} for tenant ${tenantId}`,
    );

    // Verify signature
    const payloadString = JSON.stringify(payload);
    const isVerified = this.verifySignature(
      provider,
      payloadString,
      signatureHeader,
    );

    if (!isVerified) {
      this.logger.warn(`Webhook signature verification failed for ${provider}`);
    }

    // Determine event type
    const eventType = this.mapEventType(provider, payload);

    // Create webhook event record
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        tenantId,
        provider,
        eventType,
        status: WebhookEventStatus.PENDING,
        payloadJson: payload,
        signatureHeader,
        isVerified,
        ipAddress,
        userAgent,
      },
    });

    // Process webhook asynchronously
    this.processWebhook(webhookEvent.id).catch((error) => {
      this.logger.error(
        `Failed to process webhook ${webhookEvent.id}: ${error.message}`,
      );
    });

    return {
      id: webhookEvent.id,
      status: 'received',
      message: 'Webhook received and queued for processing',
    };
  }

  /**
   * Process webhook event (update payment status, etc.)
   */
  private async processWebhook(webhookEventId: number) {
    const webhookEvent = await this.prisma.webhookEvent.findUnique({
      where: { id: webhookEventId },
    });

    if (!webhookEvent) {
      throw new NotFoundException('Webhook event not found');
    }

    try {
      // Update status to PROCESSING
      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: { status: WebhookEventStatus.PROCESSING },
      });

      // Extract payment information from payload
      const payload = webhookEvent.payloadJson as any;
      const paymentReference =
        payload.reference ||
        payload.transaction_id ||
        payload.id ||
        payload.payment_id;

      if (!paymentReference) {
        throw new Error('No payment reference found in webhook payload');
      }

      // Find related payment in database by transaction reference
      // This is a simplified example - you'll need to implement based on your payment structure
      const payment = await this.prisma.paymentClient.findFirst({
        where: {
          tenantId: webhookEvent.tenantId,
          txnRef: paymentReference,
        },
      });

      if (payment) {
        this.logger.log(
          `Found related payment ${payment.id} for webhook ${webhookEventId}`,
        );

        // Update payment status based on webhook event type
        // This would be implemented based on your business logic
        // For now, we just log it
        this.logger.log(
          `Would update payment ${payment.id} status based on event type: ${webhookEvent.eventType}`,
        );
      } else {
        this.logger.warn(
          `No payment found for reference: ${paymentReference}`,
        );
      }

      // Mark webhook as successfully processed
      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: WebhookEventStatus.SUCCESS,
          processedAt: new Date(),
        },
      });

      this.logger.log(`Successfully processed webhook ${webhookEventId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing webhook ${webhookEventId}: ${message}`,
      );

      // Mark webhook as failed
      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: WebhookEventStatus.FAILED,
          errorMessage: message,
          retryCount: { increment: 1 },
        },
      });

      throw error;
    }
  }

  /**
   * Query webhook events with filters
   */
  async findAll(
    tenantId: number,
    filterDto: WebhookFilterDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      skip,
      take,
      sortBy = 'createdAt',
      order = 'desc',
      provider,
      eventType,
      status,
      dateFrom,
      dateTo,
      isVerified,
    } = filterDto;

    // Build where clause
    const where: any = {
      tenantId,
    };

    if (provider) {
      where.provider = provider;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (status) {
      where.status = status;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

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

    const [data, total] = await Promise.all([
      this.prisma.webhookEvent.findMany({
        where,
        select: {
          id: true,
          provider: true,
          eventType: true,
          status: true,
          isVerified: true,
          processedAt: true,
          errorMessage: true,
          retryCount: true,
          ipAddress: true,
          createdAt: true,
          updatedAt: true,
          // Exclude large payload for list view
        },
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.webhookEvent.count({ where }),
    ]);

    return createPaginatedResponse(
      data,
      total,
      filterDto.page ?? 1,
      filterDto.limit ?? 50,
    );
  }

  /**
   * Get single webhook event with full payload
   */
  async findOne(id: number, tenantId: number) {
    const webhookEvent = await this.prisma.webhookEvent.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!webhookEvent) {
      throw new NotFoundException(`Webhook event with ID ${id} not found`);
    }

    return webhookEvent;
  }

  /**
   * Retry failed webhook processing
   */
  async retry(id: number, tenantId: number) {
    const webhookEvent = await this.prisma.webhookEvent.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!webhookEvent) {
      throw new NotFoundException(`Webhook event with ID ${id} not found`);
    }

    if (webhookEvent.status === WebhookEventStatus.SUCCESS) {
      throw new BadRequestException('Webhook event already processed successfully');
    }

    // Update status to RETRY
    await this.prisma.webhookEvent.update({
      where: { id },
      data: {
        status: WebhookEventStatus.RETRY,
      },
    });

    // Process webhook again
    await this.processWebhook(id);

    return {
      id,
      message: 'Webhook retry initiated',
    };
  }

  /**
   * Get webhook statistics
   */
  async getStats(tenantId: number) {
    const [statusStats, providerStats, recentActivity] = await Promise.all([
      // Group by status
      this.prisma.webhookEvent.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: {
          id: true,
        },
      }),

      // Group by provider
      this.prisma.webhookEvent.groupBy({
        by: ['provider'],
        where: { tenantId },
        _count: {
          id: true,
        },
      }),

      // Recent activity (last 24 hours)
      this.prisma.webhookEvent.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      statusStats,
      providerStats,
      recentActivity24h: recentActivity,
    };
  }
}
