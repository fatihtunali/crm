import { IsEnum, IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationTemplate {
  QUOTATION_SENT = 'QUOTATION_SENT',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
}

export enum Language {
  EN = 'en',
  TR = 'tr',
}

export class SendNotificationDto {
  @ApiProperty({
    description: 'Notification channel',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel!: NotificationChannel;

  @ApiProperty({
    description: 'Notification template to use',
    enum: NotificationTemplate,
    example: NotificationTemplate.QUOTATION_SENT,
  })
  @IsEnum(NotificationTemplate)
  @IsNotEmpty()
  template!: NotificationTemplate;

  @ApiProperty({
    description: 'Recipient email or phone number',
    example: 'client@example.com',
  })
  @IsString()
  @IsNotEmpty()
  recipient!: string;

  @ApiProperty({
    description: 'Language for the notification',
    enum: Language,
    example: Language.EN,
  })
  @IsEnum(Language)
  @IsNotEmpty()
  language!: Language;

  @ApiProperty({
    description: 'Template variables (e.g., client name, booking code, etc.)',
    example: {
      clientName: 'John Doe',
      bookingCode: 'BK-2024-001',
      amount: '1500.00',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}
