# Comprehensive Code Review - Tour Operator CRM

**Review Date**: 2025-11-02
**Reviewer**: Claude Code
**Overall Rating**: 8/10 - Production-ready with recommended improvements

---

## Executive Summary

I've completed a thorough code review of the Tour Operator CRM system. Overall, this is a **well-architected, production-ready application** with strong foundations in security, multi-tenancy, and business logic. However, I've identified several areas for improvement across security, performance, data privacy, and code quality.

---

## Table of Contents

1. [Security Review](#1-security-review)
2. [Performance & Optimization](#2-performance--optimization)
3. [Error Handling & Validation](#3-error-handling--validation)
4. [Data Privacy & GDPR Compliance](#4-data-privacy--gdpr-compliance)
5. [Business Logic Validation](#5-business-logic-validation)
6. [Code Quality & Best Practices](#6-code-quality--best-practices)
7. [CRM-Specific Concerns](#7-crm-specific-concerns)
8. [Action Plan Summary](#summary-of-recommendations-by-priority)

---

## 1. Security Review

### ✅ Strengths

#### 1.1 Authentication & Authorization
- **Excellent JWT implementation** with Argon2 password hashing (`apps/api/src/auth/auth.service.ts:69`)
- Proper separation of access tokens (24h) and refresh tokens (7d)
- Role-based access control (RBAC) with 7 distinct roles
- Guards properly implemented for route protection (`apps/api/src/auth/guards/jwt-auth.guard.ts`)
- `@Public()` decorator pattern for public routes

#### 1.2 SQL Injection Protection
- **No raw SQL vulnerabilities found** - All database queries use Prisma ORM with parameterized queries
- Only one safe raw query: `SELECT 1` for health checks (`apps/api/src/health/health.controller.ts:76`)
- Proper input validation on all DTOs using class-validator decorators

#### 1.3 Multi-tenancy Security
- Tenant ID extracted from JWT, never from request body
- All queries filtered by `tenantId` (`apps/api/src/bookings/bookings.service.ts:20-22`)
- Database-level tenant isolation with unique indexes

#### 1.4 Idempotency for Payments
- Excellent implementation preventing duplicate payment processing (`apps/api/src/common/interceptors/idempotency.interceptor.ts`)
- UUID-based idempotency keys with 24-hour expiration

---

### 🚨 Critical Security Issues

#### Issue #1: Weak Password Requirements
**File**: `apps/api/src/auth/dto/login.dto.ts:11`

**Current Code**:
```typescript
@MinLength(6)  // Too weak!
password!: string;
```

**Impact**: Vulnerable to brute force attacks

**Recommendation**:
```typescript
@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
  message: 'Password must contain uppercase, lowercase, number, and special character'
})
password!: string;
```

**Priority**: 🚨 Critical
**Effort**: 30 minutes
**Status**: ⬜ Not Started

---

#### Issue #2: Missing Rate Limiting
**Files**: All authentication endpoints

**Current State**: No rate limiting on login endpoint, no protection against brute force attacks

**Recommendation**:
1. Install `@nestjs/throttler`
2. Add to `app.module.ts`:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    // ...
  ],
})
```
3. Add to auth controller:
```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
```

**Priority**: 🚨 Critical
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #3: CORS Configuration Too Permissive
**File**: `apps/api/src/main.ts:15-18`

**Current Code**:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

**Issue**: Single origin only, but no validation of environment variable

**Recommendation**:
```typescript
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
});
```

**Priority**: 🚨 Critical
**Effort**: 30 minutes
**Status**: ⬜ Not Started

---

#### Issue #4: Missing JWT Secret Validation
**File**: `apps/api/src/main.ts`

**Current State**: No startup validation that JWT_SECRET is properly set

**Recommendation**: Add startup check in `main.ts`:
```typescript
async function bootstrap() {
  // Validate critical environment variables
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }

  const app = await NestFactory.create(AppModule);
  // ...
}
```

**Priority**: 🚨 Critical
**Effort**: 15 minutes
**Status**: ⬜ Not Started

---

#### Issue #5: Sensitive Data in Error Messages
**File**: `apps/api/src/common/filters/http-exception.filter.ts:89-90`

**Current Code**:
```typescript
details: process.env.NODE_ENV === 'development' ? exception.message : undefined,
```

**Status**: Good practice already implemented, but ensure `NODE_ENV=production` in production deployment

**Priority**: 🚨 Critical (Deployment)
**Effort**: 5 minutes
**Status**: ⬜ Not Started

---

### ⚠️ High Priority Security Issues

#### Issue #6: Missing Input Sanitization for XSS
**Files**: All user input fields (names, notes, descriptions)

**Current State**: No HTML sanitization on user inputs

**Recommendation**:
1. Install `class-sanitizer` or use `sanitize-html`
2. Create a sanitization pipe:
```typescript
import { PipeTransform, Injectable } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        value[key] = this.transform(value[key]);
      });
    }
    return value;
  }
}
```
3. Apply globally or to specific DTOs

**Priority**: ⚠️ High
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #7: Decimal Validation Weakness
**File**: `apps/api/src/payment-client/dto/create-payment-client.dto.ts:18`

**Current Code**:
```typescript
@IsDecimal()
amountEur!: number;
```

**Issue**: `IsDecimal()` validates string format, but TypeScript type is `number`

**Recommendation**:
```typescript
@IsNumber({ maxDecimalPlaces: 2 })
@Min(0.01)
@Max(1000000)
amountEur!: number;
```

Apply similar fixes to:
- `apps/api/src/payment-vendor/dto/create-payment-vendor.dto.ts`
- `apps/api/src/bookings/dto/create-booking.dto.ts`
- All rate DTOs

**Priority**: ⚠️ High
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #8: Missing Request Size Limits
**File**: `apps/api/src/main.ts`

**Current State**: No global payload size limit configured

**Recommendation**: Add to `main.ts`:
```typescript
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // ... rest of configuration
}
```

**Priority**: ⚠️ High
**Effort**: 15 minutes
**Status**: ⬜ Not Started

---

#### Issue #9: Password Reset Token Security
**File**: `apps/api/src/auth/auth.service.ts:319-334`

**Issues**:
- Token logged to console (development stub)
- No max attempts or lockout mechanism
- No tracking of token usage

**Recommendation**:
1. Remove console.log statements
2. Add token usage tracking:
```typescript
model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}
```
3. Implement attempt limiting

**Priority**: ⚠️ High
**Effort**: 3 hours
**Status**: ⬜ Not Started

---

#### Issue #10: Missing HTTPS Enforcement
**File**: `apps/api/src/main.ts`

**Current State**: No check or enforcement of HTTPS in production

**Recommendation**:
1. Install `helmet`
2. Add to `main.ts`:
```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  // ... rest
}
```

**Priority**: ⚠️ High
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

## 2. Performance & Optimization

### ✅ Strengths

#### 2.1 Excellent Database Indexing
- 143 indexes across schema
- Composite indexes on `(tenantId, field)` patterns
- Indexes on frequently queried fields (email, status, dates)

#### 2.2 Efficient Query Patterns
- Parallel `Promise.all()` for count + data queries (`apps/api/src/bookings/bookings.service.ts:25-56`)
- Proper use of `select` to limit returned fields
- Includes only necessary relations

#### 2.3 Pagination Implemented
- All list endpoints support pagination (`apps/api/src/common/dto/pagination.dto.ts`)

---

### ⚠️ Performance Issues

#### Issue #11: N+1 Query Problem Potential
**File**: `apps/api/src/quotations/quotations.service.ts:62-91`

**Current Code**:
```typescript
include: {
  tour: {
    select: {
      itineraries: {
        orderBy: { dayNumber: 'asc' },
      },
    },
  },
}
```

**Issue**: Loading all itineraries without limit could cause performance issues for large tours

**Recommendation**: Add pagination or limit:
```typescript
include: {
  tour: {
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      itineraries: {
        take: 10, // or use pagination
        orderBy: { dayNumber: 'asc' },
      },
    },
  },
}
```

**Priority**: 📋 Medium
**Effort**: 30 minutes
**Status**: ⬜ Not Started

---

#### Issue #12: Missing Database Connection Pooling Config
**File**: `apps/api/prisma/schema.prisma`

**Current State**: Prisma uses default connection pool settings

**Recommendation**: Configure in schema.prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["metrics", "tracing"]
}
```

And in Prisma service:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20',
    },
  },
});
```

**Priority**: 📋 Medium
**Effort**: 30 minutes
**Status**: ⬜ Not Started

---

#### Issue #13: No Caching Strategy
**Files**: Exchange rates, service offerings, tenant settings

**Current State**:
- Exchange rates fetched on every request
- Service offerings catalog not cached
- Tenant settings queried repeatedly

**Recommendation**: Implement Redis caching:

1. Install dependencies:
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
```

2. Create cache module:
```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 600, // 10 minutes default
    }),
  ],
})
```

3. Apply to services:
```typescript
@Injectable()
export class ExchangeRatesService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getLatestRate(tenantId: number, from: string, to: string) {
    const cacheKey = `exchange_rate:${tenantId}:${from}:${to}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const rate = await this.prisma.exchangeRate.findFirst({
      where: { tenantId, fromCurrency: from, toCurrency: to },
      orderBy: { effectiveDate: 'desc' },
    });

    await this.cacheManager.set(cacheKey, rate, 3600); // 1 hour
    return rate;
  }
}
```

**Priority**: ⚠️ High
**Effort**: 4 hours
**Status**: ⬜ Not Started

---

#### Issue #14: Inefficient Rate Lookup
**File**: `apps/api/src/pricing/pricing.service.ts:61-70`

**Current Code**:
```typescript
const rate = await this.prisma.hotelRoomRate.findFirst({
  where: {
    tenantId,
    serviceOfferingId: offering.id,
    seasonFrom: { lte: serviceDate },
    seasonTo: { gte: serviceDate },
    isActive: true,
  },
  orderBy: { id: 'desc' },
});
```

**Issue**: `orderBy id DESC` suggests multiple matching rates possible - unclear why

**Recommendation**:
1. Add unique constraint or validation to prevent overlapping date ranges
2. Add explicit priority field if multiple rates are intentional
3. Add database constraint:
```sql
ALTER TABLE hotel_room_rates
ADD CONSTRAINT no_season_overlap
EXCLUDE USING gist (
  service_offering_id WITH =,
  daterange(season_from, season_to, '[]') WITH &&
  WHERE (is_active = true)
);
```

**Priority**: 📋 Medium
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #15: Missing Query Timeouts
**File**: `apps/api/src/prisma/prisma.service.ts`

**Current State**: No timeout configuration for long-running queries

**Recommendation**: Add to Prisma client:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
}).$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 30000)
        );
        return Promise.race([query(args), timeout]);
      },
    },
  },
});
```

**Priority**: 📋 Medium
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

## 3. Error Handling & Validation

### ✅ Strengths

#### 3.1 Comprehensive Global Exception Filter
- File: `apps/api/src/common/filters/http-exception.filter.ts`
- Handles HttpException, Prisma errors, and generic errors
- Proper HTTP status codes for different error types
- Structured error responses with timestamps

#### 3.2 Excellent DTO Validation
- All DTOs use class-validator decorators
- `whitelist: true` and `forbidNonWhitelisted: true` in ValidationPipe (`apps/api/src/main.ts:22-29`)
- Prevents injection of unexpected fields

#### 3.3 Prisma Error Handling
- Specific handlers for P2002 (unique constraint), P2025 (not found), etc.

---

### ⚠️ Issues

#### Issue #16: Inconsistent Error Messages
**Files**: Multiple service files

**Current State**:
- Some services throw generic "not found" messages
- Others include detailed context
- No standardized error format

**Recommendation**: Create error constants:
```typescript
// src/common/errors/error-messages.ts
export const ErrorMessages = {
  BOOKING_NOT_FOUND: (id: number) => `Booking with ID ${id} not found`,
  CLIENT_NOT_FOUND: (id: number) => `Client with ID ${id} not found`,
  PAYMENT_EXCEEDS_TOTAL: 'Payment amount exceeds booking total',
  INVALID_DATE_RANGE: 'End date must be after start date',
  // ... etc
};
```

Use across all services for consistency.

**Priority**: 📋 Medium
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #17: Missing Validation on Nested Objects
**Files**: Various DTOs with nested objects

**Current State**: Some DTOs accept nested objects without validation

**Recommendation**: Use `@ValidateNested()` and `@Type()`:
```typescript
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateBookingDto {
  @ValidateNested()
  @Type(() => BookingItemDto)
  items: BookingItemDto[];
}
```

**Priority**: 📋 Medium
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #18: Password Reset Timing Attack
**File**: `apps/api/src/auth/auth.service.ts:302-338`

**Current Code**:
```typescript
if (!user) {
  return successResponse; // Returns immediately
}
// ... expensive operations below
```

**Issue**: Timing difference reveals if email exists

**Recommendation**: Add consistent timing:
```typescript
async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
  const startTime = Date.now();

  // ... existing logic

  // Ensure minimum processing time
  const elapsed = Date.now() - startTime;
  const minTime = 100; // milliseconds
  if (elapsed < minTime) {
    await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
  }

  return successResponse;
}
```

**Priority**: 💡 Low
**Effort**: 30 minutes
**Status**: ⬜ Not Started

---

## 4. Data Privacy & GDPR Compliance

### 🚨 Critical Issues

#### Issue #19: No Data Retention Policy
**Files**: All models with personal data

**Current State**:
- No TTL or archival for old data
- Personal data (passport numbers, DOB) stored indefinitely
- No automated cleanup

**Recommendation**:
1. Add retention policy configuration:
```typescript
// src/config/retention.config.ts
export const RetentionConfig = {
  clients: {
    inactiveAfterDays: 365 * 3, // 3 years
    deleteAfterDays: 365 * 7,   // 7 years (legal requirement)
  },
  bookings: {
    archiveAfterDays: 365 * 2,
    deleteAfterDays: 365 * 10,
  },
  auditLogs: {
    deleteAfterDays: 365 * 7,
  },
};
```

2. Create scheduled job:
```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DataRetentionService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.clients.inactiveAfterDays);

    // Archive inactive clients
    await this.prisma.client.updateMany({
      where: {
        updatedAt: { lt: cutoffDate },
        isActive: true,
      },
      data: { isActive: false },
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RetentionConfig.auditLogs.deleteAfterDays);

    // Delete old audit logs
    await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
  }
}
```

**Priority**: 🚨 Critical
**Effort**: 6 hours
**Status**: ⬜ Not Started

---

#### Issue #20: Missing Data Export Functionality (GDPR Right to Data Portability)
**Files**: None - feature missing

**Current State**: No GDPR "right to data portability" implementation

**Recommendation**: Add GDPR controller:
```typescript
@Controller('gdpr')
@ApiTags('GDPR')
export class GdprController {
  constructor(private gdprService: GdprService) {}

  @Get('export-data')
  @ApiOperation({ summary: 'Export all user data (GDPR Article 20)' })
  async exportMyData(@CurrentUser() user: any) {
    return this.gdprService.exportUserData(user.userId, user.tenantId);
  }
}
```

Service implementation:
```typescript
@Injectable()
export class GdprService {
  async exportUserData(userId: number, tenantId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        auditLogs: true,
      },
    });

    // If user is a client, get their data
    const client = await this.prisma.client.findFirst({
      where: { email: user.email, tenantId },
      include: {
        leads: true,
        bookings: {
          include: {
            items: true,
            paymentsClient: true,
            invoices: true,
          },
        },
      },
    });

    return {
      user,
      client,
      exportedAt: new Date(),
      format: 'JSON',
    };
  }
}
```

**Priority**: 🚨 Critical
**Effort**: 4 hours
**Status**: ⬜ Not Started

---

#### Issue #21: No Data Deletion Capability (GDPR Right to be Forgotten)
**Files**: None - feature missing

**Current State**: No "right to be forgotten" implementation

**Recommendation**: Add anonymization service:
```typescript
@Injectable()
export class GdprService {
  async anonymizeClient(clientId: number, tenantId: number) {
    // Don't delete - anonymize to preserve booking history
    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        name: `Deleted User ${clientId}`,
        email: `deleted-${clientId}@anonymized.local`,
        phone: null,
        passportNumber: null,
        dateOfBirth: null,
        nationality: null,
        notes: '[Data deleted per GDPR request]',
        isActive: false,
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: null,
        action: 'CLIENT_ANONYMIZED',
        entityType: 'Client',
        entityId: clientId,
        details: { reason: 'GDPR deletion request' },
      },
    });
  }
}
```

Add endpoint:
```typescript
@Delete('delete-my-data')
@ApiOperation({ summary: 'Delete all user data (GDPR Article 17)' })
async deleteMyData(@CurrentUser() user: any) {
  return this.gdprService.anonymizeClient(user.clientId, user.tenantId);
}
```

**Priority**: 🚨 Critical
**Effort**: 3 hours
**Status**: ⬜ Not Started

---

#### Issue #22: Insufficient Audit Logging
**Files**: `apps/api/src/audit-logs/audit-logs.service.ts`

**Current State**:
- Audit logs created but no coverage metrics
- No logging of personal data access (passport, DOB views)
- No automated reports

**Recommendation**:
1. Add PII access logging interceptor:
```typescript
@Injectable()
export class PiiAccessLogger implements NestInterceptor {
  constructor(private auditService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(data => {
        // Check if response contains PII
        if (this.containsPii(data)) {
          this.auditService.create({
            tenantId: user.tenantId,
            userId: user.userId,
            action: 'PII_ACCESSED',
            entityType: context.getClass().name,
            details: {
              endpoint: request.url,
              method: request.method,
            },
          });
        }
      }),
    );
  }

  private containsPii(data: any): boolean {
    // Check for PII fields
    const piiFields = ['passportNumber', 'dateOfBirth', 'taxId'];
    return piiFields.some(field => data?.[field] !== undefined);
  }
}
```

2. Apply to sensitive endpoints

**Priority**: ⚠️ High
**Effort**: 3 hours
**Status**: ⬜ Not Started

---

#### Issue #23: Missing Consent Management
**Files**: None - feature missing

**Current State**:
- No tracking of user consent for data processing
- No marketing communication preferences
- No consent version tracking

**Recommendation**: Add consent model:
```prisma
model Consent {
  id        Int      @id @default(autoincrement())
  tenantId  Int      @map("tenant_id")
  clientId  Int      @map("client_id")
  purpose   String   // 'MARKETING', 'ANALYTICS', 'DATA_PROCESSING'
  granted   Boolean  @default(false)
  version   String   // Privacy policy version
  grantedAt DateTime @map("granted_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([tenantId, clientId])
  @@index([purpose])
  @@map("consents")
}
```

Add consent service and endpoints.

**Priority**: ⚠️ High
**Effort**: 5 hours
**Status**: ⬜ Not Started

---

#### Issue #24: Password Storage in Logs Risk
**File**: `apps/api/src/auth/auth.service.ts:334-335`

**Current Code**:
```typescript
console.log(`[PASSWORD RESET STUB] Reset token for ${user.email}: ${resetToken}`);
console.log(`[PASSWORD RESET STUB] Reset link: /auth/reset-password?token=${resetToken}`);
```

**Issue**: Logs may be persisted and expose reset tokens

**Recommendation**: Remove immediately or ensure logs are not persisted:
```typescript
if (process.env.NODE_ENV === 'development' && process.env.LOG_RESET_TOKENS === 'true') {
  this.logger.debug(`Reset token generated for ${user.email}`);
}
// Never log the actual token
```

**Priority**: 🚨 Critical
**Effort**: 5 minutes
**Status**: ⬜ Not Started

---

### 💡 Recommendations

#### Issue #25: Consider Encrypting Sensitive Fields
**Files**: Client, Vendor models

**Current State**: Sensitive data (passport numbers, tax IDs) stored as plain text

**Recommendation**:
1. Use Prisma field-level encryption (when available) or
2. Implement application-level encryption:

```typescript
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    this.key = scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
```

**Priority**: 💡 Low
**Effort**: 6 hours
**Status**: ⬜ Not Started

---

#### Issue #26: Add Privacy Policy Acceptance Tracking
**Files**: None - feature missing

**Recommendation**: Add to User/Client models:
```prisma
model PrivacyPolicyAcceptance {
  id         Int      @id @default(autoincrement())
  userId     Int?     @map("user_id")
  clientId   Int?     @map("client_id")
  version    String
  acceptedAt DateTime @map("accepted_at")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")

  user   User?   @relation(fields: [userId], references: [id])
  client Client? @relation(fields: [clientId], references: [id])

  @@index([userId])
  @@index([clientId])
}
```

**Priority**: 💡 Low
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

## 5. Business Logic Validation

### ✅ Strengths

#### 5.1 Excellent Quotation State Machine
- Clear workflow: DRAFT → SENT → ACCEPTED → REJECTED
- Exchange rate locked on acceptance
- Proper business invariants enforced

#### 5.2 Multi-Currency Handling
- Clear separation: Client payments (EUR), Vendor payments (TRY)
- Locked exchange rates prevent profit/loss fluctuation

#### 5.3 Booking Item Snapshot Pattern
- Prices locked at booking time
- Historical data preserved

---

### 🚨 Critical Issues

#### Issue #27: Missing Payment Amount Validation
**File**: `apps/api/src/payment-client/payment-client.service.ts:95-100`

**Current Code**:
```typescript
const payment = await this.prisma.paymentClient.create({
  data: {
    tenantId,
    bookingId: createPaymentClientDto.bookingId,
    amountEur: createPaymentClientDto.amountEur,
    // ...
  },
});
```

**Issue**: No validation that payment amount doesn't exceed booking total

**Recommendation**: Add validation:
```typescript
async create(createPaymentClientDto: CreatePaymentClientDto, tenantId: number) {
  // Verify booking exists
  const booking = await this.prisma.booking.findFirst({
    where: { id: createPaymentClientDto.bookingId, tenantId },
  });

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  // Calculate total paid so far
  const totalPaid = await this.prisma.paymentClient.aggregate({
    where: {
      bookingId: createPaymentClientDto.bookingId,
      status: { in: ['COMPLETED', 'PENDING'] },
    },
    _sum: { amountEur: true },
  });

  const currentTotal = Number(totalPaid._sum.amountEur || 0);
  const newAmount = Number(createPaymentClientDto.amountEur);
  const bookingTotal = Number(booking.totalSellEur);

  if (currentTotal + newAmount > bookingTotal) {
    throw new BadRequestException(
      `Payment amount ${newAmount} would exceed booking total. ` +
      `Already paid: ${currentTotal}, Booking total: ${bookingTotal}`
    );
  }

  // Create payment
  const payment = await this.prisma.paymentClient.create({
    data: {
      tenantId,
      bookingId: createPaymentClientDto.bookingId,
      amountEur: newAmount,
      method: createPaymentClientDto.method,
      paidAt: createPaymentClientDto.paidAt,
      txnRef: createPaymentClientDto.txnRef,
      status: createPaymentClientDto.status ?? PaymentStatus.COMPLETED,
      notes: createPaymentClientDto.notes,
    },
  });

  return payment;
}
```

Apply similar logic to vendor payments.

**Priority**: 🚨 Critical
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #28: Missing Date Range Validation
**File**: `apps/api/src/bookings/dto/create-booking.dto.ts`

**Current State**: No validation that `endDate > startDate`

**Recommendation**: Add custom validator:
```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
```

Use in DTO:
```typescript
export class CreateBookingDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsAfterDate('startDate')
  endDate: string;
}
```

**Priority**: 🚨 Critical
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #29: Quotation Acceptance Double-Booking Prevention
**File**: `apps/api/src/quotations/quotations.service.ts`

**Current State**: No check if quotation already accepted

**Recommendation**: Add in quotation acceptance logic:
```typescript
async acceptQuotation(id: number, tenantId: number) {
  const quotation = await this.prisma.quotation.findFirst({
    where: { id, tenantId },
    include: { bookings: true },
  });

  if (!quotation) {
    throw new NotFoundException('Quotation not found');
  }

  if (quotation.status === QuotationStatus.ACCEPTED) {
    throw new ConflictException('Quotation has already been accepted');
  }

  if (quotation.bookings.length > 0) {
    throw new ConflictException('Booking already exists for this quotation');
  }

  // ... proceed with acceptance
}
```

**Priority**: 🚨 Critical
**Effort**: 30 minutes
**Status**: ⬜ Not Started

---

### ⚠️ High Priority Issues

#### Issue #30: Missing Exchange Rate Validation
**File**: Booking creation logic

**Current State**: No validation that exchange rate exists before booking

**Recommendation**: Add validation:
```typescript
async createBookingFromQuotation(quotationId: number, tenantId: number) {
  // Get latest exchange rate
  const latestRate = await this.prisma.exchangeRate.findFirst({
    where: {
      tenantId,
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      effectiveDate: { lte: new Date() },
    },
    orderBy: { effectiveDate: 'desc' },
  });

  if (!latestRate) {
    throw new BadRequestException(
      'No exchange rate available for booking creation. Please add TRY→EUR rate first.'
    );
  }

  // Use latestRate.rate for lockedExchangeRate
}
```

**Priority**: ⚠️ High
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #31: Missing Capacity Validation
**Files**: Hotel rooms, vehicles, activities

**Current State**:
- Hotel rooms have no capacity limits
- Vehicles have no max passenger validation
- Tours have no group size limits

**Recommendation**: Add to service offerings:
```prisma
model HotelRoom {
  // ... existing fields
  maxOccupancy Int? @map("max_occupancy")
}

model Vehicle {
  // ... existing fields
  maxPassengers Int @map("max_passengers")
}

model Activity {
  // ... existing fields
  minParticipants Int? @map("min_participants")
  maxParticipants Int? @map("max_participants")
}
```

Add validation in booking creation:
```typescript
if (dto.pax > offering.vehicle.maxPassengers) {
  throw new BadRequestException(
    `Vehicle capacity exceeded. Max passengers: ${offering.vehicle.maxPassengers}`
  );
}
```

**Priority**: ⚠️ High
**Effort**: 3 hours
**Status**: ⬜ Not Started

---

#### Issue #32: Rate Season Overlap Detection
**File**: `apps/api/src/pricing/pricing.service.ts:69`

**Current Code**:
```typescript
orderBy: { id: 'desc' },
```

**Issue**: Ordering by ID suggests multiple rates can match - unclear business logic

**Recommendation**:
1. Add validation preventing overlaps:
```typescript
async createRate(dto: CreateHotelRoomRateDto, tenantId: number) {
  // Check for overlaps
  const overlapping = await this.prisma.hotelRoomRate.findFirst({
    where: {
      tenantId,
      serviceOfferingId: dto.serviceOfferingId,
      isActive: true,
      OR: [
        {
          seasonFrom: { lte: dto.seasonFrom },
          seasonTo: { gte: dto.seasonFrom },
        },
        {
          seasonFrom: { lte: dto.seasonTo },
          seasonTo: { gte: dto.seasonTo },
        },
      ],
    },
  });

  if (overlapping) {
    throw new ConflictException(
      `Rate season overlaps with existing rate (${overlapping.seasonFrom} - ${overlapping.seasonTo})`
    );
  }

  // Create rate
}
```

2. Or add priority field if intentional:
```prisma
model HotelRoomRate {
  // ... existing fields
  priority Int @default(0)

  @@index([serviceOfferingId, seasonFrom, seasonTo, priority])
}
```

**Priority**: ⚠️ High
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #33: Soft Delete Not Implemented
**Files**: All entities with `isActive` field

**Current State**:
- `isActive` field exists on many models
- But deletions are hard deletes via Prisma
- No recovery mechanism

**Recommendation**: Implement soft delete globally:
```typescript
// src/common/decorators/soft-delete.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SOFT_DELETE_KEY = 'softDelete';
export const SoftDelete = () => SetMetadata(SOFT_DELETE_KEY, true);
```

Create soft delete interceptor:
```typescript
@Injectable()
export class SoftDeleteInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Intercept DELETE requests
    if (request.method === 'DELETE') {
      // Convert to UPDATE setting isActive = false
      return from(this.softDelete(context)).pipe(
        switchMap(() => next.handle())
      );
    }

    return next.handle();
  }
}
```

**Priority**: ⚠️ High
**Effort**: 4 hours
**Status**: ⬜ Not Started

---

## 6. Code Quality & Best Practices

### ✅ Strengths

#### 6.1 Excellent Code Organization
- Clear module separation by domain
- Consistent service/controller/DTO pattern
- Well-structured monorepo

#### 6.2 TypeScript Usage
- Strong typing throughout
- Shared types package for cross-app consistency

#### 6.3 API Documentation
- Comprehensive Swagger/OpenAPI setup
- Good descriptions and examples

#### 6.4 Testing Infrastructure
- E2E tests for critical workflows
- Test database setup
- GitHub Actions CI/CD

---

### ⚠️ Issues

#### Issue #34: Inconsistent Error Handling Pattern
**Files**: Multiple services

**Current State**: Some services use try-catch, others rely on global filter

**Recommendation**: Standardize approach - prefer letting global filter handle most exceptions:
```typescript
// Good - let global filter handle
async findOne(id: number, tenantId: number) {
  const booking = await this.prisma.booking.findFirst({
    where: { id, tenantId },
  });

  if (!booking) {
    throw new NotFoundException(`Booking ${id} not found`);
  }

  return booking;
}

// Use try-catch only for specific recovery logic
async createWithFallback(dto: any) {
  try {
    return await this.prisma.booking.create({ data: dto });
  } catch (error) {
    if (error.code === 'P2002') {
      // Try alternative approach
      return await this.findExisting(dto);
    }
    throw error; // Re-throw for global filter
  }
}
```

**Priority**: 📋 Medium
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #35: Magic Numbers in Business Logic
**File**: `apps/api/src/pricing/pricing.service.ts:84`

**Current Code**:
```typescript
const rooms = Math.ceil(adults / 2); // Rough estimate
```

**Issue**: Business logic hardcoded, no configuration

**Recommendation**: Move to configuration:
```typescript
// src/config/business-rules.config.ts
export const BusinessRules = {
  hotel: {
    defaultAdultsPerRoom: 2,
    maxChildAge: 12,
    childAgeRanges: {
      infant: { min: 0, max: 1.99 },
      child1: { min: 2, max: 5.99 },
      child2: { min: 6, max: 11.99 },
    },
  },
};
```

Use in service:
```typescript
const adultsPerRoom = BusinessRules.hotel.defaultAdultsPerRoom;
const rooms = Math.ceil(adults / adultsPerRoom);
```

**Priority**: 📋 Medium
**Effort**: 2 hours
**Status**: ⬜ Not Started

---

#### Issue #36: TODO Comments in Production Code
**File**: `apps/api/src/auth/auth.service.ts:331-333`

**Current Code**:
```typescript
// TODO: Send email with reset link
// For now, just log it
// await this.emailService.sendPasswordResetEmail(user.email, resetToken);
```

**Also found in**:
- `apps/api/src/auth/auth.service.ts:391` - Logout token blacklist
- Various other locations

**Recommendation**:
1. Create GitHub issues for all TODOs
2. Remove from code or convert to proper feature flags
3. Track in project board

**Priority**: 📋 Medium
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #37: Missing Unit Tests
**Files**: All service files

**Current State**: Only E2E tests, no unit tests

**Recommendation**: Add unit tests for:

```typescript
// Example: pricing.service.spec.ts
describe('PricingService', () => {
  let service: PricingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: {
            hotelRoomRate: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(PricingService);
    prisma = module.get(PrismaService);
  });

  describe('calculateHotelQuote', () => {
    it('should calculate correct price for 2 adults, 1 night', async () => {
      // Test implementation
    });

    it('should throw when no rate available', async () => {
      // Test implementation
    });
  });
});
```

Add tests for:
- Pricing calculations (critical!)
- Business rule validations
- Currency conversions
- Date range logic

**Priority**: ⚠️ High
**Effort**: 20 hours
**Status**: ⬜ Not Started

---

#### Issue #38: Inconsistent Naming Conventions
**Files**: Multiple services

**Examples**:
- Some services use `findAll()`, others use `list()`
- `tenantId` (camelCase) vs `tenant_id` (snake_case)
- `amountEur` vs `amount_eur`

**Recommendation**:
1. Standardize on camelCase for TypeScript
2. Use snake_case only in database (@map)
3. Enforce with ESLint rules:
```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "default",
        "format": ["camelCase"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

**Priority**: 📋 Medium
**Effort**: 3 hours
**Status**: ⬜ Not Started

---

#### Issue #39: Database URL Misconfiguration
**File**: `.env.example:2`

**Current Code**:
```
DATABASE_URL="mysql://root:password@localhost:3306/tour_crm"
```

**Issue**: Example shows MySQL but `schema.prisma` uses PostgreSQL

**Recommendation**: Fix to PostgreSQL:
```
DATABASE_URL="postgresql://tourcrm:tourcrm123@localhost:5432/tour_crm"
```

Also add to `.env.example`:
```
# PostgreSQL Database
DATABASE_URL="postgresql://tourcrm:tourcrm123@localhost:5432/tour_crm"

# Database Connection Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_TIMEOUT=20
```

**Priority**: 🚨 Critical
**Effort**: 5 minutes
**Status**: ⬜ Not Started

---

## 7. CRM-Specific Concerns

### ⚠️ Issues

#### Issue #40: Lead Deduplication Missing
**File**: `apps/api/src/leads/leads.service.ts`

**Current State**: No check for duplicate leads from same email/phone

**Recommendation**: Add deduplication check:
```typescript
async create(createLeadDto: CreateLeadDto, tenantId: number) {
  // Check for duplicate leads
  if (createLeadDto.clientId) {
    const existingLead = await this.prisma.lead.findFirst({
      where: {
        tenantId,
        clientId: createLeadDto.clientId,
        status: { in: ['NEW', 'CONTACTED', 'QUOTED'] },
        inquiryDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    if (existingLead) {
      throw new ConflictException(
        `Active lead already exists for this client (Lead #${existingLead.id})`
      );
    }
  }

  // Create lead
  return this.prisma.lead.create({
    data: {
      tenantId,
      ...createLeadDto,
    },
  });
}
```

**Priority**: 📋 Medium
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #41: Weak Email/Phone Validation
**Files**: Client, Lead DTOs

**Current State**:
- `@IsEmail()` on optional fields without format validation
- Phone has no format validation at all

**Recommendation**: Add stronger validation:
```typescript
import { IsPhoneNumber } from 'class-validator';

export class CreateClientDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @IsOptional()
  phone?: string;
}
```

For international support:
```typescript
@Matches(/^\+?[1-9]\d{1,14}$/, {
  message: 'Phone must be in E.164 format (e.g., +905551234567)'
})
phone?: string;
```

**Priority**: 📋 Medium
**Effort**: 1 hour
**Status**: ⬜ Not Started

---

#### Issue #42: Missing Activity Timeline
**Files**: None - feature missing

**Current State**: No unified view of client interactions

**Recommendation**: Create activity timeline:
```typescript
@Controller('clients/:clientId/timeline')
export class ClientTimelineController {
  @Get()
  async getTimeline(@Param('clientId') clientId: number, @CurrentUser() user: any) {
    const activities = [];

    // Get leads
    const leads = await this.prisma.lead.findMany({
      where: { clientId, tenantId: user.tenantId },
    });

    // Get quotations
    const quotations = await this.prisma.quotation.findMany({
      where: {
        lead: { clientId },
        tenantId: user.tenantId,
      },
    });

    // Get bookings
    const bookings = await this.prisma.booking.findMany({
      where: { clientId, tenantId: user.tenantId },
    });

    // Get payments
    const payments = await this.prisma.paymentClient.findMany({
      where: {
        booking: { clientId },
        tenantId: user.tenantId,
      },
    });

    // Combine and sort by date
    return [
      ...leads.map(l => ({ type: 'LEAD', date: l.inquiryDate, data: l })),
      ...quotations.map(q => ({ type: 'QUOTATION', date: q.createdAt, data: q })),
      ...bookings.map(b => ({ type: 'BOOKING', date: b.createdAt, data: b })),
      ...payments.map(p => ({ type: 'PAYMENT', date: p.paidAt, data: p })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
```

**Priority**: 💡 Low
**Effort**: 4 hours
**Status**: ⬜ Not Started

---

#### Issue #43: No Bulk Operations
**Files**: None - feature missing

**Current State**:
- No bulk import for clients
- No bulk update capabilities
- Critical for migration from existing systems

**Recommendation**: Add bulk import endpoint:
```typescript
@Post('clients/bulk-import')
@ApiOperation({ summary: 'Bulk import clients from CSV' })
async bulkImport(
  @Body() dto: BulkImportDto,
  @CurrentUser() user: any
) {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const clientData of dto.clients) {
    try {
      await this.clientsService.create(clientData, user.tenantId);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        client: clientData,
        error: error.message,
      });
    }
  }

  return results;
}
```

Add CSV parsing support:
```bash
npm install papaparse @types/papaparse
```

**Priority**: 📋 Medium
**Effort**: 6 hours
**Status**: ⬜ Not Started

---

#### Issue #44: Missing Communication Templates
**Files**: None - feature missing

**Current State**: No email/SMS templates for quotations, confirmations

**Recommendation**: Add template system:
```prisma
model EmailTemplate {
  id          Int      @id @default(autoincrement())
  tenantId    Int      @map("tenant_id")
  name        String   // 'QUOTATION_SENT', 'BOOKING_CONFIRMED'
  subject     String
  bodyHtml    String   @map("body_html") @db.Text
  bodyText    String   @map("body_text") @db.Text
  variables   String[] // ['customerName', 'bookingCode']
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, name])
  @@map("email_templates")
}
```

Create template service:
```typescript
@Injectable()
export class EmailTemplateService {
  async renderTemplate(
    templateName: string,
    variables: Record<string, any>,
    tenantId: number
  ) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { tenantId_name: { tenantId, name: templateName } },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateName} not found`);
    }

    // Simple variable replacement
    let html = template.bodyHtml;
    Object.keys(variables).forEach(key => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });

    return {
      subject: template.subject,
      html,
      text: template.bodyText,
    };
  }
}
```

**Priority**: 📋 Medium
**Effort**: 8 hours
**Status**: ⬜ Not Started

---

## Summary of Recommendations by Priority

### 🚨 Critical (Fix Immediately)

| # | Issue | File | Effort | Status |
|---|-------|------|--------|--------|
| 1 | Strengthen password requirements | `auth/dto/login.dto.ts:11` | 30 min | ⬜ |
| 2 | Add rate limiting on auth endpoints | Multiple auth files | 1 hour | ⬜ |
| 3 | Validate CORS configuration | `main.ts:15-18` | 30 min | ⬜ |
| 4 | Add JWT secret validation | `main.ts` | 15 min | ⬜ |
| 5 | Ensure NODE_ENV=production | Deployment config | 5 min | ⬜ |
| 19 | Implement data retention policy | Multiple models | 6 hours | ⬜ |
| 20 | Add GDPR data export | New GDPR module | 4 hours | ⬜ |
| 21 | Add GDPR data deletion/anonymization | New GDPR module | 3 hours | ⬜ |
| 24 | Remove password reset token logging | `auth.service.ts:334-335` | 5 min | ⬜ |
| 27 | Add payment amount validation | `payment-client.service.ts` | 2 hours | ⬜ |
| 28 | Add date range validation | `dto/create-booking.dto.ts` | 1 hour | ⬜ |
| 29 | Prevent quotation double-acceptance | `quotations.service.ts` | 30 min | ⬜ |
| 39 | Fix DATABASE_URL example | `.env.example:2` | 5 min | ⬜ |

**Total Critical Effort**: ~19 hours

---

### ⚠️ High Priority (Fix Before Production)

| # | Issue | File | Effort | Status |
|---|-------|------|--------|--------|
| 6 | Add XSS input sanitization | All DTOs | 2 hours | ⬜ |
| 7 | Fix decimal validation | Payment DTOs | 1 hour | ⬜ |
| 8 | Add request size limits | `main.ts` | 15 min | ⬜ |
| 9 | Secure password reset tokens | `auth.service.ts` | 3 hours | ⬜ |
| 10 | Add HTTPS enforcement | `main.ts` | 1 hour | ⬜ |
| 13 | Implement caching strategy | New cache module | 4 hours | ⬜ |
| 22 | Enhance audit logging | `audit-logs.service.ts` | 3 hours | ⬜ |
| 23 | Add consent management | New consent module | 5 hours | ⬜ |
| 30 | Validate exchange rates exist | Booking service | 1 hour | ⬜ |
| 31 | Add capacity validation | Service offerings | 3 hours | ⬜ |
| 32 | Prevent rate overlap | Rate services | 2 hours | ⬜ |
| 33 | Implement soft delete | Global interceptor | 4 hours | ⬜ |
| 37 | Add unit tests | All services | 20 hours | ⬜ |

**Total High Priority Effort**: ~49.25 hours

---

### 📋 Medium Priority (Address Soon)

| # | Issue | File | Effort | Status |
|---|-------|------|--------|--------|
| 11 | Fix N+1 query issues | `quotations.service.ts` | 30 min | ⬜ |
| 12 | Configure connection pooling | `schema.prisma` | 30 min | ⬜ |
| 14 | Optimize rate lookup | `pricing.service.ts` | 2 hours | ⬜ |
| 15 | Add query timeouts | `prisma.service.ts` | 1 hour | ⬜ |
| 16 | Standardize error messages | Multiple services | 2 hours | ⬜ |
| 17 | Validate nested objects | Various DTOs | 1 hour | ⬜ |
| 34 | Standardize error handling | Multiple services | 2 hours | ⬜ |
| 35 | Remove magic numbers | `pricing.service.ts` | 2 hours | ⬜ |
| 36 | Remove TODO comments | Multiple files | 1 hour | ⬜ |
| 38 | Fix naming conventions | Multiple files | 3 hours | ⬜ |
| 40 | Add lead deduplication | `leads.service.ts` | 1 hour | ⬜ |
| 41 | Improve email/phone validation | Client/Lead DTOs | 1 hour | ⬜ |
| 43 | Add bulk operations | New controller | 6 hours | ⬜ |
| 44 | Add communication templates | New template module | 8 hours | ⬜ |

**Total Medium Priority Effort**: ~31 hours

---

### 💡 Low Priority (Nice to Have)

| # | Issue | File | Effort | Status |
|---|-------|------|--------|--------|
| 18 | Fix password reset timing attack | `auth.service.ts` | 30 min | ⬜ |
| 25 | Add field-level encryption | Client/Vendor models | 6 hours | ⬜ |
| 26 | Track privacy policy acceptance | New model | 2 hours | ⬜ |
| 42 | Add activity timeline | New controller | 4 hours | ⬜ |

**Total Low Priority Effort**: ~12.5 hours

---

## Total Estimated Effort

- **Critical**: ~19 hours
- **High Priority**: ~49.25 hours
- **Medium Priority**: ~31 hours
- **Low Priority**: ~12.5 hours

**Grand Total**: ~111.75 hours (~14 working days)

---

## Recommended Implementation Order

### Week 1: Security & Critical Fixes (Day 1-3)
1. Fix database URL in .env.example (#39)
2. Remove password reset token logging (#24)
3. Add JWT secret validation (#4)
4. Strengthen password requirements (#1)
5. Add rate limiting (#2)
6. Validate CORS configuration (#3)
7. Add payment amount validation (#27)
8. Add date range validation (#28)
9. Prevent quotation double-acceptance (#29)

### Week 1: GDPR Compliance (Day 4-5)
10. Implement data retention policy (#19)
11. Add GDPR data export (#20)
12. Add GDPR data deletion (#21)
13. Add consent management (#23)

### Week 2: Security Hardening (Day 1-2)
14. Add XSS input sanitization (#6)
15. Fix decimal validation (#7)
16. Add request size limits (#8)
17. Add HTTPS enforcement (#10)
18. Secure password reset tokens (#9)

### Week 2: Performance & Business Logic (Day 3-5)
19. Implement caching strategy (#13)
20. Validate exchange rates exist (#30)
21. Add capacity validation (#31)
22. Prevent rate overlap (#32)
23. Implement soft delete (#33)
24. Enhance audit logging (#22)

### Week 3: Testing & Code Quality (Day 1-5)
25. Add unit tests for critical business logic (#37)
26. Standardize error handling (#34)
27. Remove magic numbers (#35)
28. Fix naming conventions (#38)

### Week 4: Medium Priority Features (Day 1-5)
29. Fix N+1 queries (#11)
30. Configure connection pooling (#12)
31. Optimize rate lookup (#14)
32. Add query timeouts (#15)
33. Standardize error messages (#16)
34. Validate nested objects (#17)
35. Remove TODO comments (#36)
36. Add lead deduplication (#40)
37. Improve validation (#41)
38. Add bulk operations (#43)
39. Add communication templates (#44)

---

## Conclusion

This Tour Operator CRM is a **well-built, production-ready system** with solid architecture and security foundations. The main areas requiring attention are:

1. **Security hardening** (passwords, rate limiting, input sanitization)
2. **GDPR compliance** (data export, deletion, consent)
3. **Business logic validation** (payments, dates, capacities)
4. **Testing coverage** (unit tests)
5. **Performance optimization** (caching, query optimization)

**Overall Assessment**: The codebase demonstrates strong engineering practices and is suitable for production deployment after addressing the critical security and compliance issues.

**Recommended Timeline**:
- **Minimum viable**: 1 week (critical issues only)
- **Production ready**: 2 weeks (critical + high priority)
- **Full implementation**: 4 weeks (all priorities)

---

## Next Steps

1. Review this document with the team
2. Prioritize issues based on business requirements
3. Create GitHub issues for each item
4. Assign to sprint backlog
5. Begin implementation following the recommended order

**Questions or clarifications needed?** Please reach out to the reviewer.
