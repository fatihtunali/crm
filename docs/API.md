# API Documentation

Complete reference for the Tour Operator CRM REST API.

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All endpoints (except `/auth/login`, `/auth/refresh`, and `/health/*`) require a valid JWT token.

### Headers

```http
Authorization: Bearer <access_token>
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@tourcrm.com",
  "password": "Admin123!"
}
```

**Rate Limit:** 5 requests per minute per IP

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@tourcrm.com",
    "name": "Admin User",
    "role": "OWNER",
    "tenantId": 1
  }
}
```

**Security:**
- Implements rate limiting (5 attempts per minute) to prevent brute force attacks
- JWT tokens expire after 24 hours (access token) and 7 days (refresh token)
- All passwords are hashed using Argon2 (industry-leading algorithm)

### Password Requirements

All passwords must meet the following complexity requirements:

- **Minimum Length:** 8 characters
- **Uppercase Letter:** At least one (A-Z)
- **Lowercase Letter:** At least one (a-z)
- **Number:** At least one (0-9)
- **Special Character:** At least one (@$!%*?&)

**Example Valid Passwords:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Admin123!`

**Example Invalid Passwords:**
- `password` (no uppercase, number, or special character)
- `Pass123` (no special character)
- `Pass!` (too short, no number)

---

## Pagination

All list endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 50 | Items per page (max: 100) |
| `sortBy` | string | createdAt | Field to sort by |
| `order` | string | desc | Sort order: `asc` or `desc` |

**Example Request:**
```http
GET /clients?page=2&limit=20&sortBy=name&order=asc
```

**Response Format:**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

---

## Quotation Workflow

### Send Quotation to Client

Transitions quotation status from `DRAFT` → `SENT`.

```http
POST /quotations/:id/send
```

**Requirements:**
- Quotation must be in `DRAFT` status
- Associated client must have a valid email address

**Response:**
```json
{
  "id": 1,
  "status": "SENT",
  "message": "Quotation sent successfully to client@example.com",
  "lead": {
    "client": {
      "name": "John Doe",
      "email": "client@example.com"
    }
  }
}
```

### Accept Quotation

Transitions quotation from `SENT` → `ACCEPTED`.

```http
POST /quotations/:id/accept
```

**Validation:**
- Prevents accepting quotations that are already accepted
- Prevents accepting quotations that already have a booking
- Creates a booking with locked exchange rate upon acceptance

**Response (Success):**
```json
{
  "id": 1,
  "status": "ACCEPTED",
  "message": "Quotation accepted successfully"
}
```

**Response (Already Accepted):**
```json
{
  "statusCode": 409,
  "message": "Quotation has already been accepted and cannot be accepted again",
  "error": "Conflict"
}
```

**Response (Booking Exists):**
```json
{
  "statusCode": 409,
  "message": "A booking already exists for this quotation (Booking Code: BK-2024-001). Cannot accept quotation again.",
  "error": "Conflict"
}
```

### Reject Quotation

Transitions quotation from `SENT` → `REJECTED`.

```http
POST /quotations/:id/reject
```

---

## File Management

Secure file upload system using AWS S3 pre-signed URLs.

### 1. Request Upload URL

```http
POST /files/upload-url
Content-Type: application/json

{
  "fileName": "passport-scan.pdf",
  "mimeType": "application/pdf",
  "fileSize": 1024000,
  "entity": "Client",
  "entityId": 123
}
```

**Supported MIME Types:**
- `image/jpeg`, `image/jpg`, `image/png`, `image/gif`
- `application/pdf`
- `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Response:**
```json
{
  "fileId": 1,
  "uploadUrl": "https://bucket.s3.amazonaws.com/uploads/1/1699123456-abc123.pdf?X-Amz-Algorithm=...",
  "storageKey": "uploads/1/1699123456-abc123.pdf",
  "expiresIn": 900
}
```

### 2. Upload File to S3

Use the pre-signed URL to upload the file directly to S3:

```http
PUT <uploadUrl>
Content-Type: <mimeType>

<binary file data>
```

### 3. Confirm Upload

After successful upload, confirm to mark the file as `UPLOADED`:

```http
POST /files/:id/confirm
```

**Response:**
```json
{
  "id": 1,
  "fileName": "1699123456-abc123.pdf",
  "originalName": "passport-scan.pdf",
  "status": "UPLOADED",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "url": "https://bucket.s3.amazonaws.com/..."
}
```

### List Files

```http
GET /files?entity=Client&entityId=123&page=1&limit=20
```

**Query Parameters:**
- `entity` (optional) - Filter by entity type
- `entityId` (optional) - Filter by entity ID
- Standard pagination parameters

### Get Download URL

Generate a temporary download URL (valid for 1 hour):

```http
GET /files/:id/download-url
```

**Response:**
```json
{
  "fileId": 1,
  "fileName": "passport-scan.pdf",
  "downloadUrl": "https://bucket.s3.amazonaws.com/uploads/1/1699123456-abc123.pdf?X-Amz-Algorithm=...",
  "expiresIn": 3600
}
```

### Delete File

```http
DELETE /files/:id
```

**Access:** OWNER, ADMIN only

---

## Audit Logs

Query system audit logs with comprehensive filtering.

### Query Audit Logs

```http
GET /audit-logs?entity=Booking&action=UPDATE&dateFrom=2024-01-01&dateTo=2024-01-31
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `entity` | string | Filter by entity type | `Booking`, `Client`, `Invoice` |
| `entityId` | number | Filter by entity ID | `123` |
| `userId` | number | Filter by user who made the change | `5` |
| `action` | string | Filter by action type | `CREATE`, `UPDATE`, `DELETE` |
| `dateFrom` | string | Start date (ISO 8601) | `2024-01-01` |
| `dateTo` | string | End date (ISO 8601) | `2024-01-31` |
| `ipAddress` | string | Filter by IP address | `192.168.1.1` |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "entity": "Booking",
      "entityId": 123,
      "action": "UPDATE",
      "user": {
        "id": 5,
        "name": "John Agent",
        "email": "agent@example.com"
      },
      "diffJson": {
        "status": {
          "old": "PENDING",
          "new": "CONFIRMED"
        }
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 156,
    "totalPages": 4
  }
}
```

### Get Audit Log Statistics

```http
GET /audit-logs/stats
```

**Response:**
```json
{
  "actionStats": [
    {
      "action": "UPDATE",
      "_count": { "id": 450 }
    },
    {
      "action": "CREATE",
      "_count": { "id": 320 }
    },
    {
      "action": "DELETE",
      "_count": { "id": 45 }
    }
  ],
  "entityStats": [
    {
      "entity": "Booking",
      "_count": { "id": 380 }
    },
    {
      "entity": "Client",
      "_count": { "id": 250 }
    }
  ],
  "recentActivity24h": 78
}
```

### Get Specific Audit Log

```http
GET /audit-logs/:id
```

---

## Invoice PDF Generation

Generate professional invoices as PDF documents.

```http
GET /invoices/:id/pdf
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="invoice-123.pdf"`
- Binary PDF data

**PDF Contents:**
- Company header with logo, address, contact info, tax ID
- Invoice number and date
- Bill-to section (client details)
- Booking details (booking code, tour name, travel dates)
- Line items with amounts
- Subtotal, VAT, and total
- Footer with thank you message

---

## Idempotency

Payment creation endpoints support idempotency to prevent duplicate charges.

### Client Payments

```http
POST /payment-client
Content-Type: application/json
Idempotency-Key: unique-key-12345

{
  "bookingId": 1,
  "amountEur": 1500.00,
  "method": "BANK_TRANSFER",
  "paidAt": "2024-01-15T10:30:00Z",
  "txnRef": "TXN123456"
}
```

**Payment Validation:**
- System validates payment amount doesn't exceed booking total
- Calculates total paid (COMPLETED + PENDING payments)
- Returns error if new payment would cause overpayment

**Response (Overpayment Attempt):**
```json
{
  "statusCode": 400,
  "message": "Payment amount 500.00 EUR would exceed booking total. Booking total: 1500.00 EUR, Already paid: 1200.00 EUR, Remaining balance: 300.00 EUR",
  "error": "Bad Request"
}
```

### Vendor Payments

```http
POST /payment-vendor
Content-Type: application/json
Idempotency-Key: unique-key-67890

{
  "bookingId": 1,
  "vendorId": 5,
  "amountTry": 25000.00,
  "dueAt": "2024-01-20T00:00:00Z",
  "notes": "Hotel accommodation payment"
}
```

**Headers:**
- `Idempotency-Key`: Required, unique string (UUID recommended)

**Behavior:**
- If the key has been used before (within 30 days), the cached response is returned
- If the key is new, the payment is created normally
- Keys expire after 30 days (automatically cleaned up by data retention policies)

---

## Health Checks

Kubernetes-ready health check endpoints (no authentication required).

### Liveness Probe

```http
GET /health/healthz
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Readiness Probe

Checks database connectivity:

```http
GET /health/readyz
```

**Response (Healthy):**
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "connected"
  }
}
```

**Response (Unhealthy):**
```json
{
  "status": "not ready",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "disconnected"
  },
  "error": "Connection timeout"
}
```

HTTP Status: `503 Service Unavailable`

---

## Error Handling

All errors follow a standard format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/clients",
  "method": "POST",
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "email": ["email must be a valid email address"]
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource or idempotency key required |
| 422 | Unprocessable Entity - Business logic violation |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Database connection failed |

### Prisma Error Mapping

The API automatically converts Prisma database errors to user-friendly messages:

- **P2002** (Unique constraint) → 409 Conflict
- **P2025** (Record not found) → 404 Not Found
- **P2003** (Foreign key constraint) → 400 Bad Request
- **P2014** (Relation violation) → 400 Bad Request

---

## Environment Configuration

Required environment variables:

```env
# Database - PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5432/tour_crm"

# Database Connection Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_TIMEOUT=20

# JWT - IMPORTANT: Use strong secrets (minimum 32 characters) in production
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS S3 (for file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET="your-bucket-name"
AWS_S3_UPLOAD_URL_EXPIRES_IN="900"

# File Upload
MAX_FILE_SIZE="10485760"  # 10MB

# API
NODE_ENV="development"
PORT=3001
API_PREFIX="api/v1"

# CORS - Comma-separated list of allowed origins (supports multiple domains)
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

**Security Requirements:**

1. **JWT Secrets:**
   - Must be at least 32 characters long
   - Application validates on startup and throws error if too short
   - Production check: ensures secrets don't contain "change-in-production" placeholder text

2. **Database:**
   - Production warning if DATABASE_URL contains "localhost"
   - Connection pooling configured for optimal performance

3. **CORS:**
   - Supports multiple origins separated by commas
   - Origins are validated against the whitelist
   - Requests from unauthorized origins are blocked

---

## Rate Limiting

The API implements rate limiting using `@nestjs/throttler` to protect against abuse:

### Limits

| Endpoint Type | Limit | Time Window |
|---------------|-------|-------------|
| Authentication (`/auth/login`, `/auth/forgot-password`) | 5 requests | 60 seconds |
| General API endpoints | 100 requests | 60 seconds |

### Rate Limit Headers

When rate limited, the API returns:

**Response (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

**Best Practices:**
- Monitor response headers for rate limit information
- Implement exponential backoff for retries
- Cache responses when appropriate to reduce API calls
- Use webhooks instead of polling where possible

---

## GDPR Compliance

The API provides comprehensive GDPR compliance features for data protection and privacy.

### Export My Personal Data

Export all data for the authenticated user (GDPR Article 20 - Right to Data Portability).

```http
GET /gdpr/export/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "format": "JSON",
  "dataSubject": {
    "type": "USER",
    "id": 1,
    "email": "user@example.com"
  },
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Agent",
    "role": "AGENT",
    "phone": "+1234567890",
    "preferredLanguage": "en",
    "tenantId": 1,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "auditLogs": [...]
  },
  "client": {
    "id": 123,
    "name": "John Doe",
    "email": "user@example.com",
    "leads": [...],
    "bookings": [...]
  },
  "metadata": {
    "totalLeads": 5,
    "totalBookings": 3,
    "totalPayments": 8
  }
}
```

### Export Client Data

Export all personal data for a specific client (requires ADMIN, OWNER, or AGENT role).

```http
GET /gdpr/export/client/:id
Authorization: Bearer <access_token>
```

**Access:** OWNER, ADMIN, AGENT

**Response:**
```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "format": "JSON",
  "dataSubject": {
    "type": "CLIENT",
    "id": 123,
    "name": "John Doe",
    "email": "client@example.com"
  },
  "personalData": {
    "name": "John Doe",
    "email": "client@example.com",
    "phone": "+1234567890",
    "nationality": "US",
    "passportNumber": "AB123456",
    "dateOfBirth": "1985-05-15",
    "preferredLanguage": "en",
    "tags": ["VIP", "Returning"],
    "notes": "Prefers luxury hotels",
    "createdAt": "2023-06-01T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z"
  },
  "bookingHistory": [
    {
      "bookingCode": "BK-2024-001",
      "startDate": "2024-03-01",
      "endDate": "2024-03-10",
      "status": "CONFIRMED",
      "totalAmount": 3500.00,
      "items": 5,
      "payments": 2,
      "invoices": 1,
      "createdAt": "2024-01-05T00:00:00Z"
    }
  ],
  "leadHistory": [
    {
      "id": 45,
      "source": "Website",
      "status": "WON",
      "inquiryDate": "2024-01-01",
      "quotations": 2
    }
  ],
  "metadata": {
    "totalLeads": 3,
    "totalBookings": 2,
    "totalPayments": 5,
    "totalSpent": 7500.00
  }
}
```

**Note:** This action is logged in audit logs for compliance tracking.

### Anonymize Client Data

Anonymize client personal data (GDPR Article 17 - Right to be Forgotten).

```http
DELETE /gdpr/client/:id
Authorization: Bearer <access_token>
```

**Access:** OWNER, ADMIN

**Behavior:**
- Checks for active bookings (PENDING or CONFIRMED status)
- If active bookings exist, returns 403 Forbidden
- Anonymizes personal information while preserving booking history for legal/financial purposes
- Marks client as inactive
- Creates audit log entry

**Response (Success):**
```json
{
  "success": true,
  "message": "Client data has been anonymized successfully",
  "clientId": 123,
  "anonymizedAt": "2024-01-15T10:30:00.000Z",
  "preservedRecords": {
    "bookings": 5,
    "reason": "Legal and financial record-keeping requirements"
  }
}
```

**Response (Active Bookings):**
```json
{
  "statusCode": 403,
  "message": "Cannot anonymize client with 2 active booking(s). Please complete or cancel bookings first: BK-2024-001, BK-2024-002",
  "error": "Forbidden"
}
```

**Anonymization Process:**
- Name → `Deleted User {clientId}`
- Email → `deleted-{clientId}-{timestamp}@anonymized.local`
- Phone → `null`
- Passport Number → `null`
- Date of Birth → `null`
- Nationality → `null`
- Notes → `[Personal data deleted per GDPR request]`
- Tags → `["ANONYMIZED"]`
- isActive → `false`

### Delete User Account

Soft delete (deactivate) a user account.

```http
DELETE /gdpr/user/:id
Authorization: Bearer <access_token>
```

**Access:** OWNER, ADMIN

**Restrictions:**
- Cannot delete OWNER accounts
- User can delete their own account, or admins can delete others

**Response:**
```json
{
  "success": true,
  "message": "User account has been deactivated successfully",
  "userId": 5,
  "deletedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (Cannot Delete OWNER):**
```json
{
  "statusCode": 403,
  "message": "Cannot delete OWNER account. Transfer ownership first.",
  "error": "Forbidden"
}
```

### Get GDPR Compliance Status

Get current GDPR compliance status and statistics for the tenant.

```http
GET /gdpr/compliance-status
Authorization: Bearer <access_token>
```

**Access:** OWNER, ADMIN

**Response:**
```json
{
  "tenantId": 1,
  "checkedAt": "2024-01-15T10:30:00.000Z",
  "clients": {
    "total": 500,
    "active": 450,
    "inactive": 50,
    "anonymized": 15
  },
  "users": {
    "total": 25,
    "active": 23,
    "inactive": 2
  },
  "gdprCompliance": {
    "dataExportAvailable": true,
    "dataPortabilityAvailable": true,
    "rightToErasureAvailable": true,
    "dataMinimizationEnabled": true,
    "retentionPolicyActive": true
  }
}
```

---

## Data Retention Policies

The API implements automated data retention policies to ensure GDPR compliance and optimize database performance.

### Retention Schedules

| Data Type | Retention Period | Action | Schedule |
|-----------|------------------|--------|----------|
| Inactive Clients | 3 years | Archive (set `isActive=false`) | Daily at 2 AM |
| Audit Logs | 7 years | Delete | Weekly (Sunday at 3 AM) |
| Idempotency Keys | 30 days | Delete | Weekly (Sunday at 3 AM) |
| Old Leads | 2 years | Delete (LOST status, no quotations) | Weekly (Sunday at 3 AM) |

### Retention Logic

**Inactive Clients:**
- Clients with no activity (updates or bookings) for 3 years
- Automatically marked as inactive
- Can be reactivated if client returns

**Audit Logs:**
- Logs older than 7 years are permanently deleted
- Maintains compliance with data retention regulations

**Idempotency Keys:**
- Keys older than 30 days are deleted
- Active keys are used for payment deduplication

**Old Leads:**
- Only deletes leads with:
  - Status: LOST
  - No associated quotations
  - Older than 2 years

### Manual Data Retention

Administrators can manually trigger data retention cleanup (endpoint not publicly exposed, available for internal use):

```typescript
// Internal service method
await dataRetentionService.runDataRetentionNow();
```

**Returns:**
```json
{
  "archivedClients": 12,
  "deletedAuditLogs": 450,
  "deletedIdempotencyKeys": 89,
  "deletedLeads": 34
}
```

---

## Reports

Generate business intelligence reports with filtering options.

### P&L Report

```http
GET /reports/pnl?dateFrom=2024-01-01&dateTo=2024-12-31
```

**Query Parameters:**
- `dateFrom` (optional) - Start date (ISO 8601)
- `dateTo` (optional) - End date (ISO 8601)

**Response:**
```json
{
  "period": {
    "from": "2024-01-01",
    "to": "2024-12-31"
  },
  "revenue": {
    "totalEur": 150000,
    "transactionCount": 45
  },
  "costs": {
    "totalTry": 3500000,
    "totalEur": 105000,
    "transactionCount": 120,
    "exchangeRateUsed": 0.03
  },
  "profit": {
    "netProfitEur": 45000,
    "profitMarginPct": 30
  }
}
```

### Revenue Report

```http
GET /reports/revenue?dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response:**
```json
{
  "period": {
    "from": "2024-01-01",
    "to": "2024-12-31"
  },
  "summary": {
    "totalBookingsValue": 200000,
    "totalReceivedEur": 150000,
    "totalBookingsCount": 65
  },
  "byPaymentStatus": [
    {
      "status": "COMPLETED",
      "amountEur": 150000,
      "count": 45
    }
  ],
  "byBookingStatus": [
    {
      "status": "CONFIRMED",
      "valueEur": 180000,
      "count": 55
    }
  ]
}
```

### Leads Report

```http
GET /reports/leads?dateFrom=2024-01-01&status=WON
```

**Query Parameters:**
- `dateFrom` (optional) - Start date
- `dateTo` (optional) - End date
- `status` (optional) - Filter by lead status

**Response:**
```json
{
  "period": {
    "from": "2024-01-01",
    "to": null
  },
  "summary": {
    "totalLeads": 150,
    "wonLeads": 45,
    "lostLeads": 30,
    "conversionRate": 30,
    "averageBudgetEur": 3500,
    "leadsWithQuotations": 80
  },
  "byStatus": [
    {
      "status": "WON",
      "count": 45,
      "percentage": 30
    }
  ],
  "bySource": [
    {
      "source": "Website",
      "count": 60,
      "percentage": 40
    }
  ]
}
```

---

## Search

Advanced search endpoints for bookings and quotations.

### Search Bookings

```http
GET /bookings/search?clientName=John&status=CONFIRMED&startDateFrom=2024-01-01
```

**Query Parameters:**
- `bookingCode` (optional) - Search by booking code
- `clientName` (optional) - Search by client name
- `clientEmail` (optional) - Search by client email
- `status` (optional) - Filter by booking status
- `startDateFrom` (optional) - Filter by start date from
- `startDateTo` (optional) - Filter by start date to
- Standard pagination parameters

### Search Quotations

```http
GET /quotations/search?clientName=John&tourName=Istanbul&status=SENT
```

**Query Parameters:**
- `clientName` (optional) - Search by client name (from lead)
- `tourName` (optional) - Search by tour name
- `status` (optional) - Filter by quotation status
- `createdFrom` (optional) - Filter by creation date from
- `createdTo` (optional) - Filter by creation date to
- `validUntil` (optional) - Filter by valid until date
- Standard pagination parameters

---

## Notifications

Send notifications via email or WhatsApp using predefined templates.

### Send Notification

```http
POST /notifications/send
Content-Type: application/json

{
  "channel": "EMAIL",
  "template": "BOOKING_CONFIRMED",
  "recipient": "client@example.com",
  "language": "en",
  "variables": {
    "clientName": "John Doe",
    "bookingCode": "BK-2024-001",
    "amount": "1500.00",
    "companyName": "Tour Company"
  }
}
```

**Available Templates:**
- `QUOTATION_SENT` - Send quotation to client
- `BOOKING_CONFIRMED` - Booking confirmation
- `PAYMENT_REMINDER` - Payment reminder
- `PAYMENT_RECEIVED` - Payment received confirmation
- `BOOKING_REMINDER` - Tour reminder before start date

**Supported Languages:**
- `en` - English
- `tr` - Turkish (Türkçe)

**Supported Channels:**
- `EMAIL` - Email notification
- `WHATSAPP` - WhatsApp message

**Note:** This is a stub implementation. Notifications are logged but not actually sent.

### Get Available Templates

```http
GET /notifications/templates
```

**Response:**
```json
{
  "templates": [
    {
      "key": "QUOTATION_SENT",
      "name": "Quotation Sent",
      "description": "Sent when a quotation is emailed to a client",
      "supportedLanguages": ["en", "tr"]
    }
  ],
  "channels": ["EMAIL", "WHATSAPP"],
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "tr", "name": "Turkish" }
  ]
}
```

---

## User Profile

Manage current user profile and preferences.

### Get Current User Profile

```http
GET /auth/me
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@tourcrm.com",
  "name": "Admin User",
  "role": "OWNER",
  "phone": "+1234567890",
  "preferredLanguage": "en",
  "tenantId": 1,
  "isActive": true,
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "tenant": {
    "id": 1,
    "name": "Tour Company",
    "code": "TOUR01",
    "defaultCurrency": "EUR"
  }
}
```

### Update Current User Profile

```http
PATCH /auth/me
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "preferredLanguage": "tr"
}
```

---

## Password Management

Password reset and logout functionality.

### Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Rate Limit:** 5 requests per minute per IP (same as login endpoint)

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent (stub implementation)"
}
```

**Security Notes:**
- Always returns success to prevent email enumeration attacks
- Rate limited to prevent abuse
- In development mode, reset token is logged to console (stub implementation)
- In production, reset token should be sent via email (implementation required)

### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePassword123!"
}
```

**Password Requirements:** New password must meet complexity requirements (see Password Requirements section above)

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

**Response (Invalid Password):**
```json
{
  "statusCode": 400,
  "message": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
  ],
  "error": "Bad Request"
}
```

### Logout

```http
POST /auth/logout
```

**Response:**
```json
{
  "message": "Logged out successfully. Please remove tokens from client storage."
}
```

**Note:** Since JWTs are stateless, client must remove tokens from storage.

---

## Exchange Rate Import

Import exchange rates from CSV file.

### Import Rates from CSV

```http
POST /exchange-rates/import
Content-Type: application/json

{
  "csvContent": "TRY,EUR,0.0305,2024-01-15\nTRY,USD,0.0335,2024-01-15\nTRY,GBP,0.0265,2024-01-15"
}
```

**CSV Format:**
```
fromCurrency,toCurrency,rate,rateDate
TRY,EUR,0.0305,2024-01-15
TRY,USD,0.0335,2024-01-15
TRY,GBP,0.0265,2024-01-15
```

**Response:**
```json
{
  "summary": {
    "total": 3,
    "imported": 3,
    "skipped": 0,
    "errors": 0
  },
  "imported": [
    {
      "id": 1,
      "fromCurrency": "TRY",
      "toCurrency": "EUR",
      "rate": 0.0305,
      "rateDate": "2024-01-15T00:00:00Z",
      "source": "csv-import"
    }
  ],
  "skipped": [],
  "errors": []
}
```

---

## Vendor Portal

Dedicated endpoints for vendor users to access their information.

### Get Vendor Dashboard

```http
GET /vendor-portal/vendors/:vendorId/dashboard
```

**Response:**
```json
{
  "vendor": {
    "id": 1,
    "name": "Hotel Istanbul",
    "type": "HOTEL",
    "contactName": "John Manager",
    "email": "hotel@example.com"
  },
  "stats": {
    "activeBookings": 15,
    "upcomingBookings": 8,
    "payments": {
      "totalPayments": 45,
      "totalAmountTry": 125000,
      "totalPendingTry": 25000,
      "totalCompletedTry": 100000
    }
  }
}
```

### Get Vendor Bookings

```http
GET /vendor-portal/vendors/:vendorId/bookings?page=1&limit=20
```

Returns bookings that have items assigned to this vendor.

### Get Vendor Payments

```http
GET /vendor-portal/vendors/:vendorId/payments?page=1&limit=20
```

Returns payment history for this vendor.

### Get Vendor Payment Statistics

```http
GET /vendor-portal/vendors/:vendorId/payments/stats
```

**Response:**
```json
{
  "totalPayments": 45,
  "totalAmountTry": 125000,
  "totalPendingTry": 25000,
  "totalCompletedTry": 100000,
  "byStatus": [
    {
      "status": "COMPLETED",
      "count": 35,
      "totalTry": 100000
    },
    {
      "status": "PENDING",
      "count": 10,
      "totalTry": 25000
    }
  ]
}
```

---

## Webhooks

Payment webhooks (Priority 9) - Coming soon

---

## Best Practices

### API Usage
1. **Always use pagination** for list endpoints to avoid performance issues
2. **Use idempotency keys** for all payment operations to prevent duplicate charges
3. **Store file metadata** in your database after confirming uploads
4. **Implement exponential backoff** for retries on failed requests
5. **Cache health check results** (max 30 seconds) to reduce unnecessary requests
6. **Validate file sizes** on client-side before requesting upload URLs

### Security
7. **Respect rate limits** - Implement proper error handling for 429 responses
8. **Never log or expose** JWT tokens, refresh tokens, or password reset tokens
9. **Use strong passwords** that meet complexity requirements
10. **Rotate JWT secrets** periodically in production environments
11. **Validate CORS origins** - Only add trusted domains to CORS_ORIGIN
12. **Monitor failed login attempts** through audit logs

### GDPR Compliance
13. **Document data processing** - Keep records of what data you collect and why
14. **Implement data export** - Allow users to download their data via GDPR endpoints
15. **Respect deletion requests** - Use anonymization endpoints when clients request deletion
16. **Monitor retention policies** - Review GDPR compliance status regularly
17. **Audit data access** - Review audit logs for data export and deletion operations
18. **Inform users** - Provide clear privacy policies about data retention periods

### Business Logic
19. **Monitor audit logs** for security and compliance tracking
20. **Validate booking dates** - Ensure end date is after start date
21. **Check quotation status** - Prevent accepting quotations multiple times
22. **Verify payment amounts** - System prevents overpayments but validate on frontend too
23. **Handle active bookings** - Cannot anonymize clients with active bookings

### Performance
24. **Use search endpoints** for complex queries instead of fetching all records
25. **Leverage database indexes** - Filter queries use indexed columns where possible
26. **Batch operations** - Use bulk import endpoints where available (e.g., exchange rates)

---

## Bulk Import

Import multiple clients at once from CSV data.

### Bulk Import Clients

```http
POST /clients/bulk-import
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clients": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+905551234567",
      "nationality": "US"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+905557654321",
      "nationality": "UK"
    }
  ],
  "mode": "normal",
  "onDuplicateEmail": "skip"
}
```

**Access:** OWNER, ADMIN, AGENT

**Import Modes:**
- `normal` - Import with validation, continue on errors
- `atomic` - All or nothing (transaction)
- `dry-run` - Validate only, don't save

**Duplicate Handling:**
- `skip` - Skip duplicates, continue importing
- `update` - Update existing records
- `fail` - Fail entire import on duplicate

**Response:**
```json
{
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "skipped": 0
  },
  "successful": [
    {
      "id": 101,
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": 102,
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "failed": [],
  "skipped": []
}
```

**Validation:**
- Email format validated (RFC 5322)
- Phone format validated (E.164: +[country][number])
- Maximum 1000 clients per import
- Duplicate detection by email address

**CSV Import Example:**
```csv
name,email,phone,nationality
John Doe,john@example.com,+905551234567,US
Jane Smith,jane@example.com,+905557654321,UK
```

---

## Email Templates

Manage communication templates for automated emails.

### List Templates

```http
GET /email-templates
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "QUOTATION_SENT",
      "subject": "Your Tour Quotation from {{companyName}}",
      "bodyHtml": "<p>Dear {{customerName}},</p>...",
      "bodyText": "Dear {{customerName}},...",
      "variables": ["customerName", "companyName", "quotationCode"],
      "isActive": true
    }
  ]
}
```

### Create Template

```http
POST /email-templates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "BOOKING_CONFIRMED",
  "subject": "Booking Confirmation - {{bookingCode}}",
  "bodyHtml": "<h1>Booking Confirmed</h1><p>Dear {{customerName}},</p>...",
  "bodyText": "Booking Confirmed\n\nDear {{customerName}},...",
  "variables": ["customerName", "bookingCode", "startDate", "endDate"]
}
```

**Access:** OWNER, ADMIN

**Default Templates:**
- `QUOTATION_SENT` - Quotation sent to client
- `BOOKING_CONFIRMED` - Booking confirmation
- `PAYMENT_RECEIVED` - Payment receipt
- `PAYMENT_REMINDER` - Payment reminder
- `TOUR_REMINDER` - Upcoming tour reminder

**Supported Variables:**
- `{{customerName}}` - Client full name
- `{{companyName}}` - Your company name
- `{{bookingCode}}` - Booking reference code
- `{{quotationCode}}` - Quotation reference
- `{{amount}}` - Payment amount
- `{{startDate}}` - Tour start date
- `{{endDate}}` - Tour end date
- `{{dueDate}}` - Payment due date

### Update Template

```http
PATCH /email-templates/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "subject": "Updated Subject Line",
  "bodyHtml": "<p>Updated content</p>"
}
```

### Delete Template

```http
DELETE /email-templates/:id
Authorization: Bearer <access_token>
```

**Note:** Cannot delete system default templates, only custom ones.

---

## Consent Management

Manage GDPR consent for data processing, marketing, and analytics.

### Grant Consent

```http
POST /consent
Authorization: Bearer <access_token>
Content-Type: application/json
X-Forwarded-For: 192.168.1.100

{
  "clientId": 123,
  "purpose": "MARKETING_EMAIL",
  "version": "1.0"
}
```

**Consent Purposes:**
- `DATA_PROCESSING` - Core data processing for services
- `MARKETING_EMAIL` - Marketing communications via email
- `MARKETING_SMS` - Marketing communications via SMS
- `MARKETING_PHONE` - Marketing communications via phone
- `ANALYTICS` - Usage analytics and tracking
- `THIRD_PARTY_SHARING` - Sharing data with partners
- `PROFILING` - User profiling for personalization

**Response:**
```json
{
  "id": 456,
  "clientId": 123,
  "purpose": "MARKETING_EMAIL",
  "granted": true,
  "version": "1.0",
  "grantedAt": "2024-01-15T10:30:00.000Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

**Automatic Tracking:**
- IP address captured from request
- User agent captured from headers
- Timestamp automatically recorded
- Audit log created

### Bulk Grant Consent

```http
POST /consent/bulk-grant
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clientId": 123,
  "purposes": ["DATA_PROCESSING", "MARKETING_EMAIL", "ANALYTICS"],
  "version": "1.0"
}
```

### Revoke Consent

```http
DELETE /consent/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 456,
  "clientId": 123,
  "purpose": "MARKETING_EMAIL",
  "granted": false,
  "revokedAt": "2024-01-20T14:00:00.000Z"
}
```

### Get Client Consents

```http
GET /consent/client/:clientId
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "clientId": 123,
  "consents": [
    {
      "id": 456,
      "purpose": "MARKETING_EMAIL",
      "granted": true,
      "version": "1.0",
      "grantedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 457,
      "purpose": "DATA_PROCESSING",
      "granted": true,
      "version": "1.0",
      "grantedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "statistics": {
    "total": 2,
    "granted": 2,
    "revoked": 0
  }
}
```

### Check Consent

```http
GET /consent/check?clientId=123&purpose=MARKETING_EMAIL
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "hasConsent": true,
  "consent": {
    "id": 456,
    "purpose": "MARKETING_EMAIL",
    "granted": true,
    "version": "1.0"
  }
}
```

---

## Privacy Policy

Track privacy policy acceptance for GDPR compliance.

### Accept Privacy Policy

```http
POST /privacy-policy/accept
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "version": "1.0"
}
```

**Captures:**
- IP address from request
- User agent from headers
- Timestamp of acceptance
- User or client ID from JWT

**Response:**
```json
{
  "id": 789,
  "userId": 5,
  "version": "1.0",
  "acceptedAt": "2024-01-15T10:30:00.000Z",
  "ipAddress": "192.168.1.100"
}
```

### Get Latest Acceptance

```http
GET /privacy-policy/acceptance
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "userId": 5,
  "latestAcceptance": {
    "id": 789,
    "version": "1.0",
    "acceptedAt": "2024-01-15T10:30:00.000Z"
  },
  "currentVersion": "1.0",
  "requiresReAcceptance": false
}
```

### Check if Re-Acceptance Required

```http
GET /privacy-policy/requires-acceptance
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "required": false,
  "currentVersion": "1.0",
  "userAcceptedVersion": "1.0",
  "message": "User has accepted the latest privacy policy"
}
```

**Use Case:**
When privacy policy version changes, all users must re-accept before using certain features.

### Get Current Version

```http
GET /privacy-policy/current-version
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "version": "1.0",
  "effectiveDate": "2024-01-01T00:00:00.000Z"
}
```

### Get Acceptance History

```http
GET /privacy-policy/history
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "acceptances": [
    {
      "id": 789,
      "version": "1.0",
      "acceptedAt": "2024-01-15T10:30:00.000Z",
      "ipAddress": "192.168.1.100"
    },
    {
      "id": 788,
      "version": "0.9",
      "acceptedAt": "2023-12-01T09:00:00.000Z",
      "ipAddress": "192.168.1.99"
    }
  ]
}
```

---

## Enhanced Audit Logs

Extended audit logging with PII access tracking and GDPR compliance reports.

### PII Access Report

Get detailed report of who accessed personally identifiable information.

```http
GET /audit-logs/pii-access-report
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `startDate` (optional) - Filter from date (ISO 8601)
- `endDate` (optional) - Filter to date (ISO 8601)
- `userId` (optional) - Filter by specific user
- `entityType` (optional) - Filter by entity (Client, Vendor, User)
- `piiField` (optional) - Filter by field (passportNumber, taxId, etc.)

**Access:** OWNER, ADMIN

**Response:**
```json
{
  "period": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.000Z"
  },
  "summary": {
    "totalAccesses": 156,
    "uniqueUsers": 8,
    "piiFieldsAccessed": {
      "passportNumber": 45,
      "taxId": 32,
      "dateOfBirth": 79
    }
  },
  "accesses": [
    {
      "id": 1001,
      "timestamp": "2024-01-15T14:30:00.000Z",
      "user": {
        "id": 5,
        "name": "John Agent",
        "email": "agent@example.com",
        "role": "AGENT"
      },
      "action": "PII_ACCESSED",
      "entityType": "Client",
      "entityId": 123,
      "piiFields": ["passportNumber", "dateOfBirth"],
      "endpoint": "/api/v1/clients/123",
      "method": "GET",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 156
  }
}
```

**PII Fields Tracked:**
- `passportNumber` - Passport number
- `taxId` - Tax identification number
- `dateOfBirth` - Date of birth
- `ssn` - Social security number
- `creditCard` - Credit card information
- `bankAccount` - Bank account details
- `drivingLicense` - Driver's license number
- `nationalId` - National ID number
- `healthInfo` - Health-related information
- `biometric` - Biometric data
- `email` - Personal email addresses
- `phone` - Phone numbers

### GDPR Compliance Report

Get comprehensive GDPR compliance status and activity report.

```http
GET /audit-logs/gdpr-compliance-report
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `startDate` (optional) - Report period start
- `endDate` (optional) - Report period end

**Access:** OWNER, ADMIN

**Response:**
```json
{
  "period": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.000Z"
  },
  "dataExports": {
    "total": 12,
    "byType": {
      "USER": 5,
      "CLIENT": 7
    },
    "recent": [
      {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "userId": 5,
        "dataSubjectId": 123,
        "dataSubjectType": "CLIENT"
      }
    ]
  },
  "dataDeletions": {
    "total": 3,
    "clients": 2,
    "users": 1,
    "recent": [
      {
        "timestamp": "2024-01-10T14:00:00.000Z",
        "entityId": 45,
        "entityType": "Client",
        "method": "ANONYMIZED"
      }
    ]
  },
  "consentChanges": {
    "total": 89,
    "granted": 67,
    "revoked": 22,
    "byPurpose": {
      "MARKETING_EMAIL": 45,
      "MARKETING_SMS": 22,
      "ANALYTICS": 22
    }
  },
  "piiAccesses": {
    "total": 156,
    "uniqueUsers": 8,
    "topAccessedFields": [
      { "field": "dateOfBirth", "count": 79 },
      { "field": "passportNumber", "count": 45 },
      { "field": "taxId", "count": 32 }
    ]
  },
  "retentionCompliance": {
    "clientsArchived": 5,
    "auditLogsDeleted": 1250,
    "leadsDeleted": 34
  },
  "complianceScore": {
    "overall": 95,
    "breakdown": {
      "dataExport": 100,
      "consentManagement": 98,
      "auditLogging": 95,
      "dataRetention": 90,
      "encryption": 92
    }
  }
}
```

---

## Field-Level Encryption

Sensitive data is encrypted at rest using AES-256-GCM encryption.

### Encrypted Fields

The following fields are automatically encrypted:

**Client Model:**
- `passportNumber` - Passport identification
- `taxId` - Tax identification number
- `bankAccount` - Bank account details (if provided)

**Vendor Model:**
- `taxId` - Tax identification number

**Encryption Details:**
- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key Management:** Environment variable `ENCRYPTION_KEY`
- **Format:** `iv:authTag:encryptedData` (hex encoded)
- **Automatic:** Encryption/decryption handled transparently by API

### How It Works

**On Write (Create/Update):**
```http
POST /clients
Content-Type: application/json

{
  "name": "John Doe",
  "passportNumber": "AB123456",  // Plain text input
  "taxId": "123-45-6789"
}
```

**Stored in Database:**
```
passportNumber: "a1b2c3d4:e5f6g7h8:9i0j1k2l..."  // Encrypted
taxId: "d4c3b2a1:8h7g6f5e:l2k1j0i9..."
```

**On Read (Get):**
```http
GET /clients/123
```

**Response:**
```json
{
  "id": 123,
  "name": "John Doe",
  "passportNumber": "AB123456",  // Automatically decrypted
  "taxId": "123-45-6789"
}
```

### Migration of Existing Data

For existing unencrypted data, run the migration script:

```bash
npx ts-node src/scripts/encrypt-existing-data.ts
```

**What It Does:**
- Detects unencrypted fields (no `:` separator)
- Encrypts them with current ENCRYPTION_KEY
- Idempotent - safe to run multiple times
- Logs progress and errors

**Backward Compatibility:**
- API automatically detects encrypted vs unencrypted data
- Gracefully handles mixed states during migration
- No API changes required

### Security Considerations

**Key Management:**
- Store `ENCRYPTION_KEY` securely (e.g., AWS Secrets Manager, HashiCorp Vault)
- Minimum 32 characters required
- Rotate keys periodically (requires re-encryption)
- Never commit keys to version control

**Performance:**
- Encryption overhead: ~1-2ms per field
- Decryption overhead: ~1-2ms per field
- Minimal impact on API response times

---

## Performance & Caching

The API implements Redis caching for optimal performance.

### Cached Resources

**Exchange Rates** (TTL: 1 hour)
- Cache key: `exchange_rate:{tenantId}:{from}:{to}`
- Auto-invalidated on rate creation/update
- Fallback to database if cache miss

**Service Offerings** (TTL: 10 minutes)
- Cache key: `service_offerings:{tenantId}:{filters...}`
- Auto-invalidated on create/update/delete
- Reduces catalog loading time by 98%

**Cache Status:**
Check cache health via health endpoint:
```http
GET /health/readyz
```

**Response:**
```json
{
  "status": "ready",
  "checks": {
    "database": "connected",
    "cache": "connected"  // or "unavailable (using fallback)"
  }
}
```

**Cache Behavior:**
- **Redis Available:** Fast in-memory caching
- **Redis Unavailable:** Automatic fallback to in-memory cache
- **No Configuration Required:** Works out of the box

---

## Performance Optimizations

### Connection Pooling

Database connections are pooled for optimal performance:

**Configuration:**
```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

**Settings:**
- Maximum connections: 10
- Pool timeout: 20 seconds
- Minimum connections: 2

### Query Timeouts

All database queries have a 30-second timeout to prevent runaway queries:

**Automatic Behavior:**
- Queries exceeding 30s are automatically cancelled
- Logs slow queries (>1 second) in development
- Returns 408 Request Timeout error

### Slow Query Logging

In development mode, queries taking >1 second are logged:

```
[SLOW QUERY] 1.234s - SELECT * FROM bookings WHERE...
```

**Production:** Slow query logging disabled for performance.

---

## Rate Management

Complete CRUD operations for managing rates across all service types.

### Hotel Room Rates

Manage seasonal rates for hotel rooms with board type support.

#### List Hotel Room Rates

```http
GET /hotel-room-rates?serviceOfferingId=1
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `serviceOfferingId` (optional) - Filter by service offering
- `isActive` (optional) - Filter by active status
- `boardType` (optional) - Filter by board type (BB, HB, FB, AI)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "tenantId": 1,
      "serviceOfferingId": 5,
      "boardType": "BB",
      "seasonFrom": "2025-01-01",
      "seasonTo": "2025-03-31",
      "pricePerRoomNight": 120.00,
      "currencyCode": "EUR",
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Create Hotel Room Rate

```http
POST /hotel-room-rates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceOfferingId": 5,
  "boardType": "BB",
  "seasonFrom": "2025-04-01",
  "seasonTo": "2025-06-30",
  "pricePerRoomNight": 150.00,
  "currencyCode": "EUR"
}
```

**Validation:**
- Prevents overlapping seasons for same service offering + board type
- Returns 409 Conflict if overlap detected

**Error Response (Overlap):**
```json
{
  "statusCode": 409,
  "message": "Rate season overlaps with existing rate (2025-01-01 - 2025-03-31)",
  "error": "Conflict"
}
```

---

### Transfer Rates

Manage rates for transfer services.

#### Create Transfer Rate

```http
POST /transfer-rates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceOfferingId": 10,
  "seasonFrom": "2025-01-01",
  "seasonTo": "2025-12-31",
  "pricePerTransfer": 50.00,
  "pricePerKm": 1.50,
  "includedKm": 20,
  "currencyCode": "EUR"
}
```

**Fields:**
- `pricePerTransfer` - Fixed price per transfer
- `pricePerKm` - Price per kilometer (if using km-based pricing)
- `includedKm` - Kilometers included in base price

---

### Vehicle Hire Rates

Manage daily rates for vehicle rentals.

#### Create Vehicle Rate

```http
POST /vehicle-rates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceOfferingId": 15,
  "seasonFrom": "2025-01-01",
  "seasonTo": "2025-12-31",
  "pricePerDay": 80.00,
  "currencyCode": "EUR"
}
```

---

### Guide Service Rates

Manage hourly/daily rates for tour guides.

#### Create Guide Rate

```http
POST /guide-rates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceOfferingId": 20,
  "seasonFrom": "2025-01-01",
  "seasonTo": "2025-12-31",
  "pricePerHour": 25.00,
  "pricePerDay": 180.00,
  "languageSurcharge": 10.00,
  "currencyCode": "EUR"
}
```

**Fields:**
- `pricePerHour` - Hourly rate (optional)
- `pricePerDay` - Daily rate (optional)
- `languageSurcharge` - Additional charge for special languages

---

### Activity Rates

Manage per-person rates for activities and tours.

#### Create Activity Rate

```http
POST /activity-rates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceOfferingId": 25,
  "seasonFrom": "2025-01-01",
  "seasonTo": "2025-12-31",
  "pricePerPerson": 45.00,
  "childDiscount": 15.00,
  "groupDiscount": 10.00,
  "currencyCode": "EUR"
}
```

**Fields:**
- `pricePerPerson` - Standard price per adult
- `childDiscount` - Discount amount for children
- `groupDiscount` - Discount for group bookings

---

### Rate Management Features

**Season Overlap Prevention:**
- System prevents creating overlapping rate seasons
- Each service offering can only have one active rate per date range
- Hotel rates check overlaps per board type separately

**Soft Delete:**
- Rates use `isActive` flag for soft deletion
- Deleted rates remain in database for audit purposes
- Can be restored by setting `isActive: true`

**Access Control:**
- OWNER, ADMIN: Full CRUD access
- OPERATIONS: Create and update rates
- AGENT, GUIDE, VENDOR: Read-only access

---

## Soft Delete Functionality

The API implements soft delete for critical entities to preserve data for audit and recovery.

### Supported Entities

Entities with soft delete support:
- Clients (`isActive` + `deletedAt`)
- Vendors (`isActive` + `deletedAt`)
- Leads (`deletedAt`)
- Tours (`isActive` + `deletedAt`)
- Service Offerings (`deletedAt`)
- All Rate types (`isActive`)

### How Soft Delete Works

**Delete Operation:**
```http
DELETE /clients/123
Authorization: Bearer <access_token>
```

**Database Result:**
- Record NOT removed from database
- `isActive` set to `false` (if applicable)
- `deletedAt` set to current timestamp
- Relationships preserved

**List Operations:**
All list endpoints automatically filter out soft-deleted records:

```http
GET /clients
```

Only returns records where:
- `deletedAt IS NULL` OR
- `isActive = true`

### Benefits

1. **Data Recovery**: Accidentally deleted records can be restored
2. **Audit Trail**: Complete history preserved
3. **Referential Integrity**: Foreign key relationships maintained
4. **Compliance**: Required for GDPR and financial regulations

### Restoration

To restore a soft-deleted record:

```http
PATCH /clients/123
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isActive": true,
  "deletedAt": null
}
```

**Note:** Restoration requires OWNER or ADMIN role.

---

## Client Activity Timeline

Get comprehensive activity history for a client.

### Get Client Timeline

```http
GET /clients/:clientId/timeline?limit=50
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional) - Number of timeline entries to return (default: 100, max: 500)

**Response:**
```json
{
  "timeline": [
    {
      "type": "PAYMENT",
      "date": "2024-11-01T10:30:00Z",
      "title": "Payment received: €500.00",
      "description": "Method: BANK_TRANSFER | Booking: BK-2024-001 | Status: COMPLETED",
      "data": {
        "id": 15,
        "amountEur": 500,
        "method": "BANK_TRANSFER",
        "paidAt": "2024-11-01T10:30:00Z",
        "status": "COMPLETED",
        "txnRef": "TXN-12345"
      }
    },
    {
      "type": "BOOKING",
      "date": "2024-10-28T14:20:00Z",
      "title": "Booking BK-2024-001 - CONFIRMED",
      "description": "2024-12-15 to 2024-12-20 | €1500.00",
      "data": {
        "id": 5,
        "bookingCode": "BK-2024-001",
        "status": "CONFIRMED",
        "startDate": "2024-12-15",
        "endDate": "2024-12-20",
        "totalSellEur": 1500
      }
    },
    {
      "type": "QUOTATION",
      "date": "2024-10-25T09:15:00Z",
      "title": "Quotation QT-2024-001 - ACCEPTED",
      "description": "Total: €1500.00",
      "data": {
        "id": 3,
        "code": "QT-2024-001",
        "status": "ACCEPTED",
        "totalSellEur": 1500
      }
    },
    {
      "type": "LEAD",
      "date": "2024-10-20T16:45:00Z",
      "title": "Lead created: WEBSITE",
      "description": "Looking for honeymoon package in Turkey",
      "data": {
        "id": 2,
        "source": "WEBSITE",
        "status": "CONVERTED",
        "notes": "Looking for honeymoon package in Turkey"
      }
    },
    {
      "type": "AUDIT",
      "date": "2024-10-20T16:45:00Z",
      "title": "CLIENT_CREATED",
      "description": "Client account created",
      "data": {
        "id": 100,
        "action": "CLIENT_CREATED",
        "entityType": "Client",
        "entityId": 1
      }
    }
  ],
  "total": 5,
  "clientId": 1
}
```

### Timeline Entry Types

| Type | Description | Data Source |
|------|-------------|-------------|
| `LEAD` | Lead inquiry created | Leads table |
| `QUOTATION` | Quotation sent/accepted/rejected | Quotations table |
| `BOOKING` | Booking created/confirmed/cancelled | Bookings table |
| `PAYMENT` | Payment received | Client Payments table |
| `AUDIT` | System audit events | Audit Logs table (last 50 only) |

### Timeline Features

**Chronological Order:**
- Entries sorted by date descending (most recent first)
- Each entry includes exact timestamp

**Comprehensive View:**
- Aggregates data from 5 different sources
- Shows complete customer journey
- Includes system audit events

**Performance:**
- Parallel data fetching for optimal speed
- Limited audit log entries (last 50) to prevent performance issues
- Configurable limit parameter

**Security:**
- JWT authentication required
- Tenant isolation enforced
- Only shows data for authorized client

### Use Cases

1. **Customer Service**: Quickly view entire customer history
2. **Sales**: Track lead-to-customer conversion journey
3. **Accounting**: See all payments and bookings at a glance
4. **Compliance**: Complete audit trail for GDPR requests

---

## Support

For detailed interactive documentation, visit the Swagger UI at:
```
http://localhost:3001/api/docs
```
