import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Tour Operator CRM API')
    .setDescription(`
Multi-tenant Tour Operator CRM API for Turkish tourism agencies.

## Security & Tenancy
- All routes require JWT authentication except login, password reset, health checks, and webhooks
- Tenant ID is extracted from JWT; never accepted in request bodies
- Multi-tenancy enforced at database level via row-level security

## Supplier Catalog System
The API includes a comprehensive supplier catalog for managing service offerings:

### **Architecture**
- **Parties**: Organizations (suppliers, vendors, clients) with unified contact management
- **Contacts**: People associated with parties (sales reps, managers, etc.)
- **Suppliers**: Specialized parties offering tourism services with typed catalog
- **Service Offerings**: Catalog items linking to type-specific detail tables

### **Service Types**
- **HOTEL_ROOM**: Accommodation with board types, occupancy, room categories
- **TRANSFER**: Airport/hotel transfers with vehicle classes, zones, km/hour pricing
- **VEHICLE_HIRE**: Rental vehicles with/without driver, daily rates
- **GUIDE_SERVICE**: Tour guides with language skills, hourly/daily rates
- **ACTIVITY**: Tours, attractions, experiences with tiered pricing

### **Rate Management**
- Season-based rates with date ranges (seasonFrom/seasonTo)
- Multiple pricing models: PER_ROOM_NIGHT, PER_PERSON, PER_DAY, PER_TRANSFER, PER_HOUR
- Surcharges, discounts (child, group), included/extra km/hours
- Rate resolution: system selects active rate matching service date

### **Pricing API**
- **POST /api/v1/pricing/quote**: Universal endpoint for all service types
- Input: serviceOfferingId, serviceDate, parameters (pax, nights, days, hours, distance, children)
- Output: Structured quote with breakdown, total cost, supplier details
- Powers booking items with automatic cost calculation

### **Booking Integration**
- **Snapshot Pattern**: Booking items capture pricing snapshot at creation time
- Historical bookings unaffected by future rate changes
- Supports both catalog-based (auto-pricing) and manual pricing
- Full audit trail with quotedAt timestamp and service details

## Finance Invariants
- **Exchange Rate Locking**: When a quotation is accepted, it creates a booking and freezes \`locked_exchange_rate\` from the latest TRY→EUR rate on/before acceptance date
- **Currency Rules**: Client payments are EUR only; vendor payments are TRY only
- **P&L Formula**: \`sum(item.unit_price_eur*qty) − (sum(item.unit_cost_try*qty) / locked_exchange_rate)\`
- **Idempotency**: Payment endpoints require \`Idempotency-Key\` header for safe retries

## RBAC Matrix
- **ADMIN**: Manage users, deactivate users, manage supplier catalog
- **ACCOUNTING**: Create/update client payments, vendor payments, invoices
- **OPERATIONS**: Create/update booking-items, itineraries; transition bookings; manage rates
- **AGENT**: Create leads/quotations; send quotations; accept quotations; view catalog
- **GUIDE**: Read-only access to assigned bookings
- **VENDOR**: Read-only access to vendor portal for own vendorId
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT token obtained from /auth/login',
        in: 'header',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add reusable components
  document.components = document.components || {};

  // Add reusable parameters
  document.components.parameters = {
    TenantIdHeader: {
      name: 'X-Tenant-Id',
      in: 'header',
      required: false,
      description: 'Tenant identifier (auto-extracted from JWT if not provided; never use subdomain routing)',
      schema: { type: 'string' },
    },
    Page: {
      name: 'page',
      in: 'query',
      required: false,
      description: 'Page number (starts from 1)',
      schema: { type: 'integer', minimum: 1, default: 1 },
    },
    Limit: {
      name: 'limit',
      in: 'query',
      required: false,
      description: 'Number of items per page',
      schema: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
    },
    Sort: {
      name: 'sort',
      in: 'query',
      required: false,
      description: 'Field to sort by',
      schema: { type: 'string', example: 'created_at' },
    },
    Order: {
      name: 'order',
      in: 'query',
      required: false,
      description: 'Sort order',
      schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    },
  };

  // Add reusable headers
  document.components.headers = {
    'Idempotency-Key': {
      description: 'Unique key for safe retries on POST/PUT operations',
      schema: { type: 'string', minLength: 8, maxLength: 128 },
    },
  };

  // Add reusable schemas
  document.components.schemas = {
    ...document.components.schemas,
    Error: {
      type: 'object',
      required: ['statusCode', 'message', 'timestamp', 'path'],
      properties: {
        statusCode: {
          type: 'integer',
          description: 'HTTP status code',
          example: 400,
        },
        message: {
          type: 'string',
          description: 'Error message',
          example: 'Validation failed',
        },
        error: {
          type: 'string',
          description: 'Error type',
          example: 'Bad Request',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Error timestamp',
        },
        path: {
          type: 'string',
          description: 'Request path',
          example: '/api/v1/bookings',
        },
        details: {
          type: 'array',
          description: 'Validation error details',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', description: 'Field name' },
              rule: { type: 'string', description: 'Validation rule that failed' },
              message: { type: 'string', description: 'Error message for this field' },
            },
          },
        },
      },
    },
    PageMeta: {
      type: 'object',
      required: ['page', 'limit', 'total', 'totalPages'],
      properties: {
        page: {
          type: 'integer',
          description: 'Current page number',
          example: 1,
        },
        limit: {
          type: 'integer',
          description: 'Items per page',
          example: 50,
        },
        total: {
          type: 'integer',
          description: 'Total number of items',
          example: 150,
        },
        totalPages: {
          type: 'integer',
          description: 'Total number of pages',
          example: 3,
        },
      },
    },
    QuotationStatus: {
      type: 'string',
      enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'],
      description: 'Quotation lifecycle status. DRAFT→SENT→ACCEPTED creates booking with locked exchange rate.',
    },
    BookingStatus: {
      type: 'string',
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      description: 'Booking lifecycle status. Created as CONFIRMED when quotation is accepted.',
    },
    PaymentStatus: {
      type: 'string',
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      description: 'Payment processing status.',
    },
  };

  // Apply global security to all endpoints by default
  // Public endpoints (login, register, forgot-password, etc.) should override with @ApiSecurity([])
  if (!document.security) {
    document.security = [];
  }
  document.security.push({ bearerAuth: [] });

  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('');
  console.log('🚀 Tour Operator CRM API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔗 API Base URL: http://localhost:${port}/${apiPrefix}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

bootstrap();
