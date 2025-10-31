# Tour Operator CRM - Multi-Tenant SaaS Platform

A production-ready, multi-tenant Tour Operator CRM system designed for Turkish tourism agencies. Built with modern technologies and designed to handle complex tour operations including FIT, group tours, and day-trips.

## Features

- **Multi-Tenancy**: Complete data isolation per agency/tenant
- **Dual Currency**: Vendor costs in TRY, client invoices in EUR with locked exchange rates
- **Full Tour Workflow**: Lead → Inquiry → Quotation → Booking → Payments → Invoices
- **Role-Based Access Control**: OWNER, ADMIN, AGENT, OPERATIONS, ACCOUNTING, GUIDE, VENDOR
- **Internationalization**: English and Turkish UI (i18n ready)
- **Invoice Generation**: PDF invoices with VAT/KDV support
- **Audit Trail**: Complete logging of sensitive changes

## Tech Stack

### Backend
- **NestJS** - Enterprise Node.js framework
- **TypeScript** - Type-safe development
- **MySQL** - Relational database
- **Prisma** - Type-safe ORM with migrations
- **JWT** - Authentication with refresh tokens
- **Swagger/OpenAPI** - API documentation
- **Argon2** - Secure password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe UI
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Hook Form + Zod** - Type-safe form validation
- **next-intl** - Internationalization (EN/TR)

### Infrastructure
- **Docker Compose** - Local development environment
- **Redis** - Caching and queues (optional)
- **Vitest** - Unit testing
- **ESLint + Prettier** - Code quality
- **Husky** - Git hooks

## Project Structure

```
tour-operator-crm/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared types & utilities
├── docs/
│   ├── ERD.md       # Database diagram
│   ├── schema.sql   # MySQL DDL
│   └── DEPLOY.md    # Deployment guide
├── scripts/          # Utility scripts
├── docker-compose.yml
└── package.json     # Monorepo config
```

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & **Docker Compose**

### 1. Clone & Install

```bash
git clone <repository-url>
cd tour-operator-crm
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Infrastructure

```bash
# Start MySQL, Redis, and Adminer
npm run docker:up

# Check services are running
docker-compose ps
```

Access Adminer (database UI): http://localhost:8080
- Server: `mysql`
- Username: `tourcrm`
- Password: `tourcrm123`
- Database: `tour_crm`

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data
npm run seed
```

### 5. Start Development Servers

```bash
# Start both API and Web concurrently
npm run dev

# Or start separately:
npm run dev:api  # API on http://localhost:3001
npm run dev:web  # Web on http://localhost:3000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs** (Swagger): http://localhost:3001/api/docs

**Demo Login:**
- Email: `admin@tourcrm.com`
- Password: `Admin123!`

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=packages/shared

# Watch mode
npm run test:watch --workspace=packages/shared
```

### Code Quality

```bash
# Lint all workspaces
npm run lint

# Format code
npm run format
```

### Database Commands

```bash
# Create a new migration
npm run prisma:migrate --workspace=apps/api

# Studio (GUI for database)
npm run prisma:studio --workspace=apps/api

# Reset database (WARNING: deletes all data)
npm run prisma:reset --workspace=apps/api
```

## Business Logic

### Currency Management

The system handles dual-currency operations:

1. **Vendor Costs**: Stored in TRY (Turkish Lira)
2. **Client Prices**: Stored in EUR (Euro)
3. **Exchange Rates**: Tracked daily in `exchange_rates` table
4. **Rate Locking**: When a quotation becomes a booking, the exchange rate is frozen

**Critical Rule**: The `locked_exchange_rate` on bookings ensures accounting accuracy even if exchange rates change.

### Pricing Flow

```typescript
// From packages/shared/src/utils/currency.ts

// 1. Get exchange rate for booking date
const rate = selectRateByDate(rates, bookingDate);

// 2. Calculate sell price with markup
const sellPriceEur = priceFromCost(costTry, markupPct, rate);

// 3. Calculate margin
const margin = calculateMargin(sellPriceEur, costTry, rate);
```

### Workflow States

**Lead** → **Quotation** → **Booking** → **Invoice**

1. **Lead**: Initial inquiry (NEW → CONTACTED → QUOTED → WON/LOST)
2. **Quotation**: Price proposal (DRAFT → SENT → ACCEPTED/REJECTED)
3. **Booking**: Confirmed reservation (PENDING → CONFIRMED → COMPLETED/CANCELLED)
4. **Invoice**: Official document with VAT

## Multi-Tenancy

Every business entity has `tenant_id`. All queries are automatically scoped:

```typescript
// Backend guard ensures tenant isolation
@UseGuards(TenantScopedGuard)
@Get()
findAll(@TenantId() tenantId: number) {
  return this.service.findAll(tenantId);
}
```

## API Documentation

Once the API is running, visit http://localhost:3001/api/docs for interactive Swagger documentation.

### Key Endpoints

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/clients` - List clients
- `POST /api/v1/quotations` - Create quotation
- `POST /api/v1/quotations/:id/accept` - Accept → Booking
- `POST /api/v1/bookings/:id/payments` - Record payment
- `GET /api/v1/invoices/:id/pdf` - Download invoice PDF

## Internationalization

The system supports English and Turkish:

```typescript
// In Next.js components
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

Translation files: `apps/web/messages/en.json` and `apps/web/messages/tr.json`

## Security

- **Passwords**: Hashed with Argon2
- **JWT**: Access tokens (24h) + Refresh tokens (7d)
- **RBAC**: Role-based permissions on all endpoints
- **Tenant Isolation**: Enforced at database query level
- **Audit Logs**: All sensitive changes tracked
- **Input Validation**: Zod schemas on all DTOs

## Deployment

See [DEPLOY.md](docs/DEPLOY.md) for production deployment guide.

## Testing

Unit tests focus on critical business logic:

```bash
# Currency calculations
npm test --workspace=packages/shared

# Backend services
npm test --workspace=apps/api

# E2E tests
npm run test:e2e --workspace=apps/api
```

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run lint && npm test`
4. Submit pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ for Turkish Tourism Industry**
