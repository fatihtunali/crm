import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LeadsModule } from './leads/leads.module';
import { VendorsModule } from './vendors/vendors.module';
import { ToursModule } from './tours/tours.module';
import { QuotationsModule } from './quotations/quotations.module';
import { BookingsModule } from './bookings/bookings.module';
import { VendorRatesModule } from './vendor-rates/vendor-rates.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { BookingItemsModule } from './booking-items/booking-items.module';
import { PaymentClientModule } from './payment-client/payment-client.module';
import { PaymentVendorModule } from './payment-vendor/payment-vendor.module';
import { InvoicesModule } from './invoices/invoices.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { FilesModule } from './files/files.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VendorPortalModule } from './vendor-portal/vendor-portal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    LeadsModule,
    VendorsModule,
    ToursModule,
    QuotationsModule,
    BookingsModule,
    VendorRatesModule,
    ExchangeRatesModule,
    BookingItemsModule,
    PaymentClientModule,
    PaymentVendorModule,
    InvoicesModule,
    HealthModule,
    AuditLogsModule,
    FilesModule,
    WebhooksModule,
    ReportsModule,
    NotificationsModule,
    VendorPortalModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule {}
