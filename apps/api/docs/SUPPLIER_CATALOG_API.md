# Supplier Catalog System API Documentation

## Overview

The Supplier Catalog System provides a comprehensive API for managing travel suppliers, their service offerings, and pricing across different service types including hotels, transfers, vehicles, guides, and activities.

## Architecture

The system follows a hierarchical structure:

```
Party (Legal Entity)
  └── Supplier (Travel Service Provider)
      └── Service Offering (Specific Service)
          ├── Type-Specific Details (Hotel Room, Transfer, Vehicle, Guide, or Activity)
          └── Rates (Season-based pricing)
```

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All endpoints require JWT Bearer token authentication:

```
Authorization: Bearer <your_jwt_token>
```

## API Modules

### 1. Parties API

**Base Path:** `/api/v1/parties`

Manages legal entities (companies or individuals) that can be suppliers or contacts.

**Endpoints:**
- `POST /parties` - Create a new party
- `GET /parties` - List all parties
- `GET /parties/search?q={query}` - Search parties by name
- `GET /parties/:id` - Get party details
- `PATCH /parties/:id` - Update party
- `DELETE /parties/:id` - Soft delete party

**Example Request:**
```json
POST /api/v1/parties
{
  "name": "Acme Hotels Ltd.",
  "taxId": "123456789",
  "address": "123 Main St",
  "city": "Istanbul",
  "country": "Turkey"
}
```

---

### 2. Contacts API

**Base Path:** `/api/v1/contacts`

Manages contact persons associated with parties.

**Endpoints:**
- `POST /contacts` - Create contact
- `GET /contacts?partyId={id}` - List contacts (filterable by party)
- `GET /contacts/:id` - Get contact details
- `PATCH /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Soft delete contact

**Example Request:**
```json
POST /api/v1/contacts
{
  "partyId": 1,
  "contactType": "operations",
  "name": "John Smith",
  "email": "john@acmehotels.com",
  "phone": "+90 212 555 1234",
  "isPrimary": true
}
```

---

### 3. Suppliers API

**Base Path:** `/api/v1/suppliers`

Manages supplier records linked to parties.

**Endpoints:**
- `POST /suppliers` - Create supplier
- `GET /suppliers?type={HOTEL_PROVIDER|TRANSPORT|DMC|ACTIVITY_OPERATOR}` - List suppliers
- `GET /suppliers/search?q={query}` - Search suppliers
- `GET /suppliers/:id` - Get supplier details with party info
- `PATCH /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Soft delete supplier

**Example Request:**
```json
POST /api/v1/suppliers
{
  "partyId": 1,
  "type": "HOTEL_PROVIDER",
  "bankName": "Garanti Bank",
  "bankIban": "TR330006100519786457841326",
  "paymentTerms": "Net 30",
  "defaultCurrency": "TRY",
  "commissionPct": 10
}
```

---

### 4. Service Offerings API

**Base Path:** `/api/v1/service-offerings`

Manages catalog items that suppliers provide.

**Endpoints:**
- `POST /service-offerings` - Create offering
- `GET /service-offerings?supplierId={id}&serviceType={type}` - List offerings
- `GET /service-offerings/search?q={query}` - Search offerings
- `GET /service-offerings/:id` - Get offering details
- `PATCH /service-offerings/:id` - Update offering
- `DELETE /service-offerings/:id` - Soft delete offering

**Service Types:**
- `HOTEL_ROOM`
- `TRANSFER`
- `VEHICLE_HIRE`
- `GUIDE_SERVICE`
- `ACTIVITY`

**Example Request:**
```json
POST /api/v1/service-offerings
{
  "supplierId": 1,
  "serviceType": "HOTEL_ROOM",
  "title": "Grand Hotel Istanbul - Deluxe Room",
  "location": "Istanbul, Turkey",
  "description": "Luxury hotel in the heart of Istanbul"
}
```

---

### 5. Hotels API

**Base Path:** `/api/v1/hotels`

Manages hotel room details and rates.

#### Hotel Room Details

**Endpoints:**
- `POST /hotels` - Create hotel room
- `GET /hotels?stars={1-5}` - List hotel rooms
- `GET /hotels/search?q={query}` - Search hotels
- `GET /hotels/:serviceOfferingId` - Get hotel details
- `PATCH /hotels/:serviceOfferingId` - Update hotel
- `DELETE /hotels/:serviceOfferingId` - Delete hotel

**Example Request:**
```json
POST /api/v1/hotels
{
  "serviceOfferingId": 1,
  "hotelName": "Grand Hotel Istanbul",
  "stars": 5,
  "address": "Sultanahmet Square",
  "city": "Istanbul",
  "country": "Turkey",
  "roomType": "DBL",
  "maxOccupancy": 2,
  "boardTypes": ["RO", "BB", "HB", "FB"],
  "amenities": ["wifi", "pool", "spa", "parking"],
  "checkInTime": "14:00",
  "checkOutTime": "11:00"
}
```

#### Hotel Room Rates

**Endpoints:**
- `POST /hotels/rates` - Create rate
- `GET /hotels/rates?serviceOfferingId={id}&dateFrom={YYYY-MM-DD}&dateTo={YYYY-MM-DD}` - List rates
- `GET /hotels/rates/:id` - Get rate details
- `PATCH /hotels/rates/:id` - Update rate
- `DELETE /hotels/rates/:id` - Delete rate

**Example Request:**
```json
POST /api/v1/hotels/rates
{
  "serviceOfferingId": 1,
  "seasonFrom": "2025-06-01",
  "seasonTo": "2025-08-31",
  "pricingModel": "PER_ROOM_NIGHT",
  "boardType": "BB",
  "occupancyAdults": 2,
  "occupancyChildren": 0,
  "costTry": 3500.00,
  "minStay": 2,
  "allotment": 10,
  "releaseDays": 7
}
```

---

### 6. Transfers API

**Base Path:** `/api/v1/transfers`

Manages transfer services and rates.

#### Transfer Details

**Endpoints:**
- `POST /transfers` - Create transfer
- `GET /transfers?transferType={ONE_WAY|ROUND_TRIP}&vehicleClass={sedan|van}` - List transfers
- `GET /transfers/search?q={query}` - Search transfers
- `GET /transfers/:serviceOfferingId` - Get transfer details
- `PATCH /transfers/:serviceOfferingId` - Update transfer
- `DELETE /transfers/:serviceOfferingId` - Delete transfer

**Transfer Types:**
- `ONE_WAY`
- `ROUND_TRIP`
- `HOURLY`

**Example Request:**
```json
POST /api/v1/transfers
{
  "serviceOfferingId": 2,
  "originZone": "Istanbul Airport (IST)",
  "destZone": "Sultanahmet",
  "transferType": "ONE_WAY",
  "vehicleClass": "sedan",
  "capacity": 4,
  "meetGreet": true,
  "duration": 45,
  "distance": 50
}
```

#### Transfer Rates

**Endpoints:**
- `POST /transfers/rates` - Create rate
- `GET /transfers/rates?serviceOfferingId={id}` - List rates
- `GET /transfers/rates/:id` - Get rate details
- `PATCH /transfers/rates/:id` - Update rate
- `DELETE /transfers/rates/:id` - Delete rate

**Example Request:**
```json
POST /api/v1/transfers/rates
{
  "serviceOfferingId": 2,
  "seasonFrom": "2025-06-01",
  "seasonTo": "2025-08-31",
  "pricingModel": "PER_TRANSFER",
  "baseCostTry": 1500.00,
  "includedKm": 50,
  "includedHours": 1,
  "extraKmTry": 15.00,
  "extraHourTry": 250.00,
  "nightSurchargePct": 25,
  "holidaySurchargePct": 35
}
```

---

### 7. Vehicles API

**Base Path:** `/api/v1/vehicles`

Manages vehicle hire services and rates.

#### Vehicle Details

**Endpoints:**
- `POST /vehicles` - Create vehicle
- `GET /vehicles?vehicleClass={economy|comfort}&withDriver={true|false}` - List vehicles
- `GET /vehicles/search?q={query}` - Search vehicles
- `GET /vehicles/:serviceOfferingId` - Get vehicle details
- `PATCH /vehicles/:serviceOfferingId` - Update vehicle
- `DELETE /vehicles/:serviceOfferingId` - Delete vehicle

**Example Request:**
```json
POST /api/v1/vehicles
{
  "serviceOfferingId": 3,
  "make": "Mercedes-Benz",
  "model": "E-Class",
  "year": 2024,
  "vehicleClass": "luxury",
  "seats": 5,
  "transmission": "automatic",
  "fuelType": "diesel",
  "withDriver": true,
  "features": ["GPS", "wifi", "AC", "leather_seats"],
  "insuranceIncluded": true
}
```

#### Vehicle Rates

**Endpoints:**
- `POST /vehicles/rates` - Create rate
- `GET /vehicles/rates?serviceOfferingId={id}` - List rates
- `GET /vehicles/rates/:id` - Get rate details
- `PATCH /vehicles/rates/:id` - Update rate
- `DELETE /vehicles/rates/:id` - Delete rate

**Example Request:**
```json
POST /api/v1/vehicles/rates
{
  "serviceOfferingId": 3,
  "seasonFrom": "2025-06-01",
  "seasonTo": "2025-08-31",
  "pricingModel": "PER_DAY",
  "baseCostTry": 2500.00,
  "dailyKmIncluded": 200,
  "extraKmTry": 5.00,
  "driverDailyTry": 500.00,
  "depositTry": 5000.00,
  "minRentalDays": 3
}
```

---

### 8. Guides API

**Base Path:** `/api/v1/guides`

Manages tour guide services and rates.

#### Guide Details

**Endpoints:**
- `POST /guides` - Create guide
- `GET /guides?languages={en,tr}` - List guides
- `GET /guides/search?q={query}` - Search guides
- `GET /guides/:serviceOfferingId` - Get guide details
- `PATCH /guides/:serviceOfferingId` - Update guide
- `DELETE /guides/:serviceOfferingId` - Delete guide

**Example Request:**
```json
POST /api/v1/guides
{
  "serviceOfferingId": 4,
  "guideName": "Mehmet Yilmaz",
  "licenseNo": "GUIDE-2024-001",
  "languages": ["en", "tr", "de"],
  "regions": ["Istanbul", "Cappadocia", "Ephesus"],
  "specializations": ["history", "archaeology", "culture"],
  "maxGroupSize": 25,
  "rating": 4.8,
  "phone": "+90 532 555 1234",
  "email": "mehmet@guides.com"
}
```

#### Guide Rates

**Endpoints:**
- `POST /guides/rates` - Create rate
- `GET /guides/rates?serviceOfferingId={id}` - List rates
- `GET /guides/rates/:id` - Get rate details
- `PATCH /guides/rates/:id` - Update rate
- `DELETE /guides/rates/:id` - Delete rate

**Example Request:**
```json
POST /api/v1/guides/rates
{
  "serviceOfferingId": 4,
  "seasonFrom": "2025-06-01",
  "seasonTo": "2025-08-31",
  "pricingModel": "PER_DAY",
  "dayCostTry": 1200.00,
  "halfDayCostTry": 700.00,
  "hourCostTry": 150.00,
  "overtimeHourTry": 200.00,
  "holidaySurchargePct": 50,
  "minHours": 4
}
```

---

### 9. Activities API

**Base Path:** `/api/v1/activities`

Manages activity/experience services and rates.

#### Activity Details

**Endpoints:**
- `POST /activities` - Create activity
- `GET /activities?activityType={tour|attraction}&difficulty={easy|moderate}` - List activities
- `GET /activities/search?q={query}` - Search activities
- `GET /activities/:serviceOfferingId` - Get activity details
- `PATCH /activities/:serviceOfferingId` - Update activity
- `DELETE /activities/:serviceOfferingId` - Delete activity

**Activity Types:**
- `tour`
- `attraction`
- `experience`

**Example Request:**
```json
POST /api/v1/activities
{
  "serviceOfferingId": 5,
  "operatorName": "Istanbul Adventures",
  "activityType": "tour",
  "durationMinutes": 480,
  "capacity": 15,
  "minAge": 12,
  "difficulty": "moderate",
  "includedItems": ["entrance", "guide", "lunch", "transport"],
  "meetingPoint": "Sultanahmet Square",
  "pickupAvailable": true,
  "cancellationPolicy": "Free cancellation up to 24 hours before"
}
```

#### Activity Rates

**Endpoints:**
- `POST /activities/rates` - Create rate
- `GET /activities/rates?serviceOfferingId={id}` - List rates
- `GET /activities/rates/:id` - Get rate details
- `PATCH /activities/rates/:id` - Update rate
- `DELETE /activities/rates/:id` - Delete rate

**Example Request:**
```json
POST /api/v1/activities/rates
{
  "serviceOfferingId": 5,
  "seasonFrom": "2025-06-01",
  "seasonTo": "2025-08-31",
  "pricingModel": "PER_PERSON",
  "baseCostTry": 850.00,
  "minPax": 4,
  "maxPax": 15,
  "tieredPricingJson": {
    "1-4": 1000,
    "5-8": 850,
    "9-15": 750
  },
  "childDiscountPct": 25,
  "groupDiscountPct": 10
}
```

---

### 10. Pricing API

**Base Path:** `/api/v1/pricing`

Calculates quotes for service offerings based on parameters and active rates.

**Endpoint:**
- `POST /pricing/quote` - Get pricing quote

**Request Parameters:**
- `serviceOfferingId` (required) - ID of the service offering
- `serviceDate` (required) - Date of service (YYYY-MM-DD)
- `pax` (optional) - Number of participants
- `nights` (optional) - Number of nights (for hotels)
- `days` (optional) - Number of days (for vehicles/guides)
- `distance` (optional) - Distance in km (for transfers)
- `hours` (optional) - Duration in hours (for transfers/guides)
- `children` (optional) - Number of children

**Example Requests:**

**Hotel Quote:**
```json
POST /api/v1/pricing/quote
{
  "serviceOfferingId": 1,
  "serviceDate": "2025-07-15",
  "pax": 2,
  "nights": 3
}
```

**Transfer Quote:**
```json
POST /api/v1/pricing/quote
{
  "serviceOfferingId": 2,
  "serviceDate": "2025-07-15",
  "distance": 65,
  "hours": 1.5
}
```

**Activity Quote:**
```json
POST /api/v1/pricing/quote
{
  "serviceOfferingId": 5,
  "serviceDate": "2025-07-15",
  "pax": 6,
  "children": 2
}
```

**Example Response:**
```json
{
  "serviceOfferingId": 1,
  "serviceType": "HOTEL_ROOM",
  "serviceTitle": "Grand Hotel Istanbul - Deluxe Room",
  "supplier": "Acme Hotels Ltd.",
  "serviceDate": "2025-07-15",
  "details": {
    "hotelName": "Grand Hotel Istanbul",
    "roomType": "DBL",
    "boardType": "BB",
    "nights": 3,
    "rooms": 1,
    "pax": 2
  },
  "pricing": {
    "rateId": 42,
    "pricingModel": "PER_ROOM_NIGHT",
    "unitCostTry": 3500.00,
    "quantity": 3,
    "baseCostTry": 10500.00,
    "totalCostTry": 10500.00
  }
}
```

---

## Pricing Models

Different service types support different pricing models:

### Hotel Rooms
- `PER_ROOM_NIGHT` - Price per room per night
- `PER_PERSON_NIGHT` - Price per person per night

### Transfers
- `PER_TRANSFER` - Fixed price per transfer
- `PER_KM` - Price per kilometer
- `PER_HOUR` - Price per hour

### Vehicles
- `PER_DAY` - Price per day
- `PER_KM` - Price per kilometer

### Guides
- `PER_DAY` - Price per full day
- `PER_HOUR` - Price per hour

### Activities
- `PER_PERSON` - Price per participant
- `PER_GROUP` - Fixed price per group

---

## Rate Resolution Logic

When calculating quotes, the system:

1. Finds the service offering
2. Searches for active rates where:
   - `seasonFrom ≤ serviceDate ≤ seasonTo`
   - `isActive = true`
   - Matches the tenant
3. Applies the most recent rate (highest ID) if multiple match
4. Calculates based on pricing model and service-specific rules

---

## Multi-Tenancy

All endpoints are tenant-isolated. The system automatically:
- Filters all queries by `tenantId` from the JWT token
- Prevents cross-tenant data access
- Ensures data privacy between different tour operator companies

---

## Error Responses

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Service offering not found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["serviceOfferingId must be an integer number"],
  "error": "Bad Request"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Hotel details already exist for this service offering"
}
```

---

## Best Practices

1. **Create services in order:**
   - Party → Supplier → Service Offering → Details → Rates

2. **Season management:**
   - Avoid overlapping seasons for the same offering
   - Use date ranges that align with business seasons

3. **Rate updates:**
   - Create new rates instead of updating existing ones for audit trail
   - Mark old rates as `isActive: false` instead of deleting

4. **Pricing quotes:**
   - Always quote with specific dates to get accurate seasonal pricing
   - Check for rate availability before booking

5. **Search optimization:**
   - Use type filters to narrow results
   - Leverage the search endpoints for auto-complete features

---

## API Versioning

Current version: **v1**

Base path includes version: `/api/v1/*`

---

## Interactive Documentation

Swagger/OpenAPI documentation available at:
```
http://localhost:3001/api/docs
```

---

## Support

For questions or issues, please contact the development team or refer to the codebase documentation.
