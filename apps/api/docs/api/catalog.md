# Catalog API (Quote Building)

## Overview

The Catalog API provides fast quote building capabilities with integrated Google Places data. This is part of the **Quotation/Catalog System** in the hybrid architecture, optimized for quick searches and price lookups during the quote creation process.

**Base URL**: `/api/v1/catalog`

**Authentication**: All endpoints require Bearer token authentication (JWT)

**Multi-Tenancy**: All data is automatically filtered by `tenantId` from the JWT token

---

## Table of Contents

- [Key Features](#key-features)
- [Endpoints](#endpoints)
  - [Get Cities](#get-cities)
  - [Get Hotels](#get-hotels)
  - [Get Tours](#get-tours)
  - [Get Transfers](#get-transfers)
- [Data Models](#data-models)
- [Google Places Integration](#google-places-integration)
- [Pricing Logic](#pricing-logic)
- [Example Workflows](#example-workflows)

---

## Key Features

- **Google Places Integration**: Hotels and tours include Google Maps data (coordinates, photos, ratings)
- **City-based Search**: Fast filtering by destination city
- **Date-based Pricing**: Automatic season detection and rate application
- **Category Filtering**: Filter hotels by star rating and boutique status
- **Tour Type Filtering**: SIC (Seat-in-Coach) vs Private tours
- **Lightweight**: Optimized for quick quote building (not full supplier details)

---

## Endpoints

### Get Cities

Retrieve all available cities for quote building.

**Endpoint**: `GET /api/v1/catalog/cities`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters**:
- `includeAirports` (optional): Include airport codes (default: `false`)

**Example Request**:
```
GET /api/v1/catalog/cities?includeAirports=true
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Istanbul",
      "country": "Turkey",
      "airportCode": "IST",
      "latitude": 41.0082,
      "longitude": 28.9784,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Cappadocia",
      "country": "Turkey",
      "airportCode": "NAV",
      "latitude": 38.6432,
      "longitude": 34.8287,
      "isActive": true
    },
    {
      "id": 3,
      "name": "Antalya",
      "country": "Turkey",
      "airportCode": "AYT",
      "isActive": true
    }
  ]
}
```

**Use Case**: Populate city dropdowns in quote builder interface.

---

### Get Hotels

Search hotels for a specific city with pricing based on dates.

**Endpoint**: `GET /api/v1/catalog/hotels`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters** (all required unless marked optional):
- `cityId` (required): City ID (integer)
- `startDate` (required): Check-in date (ISO 8601 format: `YYYY-MM-DD`)
- `endDate` (required): Check-out date (ISO 8601 format: `YYYY-MM-DD`)
- `category` (optional): Hotel category (e.g., "3 stars", "4 stars", "5 stars")
- `isBoutique` (optional): Filter boutique hotels (boolean, default: `false`)

**Example Request**:
```
GET /api/v1/catalog/hotels?cityId=1&startDate=2025-06-01&endDate=2025-06-05&category=5%20stars
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Four Seasons Bosphorus",
      "cityId": 1,
      "category": "5 stars",
      "isBoutique": false,
      "googlePlaceId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "latitude": 41.0439,
      "longitude": 29.0011,
      "googleMapsUrl": "https://maps.google.com/?cid=123456789",
      "rating": 4.7,
      "userRatingsTotal": 1234,
      "photoUrl1": "https://maps.googleapis.com/maps/api/place/photo?...",
      "photoUrl2": "https://maps.googleapis.com/maps/api/place/photo?...",
      "photoUrl3": "https://maps.googleapis.com/maps/api/place/photo?...",
      "city": {
        "id": 1,
        "name": "Istanbul",
        "country": "Turkey"
      },
      "pricing": {
        "seasonName": "Summer 2025",
        "ppDblRate": 250.00,
        "ppSglRate": 400.00,
        "ppTrpRate": 200.00,
        "currency": "USD"
      }
    },
    {
      "id": 2,
      "name": "Ciragan Palace Kempinski",
      "category": "5 stars",
      "rating": 4.8,
      "pricing": {
        "ppDblRate": 350.00,
        "ppSglRate": 550.00,
        "currency": "USD"
      }
    }
  ],
  "count": 2
}
```

**Notes**:
- Pricing is calculated based on the date range (season detection)
- Only active hotels with valid pricing are returned
- Results include Google Places data if available

---

### Get Tours

Search tours (SIC or Private) for a specific city.

**Endpoint**: `GET /api/v1/catalog/tours`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters**:
- `cityId` (required): City ID (integer)
- `startDate` (required): Tour start date (ISO 8601 format)
- `endDate` (required): Tour end date (ISO 8601 format)
- `tourType` (optional): Filter by type (`SIC` or `PRIVATE`)

**Example Request**:
```
GET /api/v1/catalog/tours?cityId=1&startDate=2025-06-01&endDate=2025-06-05&tourType=SIC
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Full Day Bosphorus Cruise & Asian Side Tour",
      "description": "Explore the stunning Bosphorus by boat and discover the Asian side of Istanbul",
      "cityId": 1,
      "tourType": "SIC",
      "duration": "8 hours",
      "googlePlaceId": "ChIJBXGeQ3OvEmsRxUPBWxTU1GA",
      "latitude": 41.0255,
      "longitude": 28.9742,
      "rating": 4.6,
      "userRatingsTotal": 856,
      "photoUrl1": "https://maps.googleapis.com/maps/api/place/photo?...",
      "city": {
        "id": 1,
        "name": "Istanbul"
      },
      "pricing": [
        {
          "pax": 2,
          "ppRate": 85.00,
          "currency": "USD"
        },
        {
          "pax": 4,
          "ppRate": 70.00,
          "currency": "USD"
        },
        {
          "pax": 6,
          "ppRate": 60.00,
          "currency": "USD"
        }
      ]
    },
    {
      "id": 2,
      "name": "Private Topkapi Palace & Hagia Sophia Tour",
      "tourType": "PRIVATE",
      "duration": "4 hours",
      "rating": 4.9,
      "pricing": [
        {
          "pax": 2,
          "ppRate": 150.00
        }
      ]
    }
  ],
  "count": 2
}
```

**Notes**:
- Tours have PAX-based pricing (2, 4, 6, 8, 10 people)
- SIC tours have fixed departure times
- Private tours can be customized

---

### Get Transfers

Search intercity transfers between two cities.

**Endpoint**: `GET /api/v1/catalog/transfers`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters**:
- `fromCityId` (required): Origin city ID (integer)
- `toCityId` (required): Destination city ID (integer)
- `startDate` (required): Transfer date (ISO 8601 format)
- `endDate` (required): End date for season detection

**Example Request**:
```
GET /api/v1/catalog/transfers?fromCityId=1&toCityId=2&startDate=2025-06-01&endDate=2025-06-01
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fromCityId": 1,
      "toCityId": 2,
      "vehicleType": "Mercedes Vito",
      "capacity": 6,
      "price": 250.00,
      "currency": "USD",
      "duration": "6 hours",
      "distance": 730,
      "fromCity": {
        "id": 1,
        "name": "Istanbul"
      },
      "toCity": {
        "id": 2,
        "name": "Cappadocia"
      }
    },
    {
      "id": 2,
      "vehicleType": "Mercedes Sprinter",
      "capacity": 14,
      "price": 350.00,
      "duration": "6 hours"
    }
  ],
  "count": 2
}
```

**Notes**:
- Transfers are priced per vehicle (not per person)
- Distance is in kilometers
- Duration includes estimated travel time

---

## Data Models

### QuoteHotel Object

```typescript
interface QuoteHotel {
  id: number;
  tenantId: number;
  supplierId?: number; // Optional link to Supplier Management
  hotelName: string;
  cityId: number;
  category: string; // "3 stars", "4 stars", "5 stars"
  isBoutique: boolean;

  // Google Places Integration
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  rating?: number; // 0.0 - 5.0
  userRatingsTotal?: number;
  photoUrl1?: string;
  photoUrl2?: string;
  photoUrl3?: string;
  editorial_summary?: string;
  placeTypes?: string[]; // ["hotel", "lodging", "point_of_interest"]

  isActive: boolean;

  // Relations
  city?: City;
  pricing?: QuoteHotelPricing[];
}
```

### QuoteHotelPricing Object

```typescript
interface QuoteHotelPricing {
  id: number;
  quoteHotelId: number;
  seasonName: string;
  validFrom: Date;
  validTo: Date;

  // Per-person rates
  ppDblRate: number; // Double occupancy
  ppSglRate: number; // Single occupancy
  ppTrpRate?: number; // Triple occupancy
  ppChildRate?: number;

  currency: string; // Default: 'USD'

  // Optional fields
  minimumStay?: number;
  allotment?: number;
  releaseDays?: number;
}
```

### SICTour Object

```typescript
interface SICTour {
  id: number;
  tenantId: number;
  name: string;
  description?: string;
  cityId: number;
  tourType: 'SIC' | 'PRIVATE';
  duration?: string; // "8 hours", "Full Day"

  // Google Places Integration
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl1?: string;

  isActive: boolean;

  // Relations
  city?: City;
  pricing?: SICTourPricing[];
}
```

### SICTourPricing Object

```typescript
interface SICTourPricing {
  id: number;
  sicTourId: number;
  validFrom: Date;
  validTo: Date;

  // PAX-based pricing
  pax: number; // 2, 4, 6, 8, 10
  ppRate: number; // Per-person rate

  currency: string; // Default: 'USD'
}
```

### IntercityTransfer Object

```typescript
interface IntercityTransfer {
  id: number;
  tenantId: number;
  fromCityId: number;
  toCityId: number;
  vehicleType: string; // "Mercedes Vito", "Mercedes Sprinter"
  capacity: number;
  price: number; // Total price (not per person)
  currency: string;
  duration?: string; // "6 hours"
  distance?: number; // kilometers
  isActive: boolean;

  // Relations
  fromCity?: City;
  toCity?: City;
}
```

---

## Google Places Integration

The Catalog system integrates with Google Places API to provide rich location data:

### Available Google Data

- **googlePlaceId**: Unique identifier from Google
- **Coordinates**: `latitude` and `longitude` for map display
- **googleMapsUrl**: Direct link to view on Google Maps
- **Photos**: Up to 3 photo URLs from Google Places
- **Rating**: Average rating (0.0 - 5.0)
- **userRatingsTotal**: Number of Google reviews
- **editorial_summary**: AI-generated description from Google
- **placeTypes**: Categories (e.g., "hotel", "tourist_attraction")

### Example Usage

```javascript
// Display hotel on map
const map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: hotel.latitude, lng: hotel.longitude },
  zoom: 15
});

// Open in Google Maps
window.open(hotel.googleMapsUrl, '_blank');

// Display rating
console.log(`${hotel.rating}⭐ (${hotel.userRatingsTotal} reviews)`);
```

---

## Pricing Logic

### Season Detection

The API automatically selects the correct pricing based on the date range:

1. Compares `startDate` and `endDate` with pricing records
2. Matches against `validFrom` and `validTo` dates
3. Returns the first matching season's rates
4. If no match found, hotel/tour is excluded from results

### Hotel Pricing Formula

```
Per-Person Double Rate: ppDblRate
Per-Person Single Rate: ppSglRate
Per-Person Triple Rate: ppTrpRate (optional)

Total Cost = (numberOfNights × numberOfGuests × ppRate)
```

### Tour Pricing Formula

```
PAX-based pricing (tiered):
- 2 PAX: $85/person
- 4 PAX: $70/person
- 6 PAX: $60/person

Total Cost = (numberOfPeople × ppRate for matching PAX tier)
```

### Transfer Pricing

```
Flat rate per vehicle:
- Mercedes Vito (6 pax): $250
- Mercedes Sprinter (14 pax): $350

Total Cost = price (not multiplied by passengers)
```

---

## Example Workflows

### 1. Build a Multi-City Quote

```bash
# Step 1: Get available cities
GET /api/v1/catalog/cities
# Response: [Istanbul (id: 1), Cappadocia (id: 2), Antalya (id: 3)]

# Step 2: Search hotels in Istanbul
GET /api/v1/catalog/hotels?cityId=1&startDate=2025-06-01&endDate=2025-06-03&category=5%20stars
# Response: [Four Seasons ($250/person), Ciragan Palace ($350/person)]

# Step 3: Search tours in Istanbul
GET /api/v1/catalog/tours?cityId=1&startDate=2025-06-02&endDate=2025-06-02&tourType=SIC
# Response: [Bosphorus Cruise ($85/person for 2 pax)]

# Step 4: Search transfer Istanbul → Cappadocia
GET /api/v1/catalog/transfers?fromCityId=1&toCityId=2&startDate=2025-06-03&endDate=2025-06-03
# Response: [Mercedes Vito ($250 total)]

# Step 5: Search hotels in Cappadocia
GET /api/v1/catalog/hotels?cityId=2&startDate=2025-06-03&endDate=2025-06-05
# Response: [Cave Hotels...]

# Total Quote Calculation:
# - Hotel Istanbul: 2 nights × 2 people × $250 = $1,000
# - Tour Bosphorus: 2 people × $85 = $170
# - Transfer: $250
# - Hotel Cappadocia: 2 nights × 2 people × $180 = $720
# Total: $2,140 + markup + tax
```

### 2. Compare Hotel Options

```bash
# Get all 5-star hotels
GET /api/v1/catalog/hotels?cityId=1&startDate=2025-07-01&endDate=2025-07-05&category=5%20stars

# Get boutique hotels
GET /api/v1/catalog/hotels?cityId=1&startDate=2025-07-01&endDate=2025-07-05&isBoutique=true

# Sort by rating or price in frontend
```

### 3. Check Tour Availability

```bash
# Get all SIC tours
GET /api/v1/catalog/tours?cityId=1&startDate=2025-06-15&endDate=2025-06-15&tourType=SIC

# Get private tours only
GET /api/v1/catalog/tours?cityId=1&startDate=2025-06-15&endDate=2025-06-15&tourType=PRIVATE
```

---

## Differences from Supplier Management API

| Feature | Catalog API | Supplier Management API |
|---------|-------------|------------------------|
| **Purpose** | Fast quote building | Backend supplier contracts |
| **Google Integration** | ✅ Yes (Places, photos, ratings) | ❌ No |
| **Pricing** | Simplified seasonal rates | Detailed rate cards with allotments |
| **Response Time** | Fast (optimized for UI) | Slower (comprehensive data) |
| **Use Case** | Sales/agents building quotes | Operations managing contracts |
| **Data Volume** | Lightweight | Full supplier details |
| **Tables** | QuoteHotel, SICTour | ServiceOffering, HotelRoom |

**Integration Point**: `QuoteHotel.supplierId` links to `Supplier.id` for hybrid workflows.

---

## Performance Tips

1. **Cache city list**: Cities rarely change, cache on frontend
2. **Debounce searches**: Wait 300ms after user stops typing
3. **Lazy load photos**: Load Google Places photos on demand
4. **Limit date ranges**: Restrict to ±2 years for faster queries
5. **Use filters**: Always specify `category` or `tourType` when possible

---

## Related APIs

- [Supplier Management API](./suppliers.md) - Backend supplier contracts and detailed specs
- [Customer Itineraries API](./customer-itineraries.md) - AI itinerary generation using this catalog
- [Manual Quotes API](./manual-quotes.md) - Build custom quotes using catalog data

See [Architecture Documentation](../ARCHITECTURE.md) for system overview.

---

## Support

For questions about the Catalog API, contact the API team or see the [Architecture Documentation](../ARCHITECTURE.md).
