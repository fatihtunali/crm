# Customer Itineraries API (AI Generation)

## Overview

The Customer Itineraries API provides AI-powered itinerary generation for customers. This **public-facing** system allows customers to request customized travel itineraries which are then reviewed and processed by agents.

**Base URL**: `/api/v1/customer-itineraries`

**Authentication**: Mixed (some endpoints public, some protected)

**Multi-Tenancy**: Uses `tenantId` parameter for public endpoints, JWT for protected endpoints

---

## Table of Contents

- [System Flow](#system-flow)
- [Public Endpoints](#public-endpoints) (Customer-Facing)
  - [Generate Itinerary](#generate-itinerary)
  - [View Itinerary](#view-itinerary)
  - [Request Booking](#request-booking)
- [Protected Endpoints](#protected-endpoints) (Agent-Facing)
  - [Get All Itineraries](#get-all-itineraries)
  - [Get Itinerary by ID](#get-itinerary-by-id)
  - [Update Status](#update-status)
  - [Convert to Manual Quote](#convert-to-manual-quote)
- [Data Models](#data-models)
- [AI Generation Logic](#ai-generation-logic)
- [Status Flow](#status-flow)

---

## System Flow

```
Customer (Public Portal)
    │
    ├─> POST /generate (with preferences)
    │       │
    │       ├─> AI algorithm queries Catalog
    │       ├─> Builds day-by-day itinerary
    │       ├─> Calculates pricing (15% markup + 8% tax)
    │       ├─> Creates CustomerItinerary with UUID
    │       └─> Returns UUID to customer
    │
    ├─> GET /view/:uuid (customer views itinerary)
    │       └─> Shows full itinerary with pricing
    │
    └─> POST /view/:uuid/request-booking
            └─> Status: PENDING → CONFIRMED
            └─> Notifies agents

Agent Dashboard (Protected)
    │
    ├─> GET /customer-itineraries (list all requests)
    │
    ├─> GET /customer-itineraries/:id (review details)
    │
    ├─> Option 1: PUT /:uuid/status (approve as-is)
    │       └─> Status: CONFIRMED → BOOKED
    │
    └─> Option 2: POST /:id/convert-to-quote
            ├─> Creates ManualQuote
            ├─> Copies days and expenses
            └─> Agent can customize pricing
```

---

## Public Endpoints

These endpoints do **NOT** require authentication and are accessible to customers via public portal.

### Generate Itinerary

Generate an AI-powered itinerary based on customer preferences.

**Endpoint**: `POST /api/v1/customer-itineraries/generate`

**Authentication**: None (Public)

**Query Parameters**:
- `tenantId` (required): Tenant ID (integer) - identifies which tour operator

**Request Body**:
```json
{
  "customerName": "John Smith",
  "customerEmail": "john.smith@example.com",
  "customerPhone": "+1 555-123-4567",
  "destination": "Turkey",
  "startDate": "2025-06-15",
  "endDate": "2025-06-22",
  "adults": 2,
  "children": 0,
  "hotelCategory": "5 stars",
  "cityNights": "Istanbul:3,Cappadocia:2,Antalya:2",
  "specialRequests": "Prefer hotels with Bosphorus view"
}
```

**Response** (201 Created):
```json
{
  "id": 123,
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tenantId": 1,
  "customerName": "John Smith",
  "customerEmail": "john.smith@example.com",
  "customerPhone": "+1 555-123-4567",
  "destination": "Turkey",
  "startDate": "2025-06-15",
  "endDate": "2025-06-22",
  "adults": 2,
  "children": 0,
  "hotelCategory": "5 stars",
  "cityNights": "Istanbul:3,Cappadocia:2,Antalya:2",
  "specialRequests": "Prefer hotels with Bosphorus view",
  "status": "PENDING",
  "source": "ONLINE",
  "totalPrice": 4250.00,
  "pricePerPerson": 2125.00,
  "currency": "USD",
  "itineraryData": {
    "days": [...],
    "hotels": [...],
    "tours": [...],
    "transfers": [...]
  },
  "createdAt": "2025-04-01T10:00:00Z"
}
```

**Customer receives**: `uuid` to view/track their itinerary

**Notes**:
- AI algorithm uses `cityNights` to build itinerary (e.g., "Istanbul:3,Cappadocia:2")
- Queries Catalog API for hotels, tours, and transfers
- Applies 15% markup + 8% tax to catalog prices
- Returns UUID for customer to view itinerary

---

### View Itinerary

View a generated itinerary using its UUID.

**Endpoint**: `GET /api/v1/customer-itineraries/view/:uuid`

**Authentication**: None (Public)

**Path Parameters**:
- `uuid`: Itinerary UUID (string)

**Example Request**:
```
GET /api/v1/customer-itineraries/view/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response** (200 OK):
```json
{
  "id": 123,
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerName": "John Smith",
  "destination": "Turkey",
  "startDate": "2025-06-15",
  "endDate": "2025-06-22",
  "adults": 2,
  "status": "PENDING",
  "totalPrice": 4250.00,
  "pricePerPerson": 2125.00,
  "currency": "USD",
  "itineraryData": {
    "days": [
      {
        "dayNumber": 1,
        "date": "2025-06-15",
        "city": "Istanbul",
        "activities": [
          {
            "type": "hotel",
            "name": "Four Seasons Bosphorus",
            "description": "Check-in to luxury 5-star hotel",
            "price": 500.00
          }
        ],
        "totalCost": 500.00
      },
      {
        "dayNumber": 2,
        "date": "2025-06-16",
        "city": "Istanbul",
        "activities": [
          {
            "type": "hotel",
            "name": "Four Seasons Bosphorus",
            "price": 500.00
          },
          {
            "type": "tour",
            "name": "Bosphorus Cruise & Asian Side",
            "description": "Full day tour",
            "duration": "8 hours",
            "price": 170.00
          }
        ],
        "totalCost": 670.00
      }
    ],
    "summary": {
      "totalNights": 7,
      "totalHotelCost": 3500.00,
      "totalToursCost": 340.00,
      "totalTransfersCost": 410.00,
      "subtotal": 4250.00,
      "markup": 637.50,
      "tax": 390.60,
      "grandTotal": 5278.10
    }
  },
  "createdAt": "2025-04-01T10:00:00Z"
}
```

**Use Case**: Customer views their AI-generated itinerary on public portal

---

### Request Booking

Customer requests to book the itinerary (changes status to CONFIRMED).

**Endpoint**: `POST /api/v1/customer-itineraries/view/:uuid/request-booking`

**Authentication**: None (Public)

**Path Parameters**:
- `uuid`: Itinerary UUID (string)

**Example Request**:
```
POST /api/v1/customer-itineraries/view/a1b2c3d4-e5f6-7890-abcd-ef1234567890/request-booking
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Booking request received. Our team will contact you shortly.",
  "itinerary": {
    "id": 123,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "CONFIRMED",
    "updatedAt": "2025-04-01T11:00:00Z"
  }
}
```

**Side Effects**:
- Changes status from `PENDING` → `CONFIRMED`
- Notifies agents (email/dashboard notification)
- Customer receives confirmation email

---

## Protected Endpoints

These endpoints require **Bearer token authentication** and are accessible only to agents/admins.

### Get All Itineraries

List all customer itinerary requests with optional filtering.

**Endpoint**: `GET /api/v1/customer-itineraries`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters** (all optional):
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `status`: Filter by status (`PENDING`, `CONFIRMED`, `BOOKED`, `COMPLETED`, `CANCELLED`)

**Example Request**:
```
GET /api/v1/customer-itineraries?status=CONFIRMED&page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "uuid": "a1b2c3d4...",
      "customerName": "John Smith",
      "customerEmail": "john.smith@example.com",
      "customerPhone": "+1 555-123-4567",
      "destination": "Turkey",
      "startDate": "2025-06-15",
      "endDate": "2025-06-22",
      "adults": 2,
      "children": 0,
      "status": "CONFIRMED",
      "source": "ONLINE",
      "totalPrice": 4250.00,
      "pricePerPerson": 2125.00,
      "createdAt": "2025-04-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Use Case**: Agent dashboard showing all customer requests

---

### Get Itinerary by ID

Get full itinerary details including `itineraryData`.

**Endpoint**: `GET /api/v1/customer-itineraries/:id`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Path Parameters**:
- `id`: Itinerary ID (integer)

**Example Request**:
```
GET /api/v1/customer-itineraries/123
Authorization: Bearer <jwt_token>
```

**Response** (200 OK): Same as View Itinerary (public), but with additional agent fields

---

### Update Status

Update the status of an itinerary.

**Endpoint**: `PUT /api/v1/customer-itineraries/:uuid/status`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Path Parameters**:
- `uuid`: Itinerary UUID (string)

**Request Body**:
```json
{
  "status": "BOOKED",
  "notes": "Booking confirmed, vouchers sent"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "itinerary": {
    "id": 123,
    "uuid": "a1b2c3d4...",
    "status": "BOOKED",
    "notes": "Booking confirmed, vouchers sent",
    "updatedAt": "2025-04-01T15:00:00Z"
  }
}
```

**Valid Status Values**:
- `PENDING` - Initial status
- `CONFIRMED` - Customer requested booking
- `BOOKED` - Agent confirmed booking
- `COMPLETED` - Trip completed
- `CANCELLED` - Booking cancelled

---

### Convert to Manual Quote

Convert an AI-generated itinerary to a customizable manual quote.

**Endpoint**: `POST /api/v1/customer-itineraries/:id/convert-to-quote`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Path Parameters**:
- `id`: Itinerary ID (integer)

**Example Request**:
```
POST /api/v1/customer-itineraries/123/convert-to-quote
Authorization: Bearer <jwt_token>
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Itinerary converted to manual quote successfully",
  "manualQuote": {
    "id": 456,
    "quoteName": "Turkey Tour - John Smith",
    "startDate": "2025-06-15",
    "endDate": "2025-06-22",
    "pax": 2,
    "status": "DRAFT",
    "days": [
      {
        "dayNumber": 1,
        "date": "2025-06-15",
        "expenses": [
          {
            "category": "hotelAccommodation",
            "description": "Four Seasons Bosphorus",
            "price": 250.00
          }
        ]
      }
    ],
    "createdAt": "2025-04-01T16:00:00Z"
  }
}
```

**Use Case**:
- Agent wants to customize pricing or services
- Add/remove services
- Apply different markup/tax rates
- Generate formal quotation document

**Side Effects**:
- Creates new `ManualQuote` record
- Copies all days and expenses from itinerary
- Links back to original itinerary
- Itinerary status remains unchanged

---

## Data Models

### CustomerItinerary Object

```typescript
interface CustomerItinerary {
  id: number;
  uuid: string; // Unique public identifier
  tenantId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  destination: string; // "Turkey", "Greece", etc.
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  hotelCategory?: string; // "3 stars", "4 stars", "5 stars"
  cityNights?: string; // "Istanbul:3,Cappadocia:2"
  specialRequests?: string;

  status: ItineraryStatus;
  source: 'ONLINE' | 'AGENT' | 'API';

  totalPrice?: number;
  pricePerPerson?: number;
  currency: string; // Default: 'USD'

  itineraryData: JSON; // Full day-by-day breakdown

  notes?: string; // Agent notes

  createdAt: Date;
  updatedAt: Date;
}
```

### ItineraryStatus Enum

```typescript
enum ItineraryStatus {
  PENDING = 'PENDING',       // Initial state
  CONFIRMED = 'CONFIRMED',   // Customer requested booking
  BOOKED = 'BOOKED',         // Agent confirmed
  COMPLETED = 'COMPLETED',   // Trip finished
  CANCELLED = 'CANCELLED'    // Cancelled by customer/agent
}
```

### ItineraryData Structure

```typescript
interface ItineraryData {
  days: ItineraryDay[];
  summary: {
    totalNights: number;
    totalHotelCost: number;
    totalToursCost: number;
    totalTransfersCost: number;
    subtotal: number;
    markup: number;
    tax: number;
    grandTotal: number;
  };
}

interface ItineraryDay {
  dayNumber: number;
  date: string; // ISO date
  city: string;
  activities: Activity[];
  totalCost: number;
}

interface Activity {
  type: 'hotel' | 'tour' | 'transfer' | 'meal' | 'other';
  name: string;
  description?: string;
  duration?: string;
  price: number;

  // Optional metadata
  googlePlaceId?: string;
  photoUrl?: string;
  rating?: number;
}
```

---

## AI Generation Logic

The AI itinerary generation is **algorithmic** (not LLM-based):

### Step 1: Parse City Nights

```
Input: "Istanbul:3,Cappadocia:2,Antalya:2"
Output: [
  { city: "Istanbul", nights: 3, cityId: 1 },
  { city: "Cappadocia", nights: 2, cityId: 2 },
  { city: "Antalya", nights: 2, cityId: 3 }
]
```

### Step 2: Query Catalog for Each City

For each city:
- **GET /catalog/hotels** with `hotelCategory` filter
- **GET /catalog/tours** (selects first tour if available)
- **GET /catalog/transfers** between cities

### Step 3: Build Day-by-Day Itinerary

```javascript
days = [];
currentDate = startDate;

for (cityNight in cityNights) {
  // Add hotel for each night
  for (night = 1 to cityNight.nights) {
    days.push({
      dayNumber: days.length + 1,
      date: currentDate,
      city: cityNight.city,
      activities: [
        { type: 'hotel', name: hotel.name, price: hotelRate }
      ]
    });
    currentDate++;
  }

  // Add tour on day 2 of city
  if (cityNight.nights >= 2) {
    days[days.length - 1].activities.push({
      type: 'tour',
      name: tour.name,
      price: tourRate
    });
  }

  // Add transfer to next city
  if (hasNextCity) {
    days[days.length].activities.push({
      type: 'transfer',
      name: `Transfer to ${nextCity}`,
      price: transferRate
    });
  }
}
```

### Step 4: Calculate Pricing

```javascript
subtotal = sum of all activity prices

markup = subtotal × 0.15 (15%)
tax = subtotal × 0.08 (8%)

totalPrice = subtotal + markup + tax
pricePerPerson = totalPrice / adults
```

### Step 5: Store as CustomerItinerary

```javascript
const itinerary = await prisma.customerItinerary.create({
  data: {
    uuid: generateUUID(),
    tenantId,
    customerName,
    itineraryData: { days, summary },
    totalPrice,
    pricePerPerson,
    status: 'PENDING',
    source: 'ONLINE'
  }
});
```

---

## Status Flow

```
PENDING
  │
  ├─> Customer clicks "Request Booking"
  │       └─> CONFIRMED
  │
  └─> Agent reviews
          │
          ├─> Option 1: Approve as-is
          │       └─> PUT /status { status: "BOOKED" }
          │               └─> BOOKED
          │
          ├─> Option 2: Convert to Manual Quote
          │       └─> POST /convert-to-quote
          │               ├─> Creates ManualQuote
          │               └─> Status remains PENDING/CONFIRMED
          │
          └─> Option 3: Cancel
                  └─> PUT /status { status: "CANCELLED" }
                          └─> CANCELLED
```

**After Trip Completes**:
```
BOOKED → COMPLETED (manually updated by agent)
```

---

## Example Workflows

### 1. Customer Journey (Public Portal)

```bash
# Step 1: Customer fills form, submits
POST /api/v1/customer-itineraries/generate?tenantId=1
{
  "customerName": "Sarah Johnson",
  "customerEmail": "sarah@example.com",
  "destination": "Turkey",
  "startDate": "2025-07-01",
  "endDate": "2025-07-08",
  "adults": 2,
  "hotelCategory": "5 stars",
  "cityNights": "Istanbul:3,Cappadocia:2,Pamukkale:2"
}
# Response: { uuid: "abc123..." }

# Step 2: Customer views itinerary
GET /api/v1/customer-itineraries/view/abc123

# Step 3: Customer likes it, requests booking
POST /api/v1/customer-itineraries/view/abc123/request-booking
# Status: PENDING → CONFIRMED
# Agent receives notification
```

### 2. Agent Review Workflow

```bash
# Agent logs in, sees new requests
GET /api/v1/customer-itineraries?status=CONFIRMED
Authorization: Bearer <jwt>

# Agent reviews specific itinerary
GET /api/v1/customer-itineraries/123
Authorization: Bearer <jwt>

# Option A: Approve as-is
PUT /api/v1/customer-itineraries/abc123/status
Authorization: Bearer <jwt>
{ "status": "BOOKED" }

# Option B: Customize it
POST /api/v1/customer-itineraries/123/convert-to-quote
Authorization: Bearer <jwt>
# Creates ManualQuote for customization
```

---

## Error Responses

```json
{
  "statusCode": 404,
  "message": "Itinerary not found",
  "error": "Not Found"
}
```

Common status codes:
- **200 OK**: Success
- **201 Created**: Itinerary generated
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing JWT (protected endpoints)
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Itinerary not found

---

## Related APIs

- [Catalog API](./catalog.md) - Used by AI algorithm to query hotels/tours
- [Manual Quotes API](./manual-quotes.md) - Where itineraries can be converted
- [Supplier Management API](./suppliers.md) - Backend supplier contracts

See [Architecture Documentation](../ARCHITECTURE.md) for system overview.

---

## Future Enhancements

- **Real AI Integration**: Use Claude/GPT for smarter itinerary generation
- **Availability Checking**: Real-time hotel/tour availability
- **Dynamic Pricing**: Adjust markup based on season/demand
- **Customer Portal**: Full self-service booking platform
- **Payment Integration**: Online payment for bookings

---

## Support

For questions about Customer Itineraries API, contact the API team or see [Architecture Documentation](../ARCHITECTURE.md).
