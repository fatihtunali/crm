import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Headers,
  Ip,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookFilterDto } from './dto/webhook-filter.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * PUBLIC ENDPOINT - Receive webhook from payment provider
   * No authentication required since it comes from external services
   */
  @Public()
  @Post(':provider')
  @ApiOperation({
    summary: 'Receive webhook from payment provider',
    description:
      'Public endpoint for payment gateways to send webhook events. Signature verification is performed.',
  })
  @ApiHeader({
    name: 'X-Webhook-Signature',
    description: 'HMAC signature for webhook verification',
    required: true,
  })
  @ApiHeader({
    name: 'X-Tenant-Id',
    description: 'Tenant ID for multi-tenant routing',
    required: true,
  })
  receiveWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-tenant-id') tenantId: string,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.get('user-agent') || '';

    return this.webhooksService.receiveWebhook(
      provider,
      payload,
      signature,
      ipAddress,
      userAgent,
      parseInt(tenantId, 10),
    );
  }

  /**
   * AUTHENTICATED ENDPOINT - Query webhook events
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Query webhook events',
    description: 'Get paginated list of webhook events with optional filters',
  })
  findAll(@Query() filterDto: WebhookFilterDto, @TenantId() tenantId: number) {
    return this.webhooksService.findAll(tenantId, filterDto);
  }

  /**
   * AUTHENTICATED ENDPOINT - Get webhook statistics
   * NOTE: This must come BEFORE the :id route to avoid "stats" being parsed as an ID
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Get webhook statistics',
    description: 'Get aggregated statistics for webhook events',
  })
  getStats(@TenantId() tenantId: number) {
    return this.webhooksService.getStats(tenantId);
  }

  /**
   * AUTHENTICATED ENDPOINT - Get single webhook event
   * NOTE: This must come AFTER specific routes like /stats
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Get webhook event details',
    description: 'Get full details of a webhook event including payload',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.webhooksService.findOne(id, tenantId);
  }

  /**
   * AUTHENTICATED ENDPOINT - Retry failed webhook
   */
  @Post(':id/retry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Retry failed webhook processing',
    description: 'Manually retry processing a failed webhook event',
  })
  retry(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.webhooksService.retry(id, tenantId);
  }
}
