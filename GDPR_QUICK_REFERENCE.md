# GDPR Compliance - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### 1. Add Encryption Key to .env
```bash
# Generate a secure key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env
ENCRYPTION_KEY="<paste-generated-key-here>"
```

### 2. Run Database Migrations
```bash
cd apps/api
npx prisma migrate deploy
```

### 3. Encrypt Existing Data (One-Time)
```bash
# BACKUP DATABASE FIRST!
npx ts-node src/scripts/encrypt-existing-data.ts
```

### 4. Test the Implementation
```bash
# Start the API
npm run dev

# Visit Swagger docs
open http://localhost:3001/api/docs
```

---

## 📋 Common Use Cases

### Granting Consent
```typescript
// API: POST /api/v1/consent
{
  "clientId": 123,
  "purpose": "MARKETING_EMAIL",
  "granted": true,
  "version": "1.0.0"
}
```

### Checking Consent
```typescript
// API: GET /api/v1/consent/check?clientId=123&purpose=MARKETING_EMAIL
// Response: { "hasConsent": true/false }
```

### Recording Privacy Policy Acceptance
```typescript
// API: POST /api/v1/privacy-policy/accept
{
  "version": "1.0.0",
  "userId": 456
}
```

### Generating GDPR Compliance Report
```typescript
// API: GET /api/v1/audit-logs/reports/gdpr-compliance?dateFrom=2025-01-01&dateTo=2025-12-31
```

---

## 🔐 Using Field-Level Encryption in Your Code

### In Service Layer
```typescript
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class MyService {
  constructor(private readonly encryptionService: EncryptionService) {}

  async createRecord(data: any) {
    // Encrypt sensitive fields before saving
    const encrypted = {
      ...data,
      passportNumber: this.encryptionService.encrypt(data.passportNumber),
      taxId: this.encryptionService.encrypt(data.taxId),
    };

    return this.prisma.myModel.create({ data: encrypted });
  }

  async getRecord(id: number) {
    const record = await this.prisma.myModel.findUnique({ where: { id } });

    // Decrypt sensitive fields before returning
    if (record) {
      record.passportNumber = this.encryptionService.decrypt(record.passportNumber);
      record.taxId = this.encryptionService.decrypt(record.taxId);
    }

    return record;
  }
}
```

---

## 🛡️ Protecting Endpoints with Consent

### Using @RequireConsent Decorator
```typescript
import { RequireConsent } from '../common/decorators/require-consent.decorator';
import { ConsentPurpose } from '../consent/dto/create-consent.dto';
import { ConsentGuard } from '../common/guards/consent.guard';

@Controller('marketing')
export class MarketingController {
  @Post('send-email')
  @UseGuards(ConsentGuard)
  @RequireConsent(ConsentPurpose.MARKETING_EMAIL)
  async sendMarketingEmail(@Body() dto: SendEmailDto) {
    // This will only execute if client has granted MARKETING_EMAIL consent
    return this.emailService.send(dto);
  }
}
```

---

## 📊 Using PII Access Logger

### Apply to Controller
```typescript
import { PiiAccessLogger } from '../common/interceptors/pii-access-logger.interceptor';

@Controller('clients')
@UseInterceptors(PiiAccessLogger) // Automatically logs PII access
export class ClientsController {
  @Get(':id')
  async getClient(@Param('id') id: number) {
    // If response contains PII fields, access will be logged
    return this.clientsService.findOne(id);
  }
}
```

---

## 🔍 Checking Privacy Policy Status

### Middleware for Route Protection
```typescript
import { PrivacyPolicyCheckMiddleware } from '../common/middleware/privacy-policy-check.middleware';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrivacyPolicyCheckMiddleware)
      .forRoutes('bookings', 'payments'); // Only apply to specific routes
  }
}
```

---

## 📈 Generating Reports

### PII Access Report
```bash
GET /api/v1/audit-logs/reports/pii-access?userId=123&dateFrom=2025-01-01&entity=Client
```

**Response**:
```json
{
  "totalAccesses": 45,
  "uniqueUsers": 5,
  "recentAccesses": [...],
  "accessesByEntity": [
    { "entity": "Client", "count": 30 },
    { "entity": "Vendor", "count": 15 }
  ]
}
```

### GDPR Compliance Report
```bash
GET /api/v1/audit-logs/reports/gdpr-compliance?dateFrom=2025-01-01
```

**Response**:
```json
{
  "summary": {
    "dataExports": 12,
    "anonymizations": 3,
    "consentsGranted": 156,
    "consentsRevoked": 8,
    "policyAcceptances": 200
  },
  "recentActions": [...]
}
```

---

## 🔧 Troubleshooting

### Encryption Not Working
```bash
# Check if ENCRYPTION_KEY is set
echo $ENCRYPTION_KEY

# Check logs for encryption warnings
grep "ENCRYPTION_KEY" logs/app.log

# Validate key length
node -e "console.log(process.env.ENCRYPTION_KEY.length)" # Should be >= 32
```

### Consent Check Failing
```typescript
// Debug consent status
GET /api/v1/consent/check?clientId=123&purpose=MARKETING_EMAIL

// Get consent history
GET /api/v1/consent/client/123/history
```

### Privacy Policy Issues
```typescript
// Check if user needs to re-accept
GET /api/v1/privacy-policy/check-acceptance/456

// Get current version
GET /api/v1/privacy-policy/current-version
```

---

## ⚡ Performance Tips

### 1. Cache Consent Checks
```typescript
@Injectable()
export class ConsentCacheService {
  private cache = new Map<string, { hasConsent: boolean; expires: number }>();

  async hasConsent(clientId: number, purpose: ConsentPurpose): Promise<boolean> {
    const key = `${clientId}:${purpose}`;
    const cached = this.cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return cached.hasConsent;
    }

    const hasConsent = await this.consentService.hasConsent(clientId, purpose, tenantId);

    this.cache.set(key, {
      hasConsent,
      expires: Date.now() + 300000, // 5 minutes
    });

    return hasConsent;
  }
}
```

### 2. Batch Encrypt/Decrypt
```typescript
// Instead of encrypting one by one
for (const client of clients) {
  client.passport = this.encryption.encrypt(client.passport);
}

// Batch process
const encrypted = clients.map(c => ({
  ...c,
  passport: this.encryption.encrypt(c.passport),
}));
```

---

## 🎯 Best Practices

### DO ✅
- Always check ENCRYPTION_KEY is set in production
- Log all consent changes
- Use @RequireConsent for marketing actions
- Apply PiiAccessLogger to sensitive endpoints
- Generate GDPR reports monthly
- Backup database before data migration

### DON'T ❌
- Don't log PII in application logs
- Don't skip consent checks for "internal" operations
- Don't store encryption key in code
- Don't decrypt data unless necessary
- Don't forget to update privacy policy version when it changes

---

## 📞 Support

### Key Files for Reference
- Consent Service: `apps/api/src/consent/consent.service.ts`
- Encryption Service: `apps/api/src/common/services/encryption.service.ts`
- Privacy Policy Service: `apps/api/src/privacy-policy/privacy-policy.service.ts`
- PII Logger: `apps/api/src/common/interceptors/pii-access-logger.interceptor.ts`

### Testing Endpoints
- Swagger UI: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/api/health

---

## 🔄 Common Workflows

### New Client Registration with Consent
```typescript
// 1. Create client
POST /api/v1/clients
{ "name": "John Doe", "email": "john@example.com", ... }

// 2. Grant necessary consents
POST /api/v1/consent/bulk-grant
{
  "clientId": 123,
  "purposes": [
    { "purpose": "DATA_PROCESSING" },
    { "purpose": "MARKETING_EMAIL" }
  ],
  "version": "1.0.0"
}

// 3. Record privacy policy acceptance
POST /api/v1/privacy-policy/accept
{
  "version": "1.0.0",
  "clientId": 123
}
```

### Monthly GDPR Compliance Review
```bash
# 1. Generate GDPR compliance report
GET /api/v1/audit-logs/reports/gdpr-compliance?dateFrom=2025-10-01&dateTo=2025-10-31

# 2. Generate PII access report
GET /api/v1/audit-logs/reports/pii-access?dateFrom=2025-10-01

# 3. Get consent statistics
GET /api/v1/consent/statistics

# 4. Get privacy policy acceptance stats
GET /api/v1/privacy-policy/statistics
```

---

**Last Updated**: November 2, 2025
**Version**: 1.0.0
