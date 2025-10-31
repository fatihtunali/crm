# Tour Operator CRM - Frontend

Production-ready Next.js 14 (App Router) + TypeScript frontend for the Tour Operator CRM.

## Features

- 🔐 **JWT Authentication** with refresh token support
- 🌍 **Multi-tenant** with X-Tenant-Id header
- 🌐 **i18n** EN/TR with next-intl
- 🎨 **shadcn/ui** + Tailwind CSS
- 📊 **React Query** for data fetching
- 📝 **React Hook Form** + Zod validation
- 🎯 **RBAC** with role-based UI and API guards
- 💰 **Finance features**: Exchange rates, P&L calculation, idempotent payments
- 📁 **File management** with signed URLs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl
- **HTTP Client**: Axios
- **Date**: date-fns
- **Icons**: Lucide React

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Locale-specific routes
│   │   │   ├── (auth)/        # Auth pages (login, forgot-password, reset-password)
│   │   │   ├── (dashboard)/   # Protected pages with layout
│   │   │   │   ├── dashboard/
│   │   │   │   ├── leads/
│   │   │   │   ├── clients/
│   │   │   │   ├── vendors/
│   │   │   │   ├── tours/
│   │   │   │   ├── quotations/
│   │   │   │   ├── bookings/
│   │   │   │   ├── payments/
│   │   │   │   ├── invoices/
│   │   │   │   ├── reports/
│   │   │   │   ├── files/
│   │   │   │   ├── audit-logs/
│   │   │   │   ├── vendor-portal/
│   │   │   │   └── settings/
│   │   ├── layout.tsx         # Root layout
│   │   └── providers.tsx      # Query + i18n providers
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/           # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── data-table/       # Data table components
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── data-table-filters.tsx
│   │   ├── forms/            # Form components
│   │   │   ├── currency-field.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   └── combobox.tsx
│   │   └── common/           # Common components
│   │       ├── status-badge.tsx
│   │       ├── pdf-link.tsx
│   │       ├── upload-button.tsx
│   │       └── confirm-dialog.tsx
│   │
│   ├── lib/                   # Core utilities
│   │   ├── api/              # API client
│   │   │   ├── client.ts     # Axios instance with interceptors
│   │   │   ├── types.ts      # API type definitions
│   │   │   ├── endpoints/    # API endpoint functions
│   │   │   │   ├── auth.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── clients.ts
│   │   │   │   ├── leads.ts
│   │   │   │   ├── quotations.ts
│   │   │   │   ├── bookings.ts
│   │   │   │   └── ...
│   │   │   └── hooks/        # React Query hooks
│   │   │       ├── use-auth.ts
│   │   │       ├── use-leads.ts
│   │   │       ├── use-quotations.ts
│   │   │       └── ...
│   │   ├── auth/             # Authentication
│   │   │   ├── auth-context.tsx
│   │   │   ├── auth-guard.tsx
│   │   │   └── rbac-guard.tsx
│   │   ├── utils/            # Utilities
│   │   │   ├── cn.ts         # Class name utility
│   │   │   ├── currency.ts   # Currency formatting
│   │   │   ├── date.ts       # Date formatting
│   │   │   └── validators.ts # Zod schemas
│   │   └── constants.ts      # App constants
│   │
│   └── messages/             # i18n messages
│       ├── en.json          # English translations
│       └── tr.json          # Turkish translations
│
├── public/                   # Static assets
├── .env.local.example       # Environment variables template
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Getting Started

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

### 3. Run Development Server

```bash
npm dev
```

The app will be available at `http://localhost:3000`.

## Key Implementation Patterns

### API Client

```typescript
// lib/api/client.ts
- Axios instance with interceptors
- Auto-inject: Authorization, X-Tenant-Id, Accept-Language
- Idempotency-Key for payments
- Token refresh on 401
- Error handling with toast notifications
```

### Authentication Flow

```typescript
// Login → Store token → Redirect to dashboard
// Auto-refresh token on 401
// Logout → Clear token → Redirect to login
// Auth guard on protected routes
```

### RBAC Pattern

```typescript
// Decode JWT to get user roles
// Hide/disable actions based on roles
// Guard API calls
// Example: Only ACCOUNTING can create invoices
```

### Data Fetching

```typescript
// React Query for all API calls
// No retries for POST/PUT/DELETE
// Optimistic UI only for non-financial operations
// Cache invalidation after mutations
```

### Forms

```typescript
// React Hook Form + Zod
// Field-level validation
// Map API errors to form fields
// Currency fields with proper formatting
```

### Idempotent Payments

```typescript
// Generate UUID v4 as Idempotency-Key
// Include in header for client/vendor payments
// Same key = same result, no duplicate
```

## Core Features Implementation

### 1. Quotation → Booking Flow

```typescript
// Create quotation (DRAFT)
// Send quotation (DRAFT → SENT)
// Accept quotation (SENT → ACCEPTED):
//   - Creates booking
//   - Locks exchange rate
//   - Copies items to booking-items
//   - Shows confirmation with locked rate
```

### 2. P&L Calculation

```typescript
// GET /bookings/:id/pnl
// Display: revenue, cost, profit/loss, margin %
// Formula: sum(item.unit_price_eur*qty) − (sum(item.unit_cost_try*qty) / locked_exchange_rate)
```

### 3. Soft Delete Handling

```typescript
// Default: exclude inactive records
// Toggle: "Show inactive" to include them
// Query param: ?include=inactive
```

### 4. File Upload

```typescript
// 1. Request signed URL: POST /files/upload-url
// 2. Upload file to signed URL
// 3. Confirm upload: POST /files/:id/confirm
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Build

```bash
# Build for production
npm build

# Start production server
npm start
```

## Implementation Status

### ✅ Completed
- Project structure and configuration
- Package dependencies
- TypeScript + Tailwind + Next.js setup

### 🚧 To Implement
1. **API Client** (`src/lib/api/`)
   - Axios instance with interceptors
   - Type definitions from OpenAPI
   - Endpoint functions for all resources
   - React Query hooks

2. **Authentication** (`src/lib/auth/`)
   - Auth context and hooks
   - Auth guard component
   - RBAC guard component
   - Token management

3. **i18n** (`src/messages/`)
   - English translations (en.json)
   - Turkish translations (tr.json)
   - next-intl configuration

4. **UI Components** (`src/components/ui/`)
   - Install shadcn/ui components
   - Custom components (DataTable, CurrencyField, etc.)

5. **Pages** (`src/app/[locale]/`)
   - Auth pages (login, forgot-password, reset-password)
   - Dashboard
   - CRUD pages (leads, clients, vendors, tours)
   - Quotations workflow
   - Bookings with P&L
   - Payments (idempotent)
   - Invoices with PDF links
   - Reports
   - Files
   - Settings
   - Vendor Portal

6. **Layout** (`src/components/layout/`)
   - Sidebar with role-aware navigation
   - Topbar with tenant info and user menu
   - Breadcrumbs

## Next Steps

The foundation is ready! Start by:

1. **Install dependencies**: `pnpm install`
2. **Set up shadcn/ui**: `pnpm dlx shadcn-ui@latest init`
3. **Create API client** following the pattern in this README
4. **Build authentication** pages and guards
5. **Implement pages** one by one using the patterns

Refer to the backend API documentation at `http://localhost:3001/api/docs` for endpoint details.

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [next-intl Documentation](https://next-intl-docs.vercel.app)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
