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

**Response:**
```json
{
  "id": 1,
  "status": "ACCEPTED",
  "message": "Quotation accepted successfully"
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
- If the key has been used before (within 24h), the cached response is returned
- If the key is new, the payment is created normally
- Keys expire after 24 hours

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
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tour_crm"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters-long"
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
CORS_ORIGIN="http://localhost:3000"
```

---

## Rate Limiting

Currently not implemented. Recommended for production:

- Authentication endpoints: 5 requests per minute
- File upload: 10 requests per minute
- General API: 100 requests per minute

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

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent (stub implementation)"
}
```

**Note:** Always returns success to prevent email enumeration. Reset token is logged to console (stub).

### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
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

1. **Always use pagination** for list endpoints
2. **Use idempotency keys** for all payment operations
3. **Store file metadata** in your database after confirming uploads
4. **Monitor audit logs** for security and compliance
5. **Implement exponential backoff** for retries
6. **Cache health check results** (max 30 seconds)
7. **Validate file sizes** on client-side before requesting upload URLs

---

## Support

For detailed interactive documentation, visit the Swagger UI at:
```
http://localhost:3001/api/docs
```
