# Tour CRM - System Architecture

## Overview

The Tour CRM system uses a **HYBRID architecture** with two complementary database systems working together:

1. **Supplier Management System** (NEW) - Comprehensive supplier and service management
2. **Quotation/Catalog System** (TQA Database) - Fast quote building with Google Places integration

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOUR OPERATOR CRM                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                             │
┌───────────────▼────────────┐   ┌───────────▼───────────────┐
│  SUPPLIER MANAGEMENT        │   │  QUOTATION / CATALOG       │
│  (Backend Operations)       │   │  (Quote Building & AI)     │
├─────────────────────────────┤   ├────────────────────────────┤
│                             │   │                             │
│  Tables:                    │   │  Tables:                    │
│  • ServiceOffering          │   │  • QuoteHotel              │
│  • HotelRoom                │   │  • QuoteHotelPricing       │
│  • HotelRoomRate            │   │  • SICTour                 │
│  • Transfer                 │   │  • SICTourPricing          │
│  • TransferRate             │   │  • IntercityTransfer       │
│  • Activity                 │   │  • Restaurant              │
│  • ActivityRate             │   │  • SightseeingFee          │
│  • Vehicle                  │   │  • CatalogVehicle          │
│  • VehicleRate              │   │                             │
│  • Guide                    │   │  Features:                 │
│  • GuideRate                │   │  • Google Places API       │
│  • Supplier                 │   │  • Latitude/Longitude      │
│  • Party                    │   │  • Photos & Ratings        │
│  • Contact                  │   │  • City-based search       │
│                             │   │  • TQA compatibility       │
│  Features:                  │   │                             │
│  • Detailed specifications  │   │  Used By:                  │
│  • Multi-season rates       │   │  • Catalog API             │
│  • Contract management      │   │  • AI Itinerary Gen        │
│  • Flexible pricing models  │   │  • Manual Quote Builder    │
│  • Allotments & releases    │   │  • Public Portal           │
│                             │   │                             │
│  Used By:                   │   └────────────────────────────┘
│  • Suppliers CRUD pages     │
│  • Rate management          │
│  • Operations team          │
└─────────────────────────────┘
```

---

## 📊 System 1: Supplier Management

### Purpose
Comprehensive backend system for managing supplier relationships, contracts, and detailed service information.

### Database Tables

#### Core Tables
- **Party** - Companies (hotel chains, tour operators, etc.)
- **Contact** - Contact persons at each party (reservations, accounting, sales)
- **Supplier** - Supplier-specific info (payment terms, bank details, commission)

#### Service Tables
- **ServiceOffering** - Main service catalog (title, location, description)
- **HotelRoom** - Hotel room details (stars, room type, amenities, check-in/out times)
- **Transfer** - Transfer services (zones, vehicle class, meet & greet)
- **Activity** - Tours & activities (duration, capacity, difficulty, inclusions)
- **Vehicle** - Vehicle fleet (make, model, features, insurance)
- **Guide** - Tour guides (languages, specializations, license number)

#### Rate Card Tables
- **HotelRoomRate** - Hotel pricing (per person/room, child pricing, allotments)
- **TransferRate** - Transfer pricing (base cost, surcharges, waiting time)
- **ActivityRate** - Activity pricing (per person, tiered pricing, discounts)
- **VehicleRate** - Vehicle rental pricing (daily rate, km included, driver cost)
- **GuideRate** - Guide pricing (full day, half day, hourly, overtime)

### Features
- ✅ Multiple rate cards per service (seasonal pricing)
- ✅ Flexible pricing models (per room, per person, per transfer, per day)
- ✅ Contract management (allotments, release days, min stay)
- ✅ Detailed service specifications (amenities, features, capacity)
- ✅ Multi-contact management per supplier
- ✅ Bank details and payment terms

### API Endpoints
- **GET** `/api/v1/suppliers` - List all suppliers
- **GET** `/api/v1/suppliers/hotels` - List hotel suppliers
- **GET** `/api/v1/suppliers/:id` - Get supplier details with service offerings
- **POST** `/api/v1/catalog/:id/rates` - Add rate card to service

### Use Cases
1. **Operations Team**: Add new supplier contracts
2. **Finance**: Manage payment terms and bank details
3. **Product Team**: Create detailed service specifications
4. **Revenue Management**: Set seasonal pricing strategies

---

## 📊 System 2: Quotation / Catalog (TQA Database)

### Purpose
Fast quote building system with Google Places integration for quick price lookups and AI itinerary generation.

### Database Tables

#### Service Tables
- **QuoteHotel** - Simplified hotel data with Google Places integration
- **QuoteHotelPricing** - Hotel pricing by season
- **SICTour** - Tour packages (SIC or Private)
- **SICTourPricing** - Tour pricing with PAX tiers (2, 4, 6, 8, 10 PAX)
- **IntercityTransfer** - City-to-city transfers
- **Restaurant** - Restaurant options
- **SightseeingFee** - Entrance fees and attractions
- **CatalogVehicle** - Vehicle types for transfers

#### Supporting Tables
- **City** - Cities and airports
- **ManualQuote** - Custom quotes built manually
- **CustomerItinerary** - AI-generated itineraries

### Google Places Integration
Each hotel and tour can have:
- `googlePlaceId` - Unique Google identifier
- `latitude` / `longitude` - GPS coordinates
- `googleMapsUrl` - Direct link to Google Maps
- `photoUrl1`, `photoUrl2`, `photoUrl3` - Photos from Google
- `rating` - Google rating (0.0-5.0)
- `userRatingsTotal` - Number of reviews
- `editorial_summary` - Description from Google
- `placeTypes` - Categories (e.g., "hotel", "point_of_interest")

### API Endpoints

#### Catalog (Quote Building)
- **GET** `/api/v1/catalog/cities` - Get all cities
- **GET** `/api/v1/catalog/hotels?cityId=7&startDate=2025-04-01&endDate=2025-04-05` - Search hotels
- **GET** `/api/v1/catalog/tours?cityId=7&startDate=2025-04-01&endDate=2025-04-05` - Search tours
- **GET** `/api/v1/catalog/transfers?fromCityId=7&toCityId=10` - Search transfers

#### AI Itinerary Generation
- **POST** `/api/v1/customer-itineraries/generate` - Generate AI itinerary (PUBLIC)
- **GET** `/api/v1/customer-itineraries/view/:uuid` - View itinerary (PUBLIC)
- **POST** `/api/v1/customer-itineraries/view/:uuid/request-booking` - Request booking (PUBLIC)
- **GET** `/api/v1/customer-itineraries` - List all itineraries (PROTECTED)
- **PUT** `/api/v1/customer-itineraries/:uuid/status` - Update status (PROTECTED)
- **POST** `/api/v1/customer-itineraries/:id/convert-to-quote` - Convert to manual quote (PROTECTED)

#### Manual Quotes
- **POST** `/api/v1/manual-quotes` - Create manual quote
- **GET** `/api/v1/manual-quotes/:id` - Get quote with full day/expense breakdown
- **POST** `/api/v1/manual-quotes/:id/calculate` - Calculate totals

### Use Cases
1. **Sales Team**: Build quotes quickly using city search
2. **Customers**: Generate AI itineraries from public portal
3. **Agents**: Customize AI itineraries into manual quotes
4. **Management**: View all customer requests and conversion rates

---

## 🔄 How The Systems Work Together

### Current Flow

```
Customer Request (Portal)
    │
    ▼
AI Itinerary Generation
    │
    ├─> Queries Catalog System (QuoteHotel, SICTour, IntercityTransfer)
    ├─> Calculates pricing
    ├─> Creates CustomerItinerary record
    │
    ▼
Agent Reviews
    │
    ├─> Option 1: Approve as-is
    ├─> Option 2: Convert to Manual Quote
    │       │
    │       ├─> Creates ManualQuote
    │       ├─> Copies days and expenses
    │       └─> Agent can customize pricing
    │
    ▼
Booking Confirmation
```

### Future Enhancement: Hybrid Integration

```
Supplier Management System
    │
    ├─> Add new hotel with detailed info
    ├─> Set multiple rate cards (seasons)
    │
    ▼
SYNC MECHANISM (Future Feature)
    │
    ├─> Create/Update QuoteHotel record
    ├─> Link to Google Places (if available)
    ├─> Populate QuoteHotelPricing from rate cards
    │
    ▼
Catalog System (Enhanced)
    │
    ├─> Faster quote building
    ├─> Google integration preserved
    └─> Supplier contract info available
```

---

## 📋 Data Relationships

### Linking Between Systems

**QuoteHotel** has a `supplierId` field (line 1145 in schema) to optionally link to the Supplier Management system:

```sql
model QuoteHotel {
  id         Int      @id
  supplierId Int?     @map("supplier_id")  -- Links to Supplier table
  hotelName  String
  cityId     Int
  ...
}
```

This allows you to:
1. Import hotels from TQA database (without supplier link)
2. Gradually link them to suppliers as you build relationships
3. Eventually sync pricing from Supplier rate cards

---

## 🎯 Recommended Workflow

### For Hotels

1. **Import TQA Data** → QuoteHotel (with Google Places info)
2. **Build Supplier Relationship** → Create Party, Supplier, ServiceOffering, HotelRoom
3. **Link Together** → Set `supplierId` in QuoteHotel
4. **Manage Rates** → Use HotelRoomRate for detailed seasonal pricing
5. **Quote Building** → Use QuoteHotel (fast, has Google data)

### For Tours

1. **Use SICTour** for quote building (has Google Places integration)
2. **Use Activity** for detailed tour management (detailed inclusions, capacity, etc.)
3. **Decision**: Keep both OR migrate SICTour → Activity over time

### For Transfers

1. **Use IntercityTransfer** for city-to-city (simple, works now)
2. **Use Transfer + TransferRate** for detailed zone-based transfers (airports, hotel zones)
3. **Future**: Migrate IntercityTransfer data to new Transfer system

---

## 🚀 Migration Strategy (Future)

### Phase 1: Coexistence (CURRENT)
- ✅ Both systems work independently
- ✅ Quote building uses Catalog tables
- ✅ Supplier management uses new tables
- ✅ No data loss, everything works

### Phase 2: Linking (Optional)
- Add `supplierId` links from QuoteHotel to Supplier
- Add API endpoints to sync pricing
- Keep Google Places integration

### Phase 3: Unified (Future)
- Create views that combine both systems
- Single API that queries both
- Deprecate old tables gradually

---

## 📁 Database Schema Location

Full schema: `apps/api/prisma/schema.prisma`

### Key Sections
- Lines 50-58: Supplier Management relations
- Lines 59-72: Quotation/Catalog relations
- Lines 313-674: Supplier system models
- Lines 1139-1398: Quotation system models

---

## 🔐 Authentication & Multi-Tenancy

All systems support:
- **JWT Authentication** - All protected endpoints require Bearer token
- **Multi-Tenancy** - All data filtered by `tenantId`
- **Role-Based Access** - OWNER, ADMIN, AGENT, OPERATIONS, ACCOUNTING
- **Public Endpoints** - Customer itinerary viewing (UUID-based)

---

## 📖 API Documentation

See detailed API documentation in:
- `docs/api/suppliers.md` - Supplier Management API
- `docs/api/catalog.md` - Catalog/Quote Building API
- `docs/api/customer-itineraries.md` - AI Itinerary Generation API
- `docs/api/manual-quotes.md` - Manual Quote Builder API

---

## 🎓 Summary

**DON'T delete any tables** - they serve different purposes:

| System | Purpose | Best For |
|--------|---------|----------|
| **Supplier** | Backend operations | Contracts, detailed specs, multi-season pricing |
| **Catalog** | Frontend quote building | Fast search, Google integration, AI generation |

**The hybrid approach gives you the best of both worlds!**
