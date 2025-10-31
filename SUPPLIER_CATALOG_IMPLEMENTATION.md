# Supplier Catalog Frontend Implementation

## Summary

I've successfully created the frontend foundation for the new Supplier Catalog system based on the architecture defined in `vendors.txt`. The implementation follows the existing project patterns and integrates seamlessly with the backend API.

---

## What's Been Implemented ✅

### 1. API Layer (`apps/web/src/lib/api/endpoints/suppliers.ts`)

**TypeScript Types & Interfaces:**
- `SupplierType` enum (HOTEL, TRANSPORT, ACTIVITY_OPERATOR, GUIDE_AGENCY, OTHER)
- `ServiceType` enum (HOTEL_ROOM, TRANSFER, VEHICLE_HIRE, GUIDE_SERVICE, ACTIVITY)
- `Supplier` interface with all fields including Party relation
- `ServiceOffering` interface with supplier relation
- Create/Update DTOs for both entities

**API Functions:**
- `suppliersApi.getAll()` - List suppliers with optional filters
- `suppliersApi.getOne(id)` - Get single supplier details
- `suppliersApi.create(data)` - Create new supplier
- `suppliersApi.update(id, data)` - Update supplier
- `suppliersApi.delete(id)` - Soft delete supplier
- Similar functions for `serviceOfferingsApi`

### 2. React Query Hooks (`apps/web/src/lib/api/hooks/use-suppliers.ts`)

**Suppliers Hooks:**
- `useSuppliers(params)` - Query hook for listing suppliers
- `useSupplier(id)` - Query hook for single supplier
- `useCreateSupplier()` - Mutation hook with toast notifications
- `useUpdateSupplier()` - Mutation hook with cache invalidation
- `useDeleteSupplier()` - Mutation hook for soft delete

**Service Offerings Hooks:**
- `useServiceOfferings(params)` - Query with type/supplier filters
- `useServiceOffering(id)` - Single offering query
- `useCreateServiceOffering()` - Create mutation
- `useUpdateServiceOffering()` - Update mutation
- `useDeleteServiceOffering()` - Delete mutation

All hooks include:
- Automatic query invalidation on mutations
- Toast notifications for success/error
- TypeScript type safety
- Proper error handling

### 3. Suppliers List Page (`apps/web/src/app/[locale]/(dashboard)/suppliers/page.tsx`)

**Features:**
- Clean, professional table layout
- Search by name, email, or tax ID
- Filter by supplier type
- Toggle to show/hide inactive suppliers
- Display supplier details:
  - Company name and tax ID
  - Type badge with color coding
  - Contact information (phone, email)
  - Payment terms
  - Commission percentage
  - Active/Inactive status
- Actions:
  - Edit supplier (links to edit page)
  - Deactivate supplier with confirmation
- "New Supplier" button
- Responsive design following project patterns

**Type Colors:**
- Hotel: Blue
- Transport: Green
- Activity Operator: Orange
- Guide Agency: Purple
- Other: Gray

### 4. Service Catalog Page (`apps/web/src/app/[locale]/(dashboard)/catalog/page.tsx`)

**Features:**
- **Tabbed Interface** with 5 service types:
  - Hotels
  - Transfers
  - Vehicles
  - Guides
  - Activities
- Search across title, location, and supplier
- Show/hide inactive offerings toggle
- Service offerings table for each type:
  - Service title and type badge
  - Supplier name and type
  - Location
  - Description preview
  - Active/Inactive status
- Actions per offering:
  - **Manage Rates** button (links to rate management)
  - Edit offering details
  - Deactivate offering
- "New Service" button (context-aware based on active tab)
- Clean, organized interface matching project style

---

## File Structure Created

```
apps/web/src/
├── lib/api/
│   ├── endpoints/
│   │   └── suppliers.ts          # API client & types
│   └── hooks/
│       └── use-suppliers.ts      # React Query hooks
└── app/[locale]/(dashboard)/
    ├── suppliers/
    │   └── page.tsx               # Suppliers list page
    └── catalog/
        └── page.tsx               # Service catalog with tabs
```

---

## What Still Needs to Be Built 📋

### 1. Form Pages

**Create/Edit Supplier Form** (`suppliers/new` and `suppliers/[id]`)
- Party selection or creation
- Supplier type selection
- Bank account details form
- Payment terms input
- Commission percentage
- Credit limit
- Currency selection

**Create/Edit Service Offering Form** (`catalog/new` and `catalog/[id]`)
- Supplier selection dropdown
- Service type selection
- Title and description
- Location input
- Active/inactive toggle

### 2. Type-Specific Detail Components

Need to create detail forms for each service type (these extend the service offering):

**Hotels** (`apps/api/src/hotels/`):
- Hotel name, stars, address
- Room type, max occupancy
- Board types (RO, BB, HB, FB, AI)
- Amenities

**Transfers**:
- Origin/destination zones
- Vehicle class
- Private/shared
- Meet & greet options

**Vehicles**:
- Make, model, year
- Seats, class
- With/without driver

**Guides**:
- Guide name, license
- Languages, regions
- Max group size

**Activities**:
- Operator name, duration
- Capacity, age limits
- Meeting point

### 3. Rate Management Components

**Rate Tables for Each Type:**
- `hotel-room-rates` - Season dates, board type, occupancy, cost
- `transfer-rates` - Pricing model, included km/hours, surcharges
- `vehicle-rates` - Daily/hourly rates, km limits
- `guide-rates` - Per day/half-day/hour rates
- `activity-rates` - Tiered pricing, min/max pax

Each rate component should include:
- Season date range picker
- Type-specific pricing fields
- Create/edit/delete functionality
- Rate history view

### 4. Pricing Quote Component

**POST /api/v1/pricing/quote Integration:**
- Service type selector
- Service offering picker
- Date selection
- PAX input
- Options/extras
- Display: cost (TRY), sell price (EUR), breakdown
- "Add to Booking" button

### 5. Navigation Menu Updates

Need to add menu items in the sidebar navigation:
- **Suppliers** (new menu item)
- **Service Catalog** (new menu item)
  - Potentially with submenu for each type
- Update any existing "Vendors" references

### 6. Additional API Endpoints

May need to create frontend hooks for:
- Parties API (for supplier creation)
- Contacts API (for party contacts)
- Each type-specific API (hotels, transfers, vehicles, guides, activities)
- Each rate API (hotel-room-rates, transfer-rates, etc.)
- Pricing API (/pricing/quote, /pricing/bulk-quote)

---

## Backend API Endpoints (Already Implemented)

The following backend endpoints are available and working:

### Suppliers
- `GET /api/v1/suppliers` - List suppliers
- `GET /api/v1/suppliers/:id` - Get supplier
- `POST /api/v1/suppliers` - Create supplier
- `PATCH /api/v1/suppliers/:id` - Update supplier
- `DELETE /api/v1/suppliers/:id` - Deactivate supplier

### Service Offerings
- `GET /api/v1/service-offerings` - List offerings
- `GET /api/v1/service-offerings/:id` - Get offering
- `POST /api/v1/service-offerings` - Create offering
- `PATCH /api/v1/service-offerings/:id` - Update offering
- `DELETE /api/v1/service-offerings/:id` - Deactivate offering

### Type-Specific Endpoints
- Hotels: `/api/v1/hotels/*`
- Transfers: `/api/v1/transfers/*`
- Vehicles: `/api/v1/vehicles/*`
- Guides: `/api/v1/guides/*`
- Activities: `/api/v1/activities/*`

### Rate Endpoints
- `/api/v1/hotel-room-rates/*`
- `/api/v1/transfer-rates/*`
- `/api/v1/vehicle-rates/*`
- `/api/v1/guide-rates/*`
- `/api/v1/activity-rates/*`

### Pricing Helpers
- `POST /api/v1/pricing/quote` - Get pricing for service
- `POST /api/v1/pricing/bulk-quote` - Price multiple services

---

## How to Use What's Been Built

### 1. Access the Pages

Navigate to:
- **Suppliers:** `http://localhost:3000/{locale}/suppliers`
- **Catalog:** `http://localhost:3000/{locale}/catalog`

### 2. Test the Functionality

**Suppliers Page:**
- View all suppliers
- Search by name/email/tax ID
- Filter by supplier type
- Toggle inactive suppliers
- Click edit/delete buttons (note: edit pages need to be created)

**Catalog Page:**
- Switch between service type tabs
- View offerings for each type
- Search across all fields
- Click "Manage Rates" (rates pages need to be created)
- Click edit/delete buttons

### 3. Check API Integration

Open browser console to see:
- API requests being made
- Data being fetched
- Toast notifications on actions
- Error handling if API is unavailable

---

## Next Steps / Recommendations

### Immediate Priority (Most Important):

1. **Add Navigation Menu Items**
   - Add "Suppliers" and "Catalog" to sidebar
   - Update routing configuration

2. **Create Supplier Form**
   - Build create/edit form for suppliers
   - Integrate with Parties API for company selection
   - Add validation

3. **Create Service Offering Form**
   - Build create/edit form
   - Dynamic type-specific fields based on serviceType
   - Integrate with type-specific APIs

### Medium Priority:

4. **Build Rate Management**
   - Start with hotel room rates (most common)
   - Create reusable rate table component
   - Implement CRUD operations

5. **Type-Specific Forms**
   - Hotels detail form first
   - Then transfers, vehicles, guides, activities

### Later:

6. **Pricing Quote Integration**
   - Build quote calculator component
   - Integrate with booking creation flow

7. **Advanced Features**
   - Bulk operations
   - Import/export
   - Rate copying/cloning
   - Analytics and reporting

---

## Technical Notes

### Patterns Used

- **Next.js 13+ App Router** with `[locale]` parameter
- **React Query (TanStack Query)** for data fetching
- **shadcn/ui** components for UI
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **Optimistic UI Updates** via query invalidation

### Code Quality

- Follows existing project conventions
- Type-safe with full TypeScript coverage
- Reusable hooks with proper error handling
- Accessible UI components
- Responsive design
- Consistent naming conventions

### API Integration

- Centralized API client (`api.ts`)
- Axios for HTTP requests
- Bearer token authentication
- Automatic query invalidation
- Toast notifications

---

## Migration from Old Vendors

The old vendors system (in `apps/web/src/app/[locale]/(dashboard)/vendors/`) can coexist with this new system during the transition period. Eventually:

1. Migrate existing vendor data to suppliers
2. Create service offerings from vendor rates
3. Update all bookings to reference service offerings
4. Deprecate old vendors system

---

## Summary

You now have a solid foundation for the new Supplier Catalog system with:
- ✅ Complete API integration layer
- ✅ React Query hooks with full CRUD operations
- ✅ Professional Suppliers list page
- ✅ Service Catalog with tabbed interface
- ✅ Search, filtering, and status management
- ✅ Type-safe TypeScript throughout

The main pages are functional and ready to use. The next step is to create the form pages for creating/editing suppliers and service offerings, followed by rate management components.

All code follows the project's existing patterns and can be extended easily. The architecture aligns with the design from `vendors.txt` and integrates cleanly with the backend API.

---

**Last Updated:** 2025-10-31
**Status:** Foundation Complete, Forms & Rates Pending
