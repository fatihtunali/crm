import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { DataRetentionService } from './common/services/data-retention.service';
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
import { PartiesModule } from './parties/parties.module';
import { ContactsModule } from './contacts/contacts.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ServiceOfferingsModule } from './service-offerings/service-offerings.module';
import { HotelsModule } from './hotels/hotels.module';
import { TransfersModule } from './transfers/transfers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { GuidesModule } from './guides/guides.module';
import { ActivitiesModule } from './activities/activities.module';
import { PricingModule } from './pricing/pricing.module';
import { CatalogModule } from './catalog/catalog.module';
import { ManualQuotesModule } from './manual-quotes/manual-quotes.module';
import { CustomerItinerariesModule } from './customer-itineraries/customer-itineraries.module';
import { GdprModule } from './gdpr/gdpr.module';
import { ConsentModule } from './consent/consent.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute (general)
      },
      {
        name: 'auth',
        ttl: 60000, // 60 seconds
        limit: 5, // 5 login attempts per minute
      },
    ]),
    PrismaModule,
    CacheModule,
    CatalogModule,
    ManualQuotesModule,
    CustomerItinerariesModule,
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
    PartiesModule,
    ContactsModule,
    SuppliersModule,
    ServiceOfferingsModule,
    HotelsModule,
    TransfersModule,
    VehiclesModule,
    GuidesModule,
    ActivitiesModule,
    PricingModule,
    GdprModule,
    ConsentModule,
    PrivacyPolicyModule,
  ],
  providers: [
    // Throttler guard (rate limiting) - applied first
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // JWT authentication guard - applied second
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
    // Data retention service for scheduled cleanup jobs
    DataRetentionService,
  ],
})
export class AppModule {}
