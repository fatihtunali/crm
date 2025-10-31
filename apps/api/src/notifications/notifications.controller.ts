import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Notifications')
@ApiBearerAuth('bearerAuth')
@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({
    summary: 'Send notification (stub implementation)',
    description:
      'Send email or WhatsApp notification using predefined templates in EN/TR. This is a stub implementation that logs notifications without actually sending them.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully (stub)',
    schema: {
      example: {
        success: true,
        channel: 'EMAIL',
        recipient: 'client@example.com',
        message: 'Email notification sent successfully (stub implementation)',
        stub: true,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  send(
    @Body() sendNotificationDto: SendNotificationDto,
    @TenantId() tenantId: number,
  ) {
    return this.notificationsService.send(sendNotificationDto, tenantId);
  }

  @Get('templates')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
  )
  @ApiOperation({
    summary: 'Get available notification templates',
    description: 'List all available notification templates with supported languages and channels',
  })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    schema: {
      example: {
        templates: [
          {
            key: 'QUOTATION_SENT',
            name: 'Quotation Sent',
            description: 'Sent when a quotation is emailed to a client',
            supportedLanguages: ['en', 'tr'],
          },
        ],
        channels: ['EMAIL', 'WHATSAPP'],
        languages: [
          { code: 'en', name: 'English' },
          { code: 'tr', name: 'Turkish' },
        ],
      },
    },
  })
  getTemplates() {
    return this.notificationsService.getAvailableTemplates();
  }
}
