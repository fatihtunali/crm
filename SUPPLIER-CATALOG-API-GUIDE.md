# Supplier Catalog API Guide

**Server:** http://localhost:3000
**Base URL:** `/api/v1`

## Available Endpoints

### 1. Parties (Generic Entities)
```
POST   /api/v1/parties          - Create a party
GET    /api/v1/parties          - List all parties
GET    /api/v1/parties/:id      - Get party details
PATCH  /api/v1/parties/:id      - Update party
DELETE /api/v1/parties/:id      - Delete party
```

### 2. Contacts
```
POST   /api/v1/contacts         - Create a contact
GET    /api/v1/contacts         - List all contacts
GET    /api/v1/contacts/:id     - Get contact details
PATCH  /api/v1/contacts/:id     - Update contact
DELETE /api/v1/contacts/:id     - Delete contact
```

### 3. Suppliers
```
POST   /api/v1/suppliers        - Create a supplier
GET    /api/v1/suppliers        - List all suppliers
GET    /api/v1/suppliers/:id    - Get supplier details
PATCH  /api/v1/suppliers/:id    - Update supplier
DELETE /api/v1/suppliers/:id    - Delete supplier
```

### 4. Service Offerings (Catalog Index)
```
POST   /api/v1/service-offerings           - Create service offering
GET    /api/v1/service-offerings           - List all offerings
GET    /api/v1/service-offerings/:id       - Get offering details
PATCH  /api/v1/service-offerings/:id       - Update offering
DELETE /api/v1/service-offerings/:id       - Delete offering
```

### 5. Hotels
```
POST   /api/v1/hotels           - Create hotel room
GET    /api/v1/hotels           - List all hotels
GET    /api/v1/hotels/:id       - Get hotel details
PATCH  /api/v1/hotels/:id       - Update hotel
DELETE /api/v1/hotels/:id       - Delete hotel

POST   /api/v1/hotels/:id/rates           - Create hotel rate
GET    /api/v1/hotels/:id/rates           - List hotel rates
GET    /api/v1/hotels/rates/:rateId       - Get rate details
PATCH  /api/v1/hotels/rates/:rateId       - Update rate
DELETE /api/v1/hotels/rates/:rateId       - Delete rate
```

### 6. Transfers
```
POST   /api/v1/transfers        - Create transfer service
GET    /api/v1/transfers        - List all transfers
GET    /api/v1/transfers/:id    - Get transfer details
PATCH  /api/v1/transfers/:id    - Update transfer
DELETE /api/v1/transfers/:id    - Delete transfer

POST   /api/v1/transfers/:id/rates        - Create transfer rate
GET    /api/v1/transfers/:id/rates        - List transfer rates
GET    /api/v1/transfers/rates/:rateId    - Get rate details
PATCH  /api/v1/transfers/rates/:rateId    - Update rate
DELETE /api/v1/transfers/rates/:rateId    - Delete rate
```

### 7. Vehicles
```
POST   /api/v1/vehicles         - Create vehicle
GET    /api/v1/vehicles         - List all vehicles
GET    /api/v1/vehicles/:id     - Get vehicle details
PATCH  /api/v1/vehicles/:id     - Update vehicle
DELETE /api/v1/vehicles/:id     - Delete vehicle

POST   /api/v1/vehicles/:id/rates         - Create vehicle rate
GET    /api/v1/vehicles/:id/rates         - List vehicle rates
GET    /api/v1/vehicles/rates/:rateId     - Get rate details
PATCH  /api/v1/vehicles/rates/:rateId     - Update rate
DELETE /api/v1/vehicles/rates/:rateId     - Delete rate
```

### 8. Guides
```
POST   /api/v1/guides           - Create guide
GET    /api/v1/guides           - List all guides
GET    /api/v1/guides/:id       - Get guide details
PATCH  /api/v1/guides/:id       - Update guide
DELETE /api/v1/guides/:id       - Delete guide

POST   /api/v1/guides/:id/rates           - Create guide rate
GET    /api/v1/guides/:id/rates           - List guide rates
GET    /api/v1/guides/rates/:rateId       - Get rate details
PATCH  /api/v1/guides/rates/:rateId       - Update rate
DELETE /api/v1/guides/rates/:rateId       - Delete rate
```

### 9. Activities
```
POST   /api/v1/activities       - Create activity
GET    /api/v1/activities       - List all activities
GET    /api/v1/activities/:id   - Get activity details
PATCH  /api/v1/activities/:id   - Update activity
DELETE /api/v1/activities/:id   - Delete activity

POST   /api/v1/activities/:id/rates       - Create activity rate
GET    /api/v1/activities/:id/rates       - List activity rates
GET    /api/v1/activities/rates/:rateId   - Get rate details
PATCH  /api/v1/activities/rates/:rateId   - Update rate
DELETE /api/v1/activities/rates/:rateId   - Delete rate
```

## Authentication

All endpoints require JWT authentication. First login to get a token:

```bash
POST /api/v1/auth/login
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

Then include the token in all requests:
```
Authorization: Bearer <your_token>
```

## Example: Adding a Hotel Supplier with Rates

### Step 1: Create a Party
```bash
POST /api/v1/parties
{
  "name": "Grand Hotel Istanbul",
  "taxId": "1234567890",
  "city": "Istanbul",
  "country": "Turkey",
  "address": "Sultanahmet Square"
}
```

### Step 2: Create a Supplier (linked to Party)
```bash
POST /api/v1/suppliers
{
  "partyId": 1,
  "supplierType": "HOTEL",
  "bankAccountName": "Grand Hotel Ltd",
  "bankAccountNumber": "TR123456789",
  "iban": "TR330006100519786457841326",
  "swiftCode": "ISBKTRISXXX",
  "paymentTermDays": 30,
  "defaultCurrency": "TRY"
}
```

### Step 3: Create a Service Offering
```bash
POST /api/v1/service-offerings
{
  "supplierId": 1,
  "serviceType": "HOTEL_ROOM",
  "title": "Grand Hotel - Standard Double Room",
  "location": "Sultanahmet, Istanbul",
  "isActive": true
}
```

### Step 4: Create Hotel Room Details
```bash
POST /api/v1/hotels
{
  "serviceOfferingId": 1,
  "hotelName": "Grand Hotel Istanbul",
  "stars": 5,
  "city": "Istanbul",
  "country": "Turkey",
  "address": "Sultanahmet Square",
  "latitude": 41.0082,
  "longitude": 28.9784,
  "roomType": "DBL",
  "maxOccupancy": 2,
  "boardTypes": ["BB", "HB", "FB"],
  "amenities": ["WiFi", "AC", "TV", "Minibar"]
}
```

### Step 5: Create Hotel Room Rate
```bash
POST /api/v1/hotels/1/rates
{
  "seasonFrom": "2025-04-01",
  "seasonTo": "2025-10-31",
  "boardType": "BB",
  "pricePerPersonDouble": 1500.00,
  "singleSupplement": 500.00,
  "pricePerPersonTriple": 1200.00,
  "childPrice0To2": 0.00,
  "childPrice3To5": 300.00,
  "childPrice6To11": 600.00,
  "allotment": 10,
  "releaseDays": 7
}
```

## Example: Adding a Transfer Service

### Step 1-2: Create Party & Supplier (same as above, but with `supplierType: "TRANSPORT"`)

### Step 3: Create Service Offering
```bash
POST /api/v1/service-offerings
{
  "supplierId": 2,
  "serviceType": "TRANSFER",
  "title": "Airport Transfer - IST to Sultanahmet",
  "location": "Istanbul",
  "isActive": true
}
```

### Step 4: Create Transfer Details
```bash
POST /api/v1/transfers
{
  "serviceOfferingId": 2,
  "originZone": "Istanbul Airport (IST)",
  "destZone": "Sultanahmet Hotels",
  "transferType": "PRIVATE",
  "vehicleClass": "SEDAN",
  "capacity": 3,
  "meetGreet": true,
  "duration": 45,
  "distance": 50
}
```

### Step 5: Create Transfer Rate
```bash
POST /api/v1/transfers/2/rates
{
  "seasonFrom": "2025-01-01",
  "seasonTo": "2025-12-31",
  "pricingModel": "PER_TRANSFER",
  "baseCostTry": 1200.00,
  "includedKm": 50,
  "extraKmTry": 20.00,
  "nightSurchargePct": 25,
  "holidaySurchargePct": 50
}
```

## Service Types Available

- **HOTEL_ROOM** - Hotel accommodations
- **TRANSFER** - Airport/city transfers
- **VEHICLE_HIRE** - Vehicle rentals with/without driver
- **GUIDE_SERVICE** - Tour guide services
- **ACTIVITY** - Activities and attractions

## Board Types (Hotels)

- **RO** - Room Only
- **BB** - Bed & Breakfast
- **HB** - Half Board
- **FB** - Full Board
- **AI** - All Inclusive

## Pricing Models

**Hotels:**
- PER_ROOM_NIGHT
- PER_PERSON_NIGHT (recommended)

**Transfers:**
- PER_TRANSFER
- PER_KM
- PER_HOUR

**Vehicles:**
- PER_DAY
- PER_HOUR

**Guides:**
- PER_DAY
- PER_HALF_DAY
- PER_HOUR

**Activities:**
- PER_PERSON
- PER_GROUP

## Current Database Status

**Suppliers:** 0
**Service Offerings:** 0
**Hotel Rates:** 0
**Transfer Rates:** 0
**Vehicle Rates:** 0
**Guide Rates:** 0
**Activity Rates:** 0

**Next Step:** Use the API endpoints above to populate sample data for each service type.
