import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  // Validate critical environment variables
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters. Please update your .env file with a strong secret.',
    );
  }

  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error(
      'JWT_REFRESH_SECRET must be at least 32 characters. Please update your .env file with a strong secret.',
    );
  }

  if (process.env.NODE_ENV === 'production') {
    // Additional production checks
    if (process.env.JWT_SECRET.includes('change-in-production')) {
      throw new Error(
        'JWT_SECRET contains placeholder text. Please use a secure random secret in production.',
      );
    }

    if (process.env.JWT_REFRESH_SECRET.includes('change-in-production')) {
      throw new Error(
        'JWT_REFRESH_SECRET contains placeholder text. Please use a secure random secret in production.',
      );
    }

    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
      console.warn(
        'WARNING: DATABASE_URL appears to be using localhost in production. Ensure you are using a production database.',
      );
    }
  }

  const app = await NestFactory.create(AppModule);

  // Security: Request size limits (prevents DoS attacks via large payloads)
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Security: Helmet - HTTP security headers
  app.use(
    helmet({
      // HSTS - Force HTTPS
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
          scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
          imgSrc: ["'self'", 'data:', 'https:', 'http:'], // Allow images from various sources
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // X-Frame-Options: Prevent clickjacking
      frameguard: { action: 'deny' },
      // X-Content-Type-Options: Prevent MIME type sniffing
      noSniff: true,
      // X-XSS-Protection: Enable XSS filter
      xssFilter: true,
      // Referrer-Policy
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // Hide X-Powered-By header
      hidePoweredBy: true,
    }),
  );

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS - Support multiple origins
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Tenant-Id',
      'Accept-Language',
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
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

## Security Features
- **Password Requirements**: Minimum 8 characters with complexity requirements (uppercase, lowercase, number, special character)
- **Rate Limiting**:
  - Authentication endpoints: 5 requests per minute (login, forgot-password)
  - General API endpoints: 100 requests per minute
- **JWT Validation**: Environment variable validation on startup with minimum 32 character secrets
- **CORS Security**: Multi-origin support with domain validation
- **Idempotency**: Payment endpoints require \`Idempotency-Key\` header to prevent duplicate charges

## GDPR Compliance
- **Data Export (Article 20)**: Users and clients can export all personal data in JSON format
- **Right to be Forgotten (Article 17)**: Client data anonymization while preserving legal records
- **Data Retention Policies**: Automated cleanup of old data:
  - Inactive clients archived after 3 years
  - Audit logs deleted after 7 years
  - Idempotency keys deleted after 30 days
  - Old unconverted leads deleted after 2 years
- **Compliance Status**: Real-time GDPR compliance reporting for administrators

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
