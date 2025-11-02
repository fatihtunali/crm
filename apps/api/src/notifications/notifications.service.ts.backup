import { Injectable, Logger } from '@nestjs/common';
import {
  SendNotificationDto,
  NotificationChannel,
} from './dto/send-notification.dto';
import { renderTemplate } from './templates/templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async send(sendNotificationDto: SendNotificationDto, tenantId: number) {
    const { channel, template, recipient, language, variables = {} } = sendNotificationDto;

    // Render template with variables
    const renderedContent = renderTemplate(template, language, variables);

    // Log the notification (stub implementation)
    this.logger.log(
      `[STUB] Sending ${channel} notification to ${recipient} (Tenant: ${tenantId})`,
    );
    this.logger.log(`Template: ${template}, Language: ${language}`);
    if (renderedContent.subject) {
      this.logger.log(`Subject: ${renderedContent.subject}`);
    }
    this.logger.log(`Body: ${renderedContent.body}`);

    // Simulate sending based on channel
    if (channel === NotificationChannel.EMAIL) {
      return this.sendEmail(recipient, renderedContent, tenantId);
    } else if (channel === NotificationChannel.WHATSAPP) {
      return this.sendWhatsApp(recipient, renderedContent, tenantId);
    }

    return {
      success: true,
      message: 'Notification sent successfully (stub)',
    };
  }

  private async sendEmail(
    recipient: string,
    content: { subject?: string; body: string },
    tenantId: number,
  ) {
    // TODO: Implement actual email sending using a service like SendGrid, AWS SES, etc.
    this.logger.log(`[EMAIL STUB] Would send email to: ${recipient}`);
    this.logger.log(`[EMAIL STUB] Subject: ${content.subject}`);
    this.logger.log(`[EMAIL STUB] Body preview: ${content.body.substring(0, 100)}...`);

    return {
      success: true,
      channel: NotificationChannel.EMAIL,
      recipient,
      message: 'Email notification sent successfully (stub implementation)',
      stub: true,
    };
  }

  private async sendWhatsApp(
    recipient: string,
    content: { subject?: string; body: string },
    tenantId: number,
  ) {
    // TODO: Implement actual WhatsApp sending using a service like Twilio, WhatsApp Business API, etc.
    this.logger.log(`[WHATSAPP STUB] Would send WhatsApp message to: ${recipient}`);
    this.logger.log(`[WHATSAPP STUB] Message preview: ${content.body.substring(0, 100)}...`);

    return {
      success: true,
      channel: NotificationChannel.WHATSAPP,
      recipient,
      message: 'WhatsApp notification sent successfully (stub implementation)',
      stub: true,
    };
  }

  async getAvailableTemplates() {
    return {
      templates: [
        {
          key: 'QUOTATION_SENT',
          name: 'Quotation Sent',
          description: 'Sent when a quotation is emailed to a client',
          supportedLanguages: ['en', 'tr'],
        },
        {
          key: 'BOOKING_CONFIRMED',
          name: 'Booking Confirmed',
          description: 'Sent when a booking is confirmed',
          supportedLanguages: ['en', 'tr'],
        },
        {
          key: 'PAYMENT_REMINDER',
          name: 'Payment Reminder',
          description: 'Reminder for upcoming payment',
          supportedLanguages: ['en', 'tr'],
        },
        {
          key: 'PAYMENT_RECEIVED',
          name: 'Payment Received',
          description: 'Confirmation when payment is received',
          supportedLanguages: ['en', 'tr'],
        },
        {
          key: 'BOOKING_REMINDER',
          name: 'Booking Reminder',
          description: 'Reminder before tour start date',
          supportedLanguages: ['en', 'tr'],
        },
      ],
      channels: ['EMAIL', 'WHATSAPP'],
      languages: [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Turkish' },
      ],
    };
  }
}
