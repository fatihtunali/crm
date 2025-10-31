# Tour Operator CRM - Frontend Implementation Plan

## Overview
Complete step-by-step guide to build the production-ready Next.js frontend.

---

## Phase 1: Foundation Setup (Infrastructure)
**Goal**: Get the project running with basic structure

### Step 1.1: Install Dependencies & Initialize Project
```bash
cd apps/web
pnpm install
pnpm dlx shadcn-ui@latest init
```

**shadcn/ui init prompts:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Step 1.2: Create Base File Structure
```
src/
├── app/
│   ├── [locale]/
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── lib/
│   └── utils.ts
└── components/
    └── ui/
```

### Step 1.3: Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

**Files to create:**
- ✅ `src/app/globals.css` - Global styles with CSS variables
- ✅ `src/lib/utils.ts` - cn() utility for class names
- ✅ `src/app/layout.tsx` - Root layout
- ✅ `src/app/providers.tsx` - React Query + i18n providers

---

## Phase 2: API Client & Authentication
**Goal**: Connect to backend and handle auth

### Step 2.1: API Client Infrastructure
**Files to create:**
1. ✅ `src/lib/api/client.ts` - Axios instance with interceptors
2. ✅ `src/lib/api/types.ts` - TypeScript interfaces for API responses
3. ✅ `src/lib/api/endpoints/auth.ts` - Auth endpoints
4. ✅ `src/lib/api/hooks/use-auth.ts` - React Query hooks for auth

**Features:**
- Auto-inject headers (Authorization, X-Tenant-Id, Accept-Language)
- Token refresh on 401
- Error handling with toasts
- Idempotency-Key for payments

### Step 2.2: Authentication System
**Files to create:**
1. ✅ `src/lib/auth/auth-context.tsx` - Auth state management
2. ✅ `src/lib/auth/auth-guard.tsx` - Protected route guard
3. ✅ `src/lib/auth/rbac.ts` - Role-based access control utilities
4. ✅ `src/lib/auth/token-storage.ts` - Token storage helpers

**Features:**
- Login/logout flow
- Token storage (localStorage)
- Auto-redirect on unauthorized
- Role checking

### Step 2.3: i18n Setup
**Files to create:**
1. ✅ `src/i18n.ts` - next-intl configuration
2. ✅ `src/messages/en.json` - English translations
3. ✅ `src/messages/tr.json` - Turkish translations
4. ✅ `src/middleware.ts` - Locale detection

**Translation categories:**
- Navigation
- Actions (create, edit, delete, send, accept, reject)
- Statuses (DRAFT, SENT, ACCEPTED, PENDING, etc.)
- Validation messages
- Finance terms (quotation, booking, invoice, payment, P&L, etc.)

---

## Phase 3: UI Components Library
**Goal**: Build reusable component library

### Step 3.1: Install shadcn/ui Components
```bash
pnpm dlx shadcn-ui@latest add button input form label select dialog dropdown-menu table tabs toast separator card badge
```

### Step 3.2: Custom Form Components
**Files to create:**
1. ✅ `src/components/forms/currency-field.tsx` - TRY/EUR input
2. ✅ `src/components/forms/date-range-picker.tsx` - Date range selector
3. ✅ `src/components/forms/combobox.tsx` - Searchable select for clients/vendors/tours
4. ✅ `src/components/forms/form-error.tsx` - Display field errors

**Features:**
- Currency formatting (Intl.NumberFormat)
- Validation with Zod
- Accessibility

### Step 3.3: Data Display Components
**Files to create:**
1. ✅ `src/components/data-table/data-table.tsx` - Server-side paginated table
2. ✅ `src/components/data-table/data-table-pagination.tsx` - Pagination controls
3. ✅ `src/components/data-table/data-table-toolbar.tsx` - Filters and search
4. ✅ `src/components/common/status-badge.tsx` - Status pills (DRAFT, SENT, etc.)
5. ✅ `src/components/common/pdf-link.tsx` - PDF download button
6. ✅ `src/components/common/confirm-dialog.tsx` - Delete confirmation

### Step 3.4: Layout Components
**Files to create:**
1. ✅ `src/components/layout/sidebar.tsx` - Role-aware navigation
2. ✅ `src/components/layout/topbar.tsx` - User menu + language switcher
3. ✅ `src/components/layout/breadcrumbs.tsx` - Page breadcrumbs
4. ✅ `src/components/layout/dashboard-layout.tsx` - Main layout wrapper

---

## Phase 4: Authentication Pages
**Goal**: Login, forgot password, reset password

### Step 4.1: Login Page
**Files to create:**
1. ✅ `src/app/[locale]/(auth)/login/page.tsx` - Login page
2. ✅ `src/app/[locale]/(auth)/layout.tsx` - Auth layout (centered card)
3. ✅ `src/lib/validators/auth.ts` - Zod schemas for auth forms

**Features:**
- Email + password form
- Remember me checkbox
- Link to forgot password
- Redirect to dashboard on success
- Show validation errors

### Step 4.2: Password Reset Flow
**Files to create:**
1. ✅ `src/app/[locale]/(auth)/forgot-password/page.tsx` - Request reset
2. ✅ `src/app/[locale]/(auth)/reset-password/page.tsx` - Reset with token

**Features:**
- Email input for forgot password
- Token + new password for reset
- Success/error messages
- Redirect to login

---

## Phase 5: Dashboard & Main Layout
**Goal**: Protected area with navigation

### Step 5.1: Dashboard Page
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/layout.tsx` - Dashboard layout with sidebar
2. ✅ `src/app/[locale]/(dashboard)/dashboard/page.tsx` - Dashboard home
3. ✅ `src/lib/api/endpoints/reports.ts` - Stats endpoints
4. ✅ `src/lib/api/hooks/use-stats.ts` - Dashboard stats hooks

**Features:**
- KPI cards (total leads, bookings, revenue)
- Recent activity
- Charts (optional)
- Role-based widgets

---

## Phase 6: Core CRUD Pages
**Goal**: Leads, Clients, Vendors, Tours

### Step 6.1: Leads Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/leads/page.tsx` - Leads list
2. ✅ `src/app/[locale]/(dashboard)/leads/[id]/page.tsx` - Lead detail
3. ✅ `src/components/leads/lead-form.tsx` - Create/edit form
4. ✅ `src/lib/api/endpoints/leads.ts` - Lead API functions
5. ✅ `src/lib/api/hooks/use-leads.ts` - React Query hooks
6. ✅ `src/lib/validators/leads.ts` - Zod schemas

**Features:**
- List with filters (status, date range)
- Search by client name
- Create modal
- Edit modal
- Delete with confirmation
- Link to create quotation

### Step 6.2: Clients Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/clients/page.tsx` - Clients list
2. ✅ `src/app/[locale]/(dashboard)/clients/[id]/page.tsx` - Client detail
3. ✅ `src/components/clients/client-form.tsx` - Create/edit form
4. ✅ `src/lib/api/endpoints/clients.ts` - Client API functions
5. ✅ `src/lib/api/hooks/use-clients.ts` - React Query hooks
6. ✅ `src/lib/validators/clients.ts` - Zod schemas

**Features:**
- List with search
- Full CRUD
- Related leads and bookings
- Passport info

### Step 6.3: Vendors Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/vendors/page.tsx` - Vendors list with ?include=inactive
2. ✅ `src/app/[locale]/(dashboard)/vendors/[id]/page.tsx` - Vendor detail with tabs
3. ✅ `src/app/[locale]/(dashboard)/vendors/[id]/rates/page.tsx` - Vendor rates
4. ✅ `src/components/vendors/vendor-form.tsx` - Create/edit form
5. ✅ `src/components/vendors/rate-form.tsx` - Rate form
6. ✅ `src/lib/api/endpoints/vendors.ts` - Vendor API functions
7. ✅ `src/lib/api/hooks/use-vendors.ts` - React Query hooks

**Features:**
- Soft delete handling
- "Show inactive" toggle
- Vendor rates with seasonality
- Type filter (HOTEL, GUIDE, TRANSPORT, etc.)

### Step 6.4: Tours Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/tours/page.tsx` - Tours list
2. ✅ `src/app/[locale]/(dashboard)/tours/[id]/page.tsx` - Tour detail with itinerary
3. ✅ `src/components/tours/tour-form.tsx` - Create/edit form
4. ✅ `src/components/tours/itinerary-builder.tsx` - Day-by-day builder
5. ✅ `src/lib/api/endpoints/tours.ts` - Tour API functions
6. ✅ `src/lib/api/hooks/use-tours.ts` - React Query hooks

**Features:**
- Tour code, name, description
- Itinerary (day-by-day activities)
- Soft delete handling

---

## Phase 7: Quotations & Workflow
**Goal**: Quotation lifecycle (DRAFT → SENT → ACCEPTED)

### Step 7.1: Quotations Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/quotations/page.tsx` - Quotations list
2. ✅ `src/app/[locale]/(dashboard)/quotations/[id]/page.tsx` - Quotation detail
3. ✅ `src/components/quotations/quotation-form.tsx` - Create/edit form
4. ✅ `src/components/quotations/quotation-items-builder.tsx` - Items builder
5. ✅ `src/components/quotations/send-dialog.tsx` - Send confirmation
6. ✅ `src/components/quotations/accept-dialog.tsx` - Accept confirmation
7. ✅ `src/lib/api/endpoints/quotations.ts` - Quotation API functions
8. ✅ `src/lib/api/hooks/use-quotations.ts` - React Query hooks

**Features:**
- Create from lead or standalone
- Tour selection or custom itinerary
- Items with vendor rates (TRY)
- Calculate sell price (EUR) using latest exchange rate
- Send (DRAFT → SENT) with email preview stub
- Accept (SENT → ACCEPTED) - creates booking
- Reject (SENT → REJECTED)
- Status badges

---

## Phase 8: Bookings & P&L
**Goal**: Booking management with P&L calculation

### Step 8.1: Bookings Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/bookings/page.tsx` - Bookings list
2. ✅ `src/app/[locale]/(dashboard)/bookings/[id]/page.tsx` - Booking detail with tabs
3. ✅ `src/components/bookings/booking-items-tab.tsx` - Items CRUD (OPERATIONS only)
4. ✅ `src/components/bookings/payments-tab.tsx` - Client & vendor payments
5. ✅ `src/components/bookings/pnl-tab.tsx` - P&L display
6. ✅ `src/components/bookings/files-tab.tsx` - Attached files
7. ✅ `src/lib/api/endpoints/bookings.ts` - Booking API functions
8. ✅ `src/lib/api/hooks/use-bookings.ts` - React Query hooks

**Features:**
- Created from accepted quotation
- Show locked_exchange_rate
- Tabs: Summary, Items, Payments, P&L, Files
- Items CRUD (role: OPERATIONS)
- P&L calculation display
- Invoice creation (role: ACCOUNTING)

### Step 8.2: Booking Items (OPERATIONS role)
**Files to create:**
1. ✅ `src/components/booking-items/item-form.tsx` - Create/edit booking item
2. ✅ `src/lib/api/endpoints/booking-items.ts` - Booking items API
3. ✅ `src/lib/api/hooks/use-booking-items.ts` - Hooks

**Features:**
- Add/edit/delete items
- unit_cost_try, unit_price_eur, qty
- Vendor selection
- Item type (HOTEL, GUIDE, TRANSPORT, etc.)

---

## Phase 9: Payments (Idempotent)
**Goal**: Client (EUR) and Vendor (TRY) payments

### Step 9.1: Client Payments
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/payments/client/page.tsx` - Client payments list
2. ✅ `src/components/payments/client-payment-form.tsx` - Record payment (EUR)
3. ✅ `src/lib/api/endpoints/payment-client.ts` - Client payment API
4. ✅ `src/lib/api/hooks/use-client-payments.ts` - Hooks

**Features:**
- Idempotency-Key header (UUID v4)
- EUR only
- Payment method (BANK_TRANSFER, CREDIT_CARD, CASH)
- Link to booking

### Step 9.2: Vendor Payments
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/payments/vendor/page.tsx` - Vendor payments list
2. ✅ `src/components/payments/vendor-payment-form.tsx` - Record payment (TRY)
3. ✅ `src/lib/api/endpoints/payment-vendor.ts` - Vendor payment API
4. ✅ `src/lib/api/hooks/use-vendor-payments.ts` - Hooks

**Features:**
- Idempotency-Key header (UUID v4)
- TRY only
- Due date and paid date
- Link to vendor and booking

---

## Phase 10: Invoices & PDF
**Goal**: Invoice generation with PDF download

### Step 10.1: Invoices Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/invoices/page.tsx` - Invoices list
2. ✅ `src/app/[locale]/(dashboard)/invoices/[id]/page.tsx` - Invoice detail
3. ✅ `src/components/invoices/invoice-form.tsx` - Create invoice (ACCOUNTING only)
4. ✅ `src/lib/api/endpoints/invoices.ts` - Invoice API functions
5. ✅ `src/lib/api/hooks/use-invoices.ts` - React Query hooks

**Features:**
- Create invoice for booking (role: ACCOUNTING)
- Invoice number auto-generated
- EUR currency
- PDF download link (opens in new tab)

---

## Phase 11: Reports
**Goal**: P&L, Revenue, Leads reports

### Step 11.1: Reports Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/reports/pnl/page.tsx` - P&L report
2. ✅ `src/app/[locale]/(dashboard)/reports/revenue/page.tsx` - Revenue report
3. ✅ `src/app/[locale]/(dashboard)/reports/leads/page.tsx` - Leads funnel
4. ✅ `src/components/reports/report-filters.tsx` - Date range + filters
5. ✅ `src/components/reports/export-button.tsx` - CSV export
6. ✅ `src/lib/api/endpoints/reports.ts` - Reports API functions
7. ✅ `src/lib/api/hooks/use-reports.ts` - Hooks

**Features:**
- Date range picker
- Destination filter
- CSV export
- Charts (optional)

---

## Phase 12: Files & Uploads
**Goal**: File management with signed URLs

### Step 12.1: Files Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/files/page.tsx` - Files list
2. ✅ `src/components/files/upload-button.tsx` - Signed URL upload
3. ✅ `src/components/files/file-preview.tsx` - Image/PDF preview
4. ✅ `src/lib/api/endpoints/files.ts` - Files API functions
5. ✅ `src/lib/api/hooks/use-files.ts` - Hooks

**Features:**
- Request signed upload URL
- Upload file to S3/storage
- Confirm upload
- Download signed URL
- Preview safe mime types

---

## Phase 13: Settings
**Goal**: User profile and exchange rates

### Step 13.1: Settings Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/settings/profile/page.tsx` - Edit profile (/auth/me)
2. ✅ `src/app/[locale]/(dashboard)/settings/exchange-rates/page.tsx` - Exchange rates
3. ✅ `src/components/settings/profile-form.tsx` - Update profile
4. ✅ `src/components/settings/exchange-rate-form.tsx` - Add rate
5. ✅ `src/components/settings/exchange-rate-import.tsx` - CSV import
6. ✅ `src/lib/api/endpoints/exchange-rates.ts` - Exchange rates API
7. ✅ `src/lib/api/hooks/use-exchange-rates.ts` - Hooks

**Features:**
- Update name, email, language
- Change password link
- Exchange rates CRUD
- CSV import
- Get latest rate for currency pair

---

## Phase 14: Vendor Portal
**Goal**: Read-only portal for VENDOR role

### Step 14.1: Vendor Portal Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/vendor-portal/dashboard/page.tsx` - Vendor dashboard
2. ✅ `src/app/[locale]/(dashboard)/vendor-portal/bookings/page.tsx` - Assigned bookings
3. ✅ `src/app/[locale]/(dashboard)/vendor-portal/payments/page.tsx` - Payment history
4. ✅ `src/app/[locale]/(dashboard)/vendor-portal/profile/page.tsx` - Update profile (limited)
5. ✅ `src/lib/api/endpoints/vendor-portal.ts` - Vendor portal API
6. ✅ `src/lib/api/hooks/use-vendor-portal.ts` - Hooks

**Features:**
- Role guard (VENDOR only)
- Read-only bookings
- Payment stats (TRY)
- Limited profile update

---

## Phase 15: Audit Logs
**Goal**: View user activity

### Step 15.1: Audit Logs Module
**Files to create:**
1. ✅ `src/app/[locale]/(dashboard)/audit-logs/page.tsx` - Audit logs list
2. ✅ `src/components/audit-logs/log-detail-dialog.tsx` - Log details
3. ✅ `src/lib/api/endpoints/audit-logs.ts` - Audit logs API
4. ✅ `src/lib/api/hooks/use-audit-logs.ts` - Hooks

**Features:**
- Filter by action, user, date
- View details (before/after)
- Pagination

---

## Phase 16: Testing
**Goal**: Unit tests for critical flows

### Step 16.1: Tests
**Files to create:**
1. ✅ `src/__tests__/api/client.test.ts` - API client tests
2. ✅ `src/__tests__/components/currency-field.test.tsx` - Currency field tests
3. ✅ `src/__tests__/flows/quotation-acceptance.test.tsx` - Quotation → Booking
4. ✅ `src/__tests__/flows/idempotent-payment.test.tsx` - Payment idempotency
5. ✅ `src/__tests__/guards/rbac.test.tsx` - RBAC guards

**Coverage:**
- Lead → Quotation → Accept → Booking
- Idempotent payments
- RBAC (AGENT can't create invoice, ACCOUNTING can)

---

## Phase 17: Polish & Optimization
**Goal**: Production-ready

### Step 17.1: Final Touches
- ✅ Error boundaries
- ✅ Loading states
- ✅ Empty states
- ✅ Toast notifications
- ✅ Keyboard shortcuts
- ✅ Mobile responsive
- ✅ Performance optimization (React.memo, useMemo)

### Step 17.2: Documentation
- ✅ API client usage examples
- ✅ Component Storybook (optional)
- ✅ Deployment guide

---

## Implementation Order Summary

1. **Foundation** (Phase 1) - Get project running
2. **API + Auth** (Phase 2) - Connect to backend
3. **i18n** (Phase 2.3) - Translations
4. **UI Components** (Phase 3) - Component library
5. **Auth Pages** (Phase 4) - Login flow
6. **Dashboard** (Phase 5) - Home page
7. **CRUD Modules** (Phase 6) - Leads, Clients, Vendors, Tours
8. **Quotations** (Phase 7) - Workflow
9. **Bookings + P&L** (Phase 8) - Core feature
10. **Payments** (Phase 9) - Idempotent
11. **Invoices** (Phase 10) - PDF
12. **Reports** (Phase 11) - Analytics
13. **Files** (Phase 12) - Uploads
14. **Settings** (Phase 13) - Profile + rates
15. **Vendor Portal** (Phase 14) - Vendor view
16. **Audit Logs** (Phase 15) - Activity
17. **Testing** (Phase 16) - QA
18. **Polish** (Phase 17) - Production

---

## Estimated Effort

- **Total files**: ~120-150 files
- **Lines of code**: ~15,000-20,000 LOC
- **Time estimate**: 3-4 weeks full-time

---

## Next Session Plan

**We'll start with Phase 1 & 2 in the next session:**

1. Install dependencies
2. Create API client infrastructure
3. Build authentication system
4. Set up i18n
5. Create first working page (login)

**Ready to begin! 🚀**
