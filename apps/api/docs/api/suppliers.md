# Supplier Management API

## Overview

The Supplier Management API provides comprehensive backend operations for managing supplier relationships, contracts, and detailed service information. This is part of the **Supplier Management System** in the hybrid architecture.

**Base URL**: `/api/v1/suppliers`

**Authentication**: All endpoints require Bearer token authentication (JWT)

**Multi-Tenancy**: All data is automatically filtered by `tenantId` from the JWT token

---

## Table of Contents

- [Supplier Types](#supplier-types)
- [Endpoints](#endpoints)
  - [Create Supplier](#create-supplier)
  - [Get All Suppliers](#get-all-suppliers)
  - [Get Supplier Statistics](#get-supplier-statistics)
  - [Search Suppliers](#search-suppliers)
  - [Get Suppliers by Type](#get-suppliers-by-type)
  - [Get Supplier by ID](#get-supplier-by-id)
  - [Update Supplier](#update-supplier)
  - [Delete Supplier](#delete-supplier)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Supplier Types

Suppliers can be categorized into the following types:

```typescript
enum SupplierType {
  HOTEL = 'HOTEL',
  TOUR_OPERATOR = 'TOUR_OPERATOR',
  TRANSFER_COMPANY = 'TRANSFER_COMPANY',
  RESTAURANT = 'RESTAURANT',
  ATTRACTION = 'ATTRACTION',
  VEHICLE_RENTAL = 'VEHICLE_RENTAL',
  GUIDE = 'GUIDE',
  OTHER = 'OTHER'
}
```

---

## Endpoints

### Create Supplier

Create a new supplier linked to an existing party.

**Endpoint**: `POST /api/v1/suppliers`

**Authorization**: `OWNER`, `ADMIN`

**Request Body**:
```json
{
  "partyId": 1,
  "type": "HOTEL",
  "bankName": "Garanti BBVA",
  "bankAccountNo": "1234567890",
  "bankIban": "TR330006100519786457841326",
  "bankSwift": "TGBATRIS",
  "paymentTerms": "Net 30 days",
  "defaultCurrency": "TRY",
  "creditLimit": 100000.00,
  "commissionPct": 10.00,
  "isActive": true
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "tenantId": 1,
  "partyId": 1,
  "type": "HOTEL",
  "bankName": "Garanti BBVA",
  "bankAccountNo": "1234567890",
  "bankIban": "TR330006100519786457841326",
  "bankSwift": "TGBATRIS",
  "paymentTerms": "Net 30 days",
  "defaultCurrency": "TRY",
  "creditLimit": 100000.00,
  "commissionPct": 10.00,
  "isActive": true,
  "createdAt": "2025-04-01T10:00:00Z",
  "updatedAt": "2025-04-01T10:00:00Z",
  "party": {
    "id": 1,
    "name": "Grand Istanbul Hotel",
    "city": "Istanbul",
    "country": "Turkey",
    "contacts": [
      {
        "id": 1,
        "name": "Ahmet Yilmaz",
        "email": "reservations@grandistanbul.com",
        "phone": "+90 212 555 1234",
        "isPrimary": true
      }
    ]
  },
  "serviceOfferings": []
}
```

**Errors**:
- `400 Bad Request`: Party not found or doesn't belong to tenant
- `409 Conflict`: Supplier already exists for this party
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User doesn't have required role

---

### Get All Suppliers

Retrieve all suppliers with optional filtering by type and active status.

**Endpoint**: `GET /api/v1/suppliers`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters**:
- `type` (optional): Filter by supplier type (enum: `HOTEL`, `TOUR_OPERATOR`, etc.)
- `includeInactive` (optional): Include inactive suppliers (default: `false`)

**Example Request**:
```
GET /api/v1/suppliers?type=HOTEL&includeInactive=false
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "tenantId": 1,
    "partyId": 1,
    "type": "HOTEL",
    "bankName": "Garanti BBVA",
    "paymentTerms": "Net 30 days",
    "defaultCurrency": "TRY",
    "commissionPct": 10.00,
    "isActive": true,
    "party": {
      "id": 1,
      "name": "Grand Istanbul Hotel",
      "city": "Istanbul",
      "country": "Turkey",
      "contacts": [
        {
          "id": 1,
          "name": "Ahmet Yilmaz",
          "email": "reservations@grandistanbul.com",
          "isPrimary": true
        }
      ]
    },
    "_count": {
      "serviceOfferings": 12
    }
  },
  {
    "id": 2,
    "type": "HOTEL",
    "party": {
      "name": "Cappadocia Cave Suites",
      "city": "Cappadocia"
    },
    "_count": {
      "serviceOfferings": 8
    }
  }
]
```

---

### Get Supplier Statistics

Get count of suppliers grouped by type.

**Endpoint**: `GET /api/v1/suppliers/stats`

**Authorization**: `OWNER`, `ADMIN`

**Response** (200 OK):
```json
[
  {
    "type": "HOTEL",
    "_count": {
      "id": 45
    }
  },
  {
    "type": "TOUR_OPERATOR",
    "_count": {
      "id": 23
    }
  },
  {
    "type": "TRANSFER_COMPANY",
    "_count": {
      "id": 12
    }
  },
  {
    "type": "GUIDE",
    "_count": {
      "id": 34
    }
  }
]
```

**Use Case**: Display dashboard statistics or reports.

---

### Search Suppliers

Search suppliers by name, city, or country.

**Endpoint**: `GET /api/v1/suppliers/search`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Query Parameters**:
- `q` (required): Search term
- `type` (optional): Filter by supplier type

**Example Request**:
```
GET /api/v1/suppliers/search?q=istanbul&type=HOTEL
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "type": "HOTEL",
    "isActive": true,
    "party": {
      "id": 1,
      "name": "Grand Istanbul Hotel",
      "city": "Istanbul",
      "country": "Turkey"
    }
  },
  {
    "id": 5,
    "type": "HOTEL",
    "isActive": true,
    "party": {
      "id": 5,
      "name": "Istanbul Palace Hotel",
      "city": "Istanbul",
      "country": "Turkey"
    }
  }
]
```

**Note**: Returns maximum 20 results, ordered by party name.

---

### Get Suppliers by Type

Get all suppliers of a specific type.

**Endpoint**: `GET /api/v1/suppliers/by-type/:type`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Path Parameters**:
- `type`: Supplier type (enum)

**Example Request**:
```
GET /api/v1/suppliers/by-type/HOTEL
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "type": "HOTEL",
    "isActive": true,
    "party": {
      "id": 1,
      "name": "Grand Istanbul Hotel",
      "city": "Istanbul",
      "country": "Turkey"
    },
    "_count": {
      "serviceOfferings": 12
    }
  }
]
```

---

### Get Supplier by ID

Get detailed supplier information including service offerings and rates.

**Endpoint**: `GET /api/v1/suppliers/:id`

**Authorization**: `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`

**Path Parameters**:
- `id`: Supplier ID (integer)

**Example Request**:
```
GET /api/v1/suppliers/1
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "tenantId": 1,
  "partyId": 1,
  "type": "HOTEL",
  "bankName": "Garanti BBVA",
  "bankAccountNo": "1234567890",
  "bankIban": "TR330006100519786457841326",
  "bankSwift": "TGBATRIS",
  "paymentTerms": "Net 30 days",
  "defaultCurrency": "TRY",
  "creditLimit": 100000.00,
  "commissionPct": 10.00,
  "isActive": true,
  "createdAt": "2025-04-01T10:00:00Z",
  "updatedAt": "2025-04-01T10:00:00Z",
  "party": {
    "id": 1,
    "name": "Grand Istanbul Hotel",
    "city": "Istanbul",
    "country": "Turkey",
    "contacts": [
      {
        "id": 1,
        "name": "Ahmet Yilmaz",
        "email": "reservations@grandistanbul.com",
        "phone": "+90 212 555 1234",
        "isPrimary": true,
        "isActive": true
      },
      {
        "id": 2,
        "name": "Fatma Demir",
        "email": "accounting@grandistanbul.com",
        "phone": "+90 212 555 1235",
        "isPrimary": false,
        "isActive": true
      }
    ]
  },
  "serviceOfferings": [
    {
      "id": 1,
      "title": "Deluxe Room with Bosphorus View",
      "serviceType": "HOTEL_ROOM",
      "location": "Istanbul, Besiktas",
      "isActive": true,
      "hotelRoom": {
        "id": 1,
        "stars": 5,
        "roomType": "Deluxe",
        "capacity": 2,
        "amenities": ["WiFi", "Air Conditioning", "Minibar", "Safe"]
      },
      "_count": {
        "hotelRoomRates": 3
      }
    }
  ]
}
```

**Errors**:
- `404 Not Found`: Supplier not found or doesn't belong to tenant

---

### Update Supplier

Update supplier details.

**Endpoint**: `PATCH /api/v1/suppliers/:id`

**Authorization**: `OWNER`, `ADMIN`

**Path Parameters**:
- `id`: Supplier ID (integer)

**Request Body** (all fields optional):
```json
{
  "bankName": "Updated Bank Name",
  "paymentTerms": "Net 45 days",
  "commissionPct": 12.00,
  "isActive": true
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "tenantId": 1,
  "partyId": 1,
  "type": "HOTEL",
  "bankName": "Updated Bank Name",
  "paymentTerms": "Net 45 days",
  "commissionPct": 12.00,
  "isActive": true,
  "party": {
    "id": 1,
    "name": "Grand Istanbul Hotel",
    "contacts": []
  }
}
```

**Errors**:
- `404 Not Found`: Supplier not found

---

### Delete Supplier

Soft delete a supplier (sets `isActive` to `false`).

**Endpoint**: `DELETE /api/v1/suppliers/:id`

**Authorization**: `OWNER`, `ADMIN`

**Path Parameters**:
- `id`: Supplier ID (integer)

**Response** (200 OK):
```json
{
  "id": 1,
  "isActive": false,
  "message": "Supplier soft deleted successfully"
}
```

**Note**: This is a soft delete. The supplier record remains in the database but is marked as inactive.

**Errors**:
- `404 Not Found`: Supplier not found

---

## Data Models

### Supplier Object

```typescript
interface Supplier {
  id: number;
  tenantId: number;
  partyId: number;
  type: SupplierType;
  bankName?: string;
  bankAccountNo?: string;
  bankIban?: string;
  bankSwift?: string;
  paymentTerms?: string;
  defaultCurrency: string; // Default: 'TRY'
  creditLimit?: number;
  commissionPct: number; // Default: 0
  isActive: boolean; // Default: true
  createdAt: Date;
  updatedAt: Date;

  // Relations
  party?: Party;
  serviceOfferings?: ServiceOffering[];
}
```

### Party Object

```typescript
interface Party {
  id: number;
  tenantId: number;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;

  // Relations
  contacts?: Contact[];
}
```

### Contact Object

```typescript
interface Contact {
  id: number;
  partyId: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string; // e.g., "Reservations Manager", "Accounting"
  isPrimary: boolean;
  isActive: boolean;
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User doesn't have required permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists

---

## Related Systems

This API is part of the **Supplier Management System**. For quote building, see:
- [Catalog API](./catalog.md) - Fast quote building with Google Places integration
- [Customer Itineraries API](./customer-itineraries.md) - AI itinerary generation

See [Architecture Documentation](../ARCHITECTURE.md) for how these systems work together.

---

## Best Practices

1. **Always create a Party first** before creating a Supplier
2. **Use the search endpoint** for autocomplete/typeahead features
3. **Use type filtering** when displaying supplier lists in dropdowns
4. **Store supplier IDs** in ServiceOfferings for detailed rate management
5. **Link to Catalog** via `QuoteHotel.supplierId` for integrated quote building
6. **Soft deletes only** - never hard delete suppliers with existing bookings

---

## Example Workflows

### 1. Add New Hotel Supplier

```bash
# Step 1: Create Party
POST /api/v1/parties
{
  "name": "Anatolian Hotels Group",
  "city": "Istanbul",
  "country": "Turkey",
  "email": "info@anatolianhotels.com",
  "phone": "+90 212 555 7890"
}
# Response: { "id": 10 }

# Step 2: Create Supplier
POST /api/v1/suppliers
{
  "partyId": 10,
  "type": "HOTEL",
  "bankIban": "TR330006100519786457841326",
  "paymentTerms": "Net 30 days",
  "defaultCurrency": "TRY",
  "commissionPct": 10.00
}

# Step 3: Add Service Offerings (HotelRooms)
POST /api/v1/catalog (Service Offerings API - see separate docs)
```

### 2. Search for Transfer Companies

```bash
GET /api/v1/suppliers/search?q=airport&type=TRANSFER_COMPANY
Authorization: Bearer <jwt_token>
```

### 3. Get All Hotel Suppliers for Dropdown

```bash
GET /api/v1/suppliers/by-type/HOTEL
Authorization: Bearer <jwt_token>
```

---

## Support

For questions or issues with the Supplier Management API, contact the API team or see the main [Architecture Documentation](../ARCHITECTURE.md).
