# ✅ NEW Supplier Catalog Structure

**Date:** November 1, 2025
**Status:** ✅ **SCHEMA UPDATED & APPLIED**

---

## 🚗 1. TRANSFERS - New Structure

### **Your Requirement:**
```
City → Vehicle Type → Route → Max Passengers → Price
Istanbul → Vito → Airport to Hotel → Max 4 pax → 120 EUR
```

### **New Schema:**

**Transfer Table:**
```typescript
{
  city: "Istanbul",                    // ✅ NEW FIELD
  originZone: "Istanbul Airport",
  destZone: "Sultanahmet Hotels",
  vehicleClass: "VITO",                // ✅ NOW ENUM (VITO, SPRINTER, ISUZU, COACH)
  maxPassengers: 4,                    // ✅ NEW FIELD
  transferType: "PRIVATE",
  meetGreet: true,
  duration: 45,                        // minutes
  distance: 50                         // km
}
```

**Vehicle Classes (ENUM):**
- **VITO** → Max 4 passengers
- **SPRINTER** → Max 12 passengers
- **ISUZU** → Max 20 passengers
- **COACH** → Max 44 passengers

**Transfer Rate:**
```typescript
{
  seasonFrom: "2025-04-01",
  seasonTo: "2025-10-31",
  baseCostTry: 3600.00,               // 120 EUR × 30 rate = 3600 TRY
  nightSurchargePct: 25,               // 25% extra for night transfers
  holidaySurchargePct: 50              // 50% extra for holidays
}
```

---

## 🚙 2. VEHICLES - New Structure

### **Your Requirement:**
```
Daily rates AND hourly rates on ONE line
```

### **New Schema:**

**Vehicle Table:**
```typescript
{
  make: "Mercedes",
  model: "Vito",
  vehicleClass: "VITO",               // ✅ NOW ENUM
  maxPassengers: 4,                   // ✅ NEW FIELD
  withDriver: true,
  plateNumber: "34 ABC 123",
  transmission: "automatic",
  features: ["GPS", "AC", "WiFi"]
}
```

**Vehicle Rate (ALL IN ONE LINE):**
```typescript
{
  seasonFrom: "2025-04-01",
  seasonTo: "2025-10-31",

  // ✅ DAILY PRICING
  dailyRateTry: 2400.00,              // Daily rate
  dailyKmIncluded: 200,               // 200 km included per day

  // ✅ HOURLY PRICING
  hourlyRateTry: 400.00,              // Hourly rate
  minHours: 4,                        // Minimum 4 hours

  // COMMON FIELDS
  extraKmTry: 15.00,                  // Per extra km
  driverDailyTry: 600.00,             // Driver cost per day
  depositTry: 5000.00,                // Deposit
  minRentalDays: 1
}
```

---

## 📊 Example Data Structure

### **Supplier: ABC Transport Istanbul**

#### **Transfer 1:**
```
City: Istanbul
Route: Airport → Sultanahmet Hotels
Vehicle: VITO (Max 4 pax)
Season: April - October 2025
Price: 3,600 TRY base
Night surcharge: +25%
Holiday surcharge: +50%
```

#### **Transfer 2:**
```
City: Istanbul
Route: Airport → Sultanahmet Hotels
Vehicle: SPRINTER (Max 12 pax)
Season: April - October 2025
Price: 6,000 TRY base
Night surcharge: +25%
Holiday surcharge: +50%
```

#### **Vehicle Rental:**
```
Vehicle: Mercedes Vito
Class: VITO (Max 4 pax)
Daily Rate: 2,400 TRY (includes 200 km)
Hourly Rate: 400 TRY (minimum 4 hours)
Extra KM: 15 TRY per km
With Driver: +600 TRY per day
Deposit: 5,000 TRY
```

---

## 🎯 How to Enter Data

### **Step 1: Create Supplier**
```json
POST /api/v1/suppliers
{
  "partyId": 1,
  "supplierType": "TRANSPORT",
  "bankAccountName": "ABC Transport Ltd",
  "paymentTermDays": 30
}
```

### **Step 2: Create Transfer Service**
```json
POST /api/v1/service-offerings
{
  "supplierId": 1,
  "serviceType": "TRANSFER",
  "title": "Istanbul Airport - Sultanahmet (Vito)",
  "location": "Istanbul"
}
```

### **Step 3: Create Transfer Details**
```json
POST /api/v1/transfers
{
  "serviceOfferingId": 1,
  "city": "Istanbul",
  "originZone": "Istanbul Airport (IST)",
  "destZone": "Sultanahmet Hotels",
  "vehicleClass": "VITO",
  "maxPassengers": 4,
  "transferType": "PRIVATE",
  "meetGreet": true,
  "duration": 45,
  "distance": 50
}
```

### **Step 4: Create Transfer Rate**
```json
POST /api/v1/transfers/1/rates
{
  "seasonFrom": "2025-04-01",
  "seasonTo": "2025-10-31",
  "baseCostTry": 3600.00,
  "nightSurchargePct": 25,
  "holidaySurchargePct": 50
}
```

---

## 📋 Frontend View Example

### **Transfers List (Grouped by Supplier)**

**ABC Transport Istanbul**
| City | Route | Vehicle | Max Pax | Season | Price (TRY) |
|------|-------|---------|---------|--------|-------------|
| Istanbul | Airport → Sultanahmet | VITO | 4 | Apr-Oct 2025 | 3,600 |
| Istanbul | Airport → Sultanahmet | SPRINTER | 12 | Apr-Oct 2025 | 6,000 |
| Istanbul | Airport → Taksim | VITO | 4 | Apr-Oct 2025 | 2,400 |
| Istanbul | Airport → Taksim | ISUZU | 20 | Apr-Oct 2025 | 8,500 |

**XYZ Transport Cappadocia**
| City | Route | Vehicle | Max Pax | Season | Price (TRY) |
|------|-------|---------|---------|--------|-------------|
| Cappadocia | Airport → Göreme | VITO | 4 | Year-round | 1,800 |
| Cappadocia | Airport → Ürgüp | SPRINTER | 12 | Year-round | 3,200 |

### **Vehicles List (Grouped by Supplier)**

**ABC Transport Istanbul**
| Vehicle | Class | Max Pax | Daily Rate | Hourly Rate | Min Hours | Extra KM |
|---------|-------|---------|------------|-------------|-----------|----------|
| Mercedes Vito | VITO | 4 | 2,400 TRY | 400 TRY | 4h | 15 TRY |
| Mercedes Sprinter | SPRINTER | 12 | 4,500 TRY | 700 TRY | 4h | 20 TRY |
| Isuzu NPR | ISUZU | 20 | 6,000 TRY | 900 TRY | 4h | 25 TRY |

---

## ✅ What's Changed

| Feature | Before | After |
|---------|--------|-------|
| Vehicle Types | Free text | **ENUM** (VITO, SPRINTER, ISUZU, COACH) |
| Transfer City | ❌ Not tracked | ✅ **city** field |
| Max Passengers | Generic "capacity" | ✅ **maxPassengers** (per vehicle type) |
| Vehicle Pricing | Only daily OR hourly | ✅ **Both on ONE line** |
| Vehicle Hourly Rate | ❌ Not available | ✅ **hourlyRateTry** field |
| Vehicle Daily Rate | baseCostTry | ✅ **dailyRateTry** field |

---

## 🎯 Next Steps

1. ✅ Schema updated
2. ✅ Database reset and applied
3. ⏳ Create sample seed data
4. ⏳ Test API endpoints
5. ⏳ Update frontend to show new structure

---

**Status:** Ready for data entry!


● Perfect! All servers have been stopped. Everything is clean and ready for tomorrow morning.

  ✅ Current Status

  Servers: All stoppedCode: Pushed to GitHub (commit 0d212df)Documentation: Complete (ARCHITECTURE.md + 3 API docs)Build Status: 0 errorsDatabase: Admin user created (admin@tourcrm.com / Admin123!)

  📋 What We Accomplished Today

  1. ✅ Fixed all SelectItem runtime errors
  2. ✅ Created comprehensive architecture documentation explaining the hybrid database model
  3. ✅ Documented all three API systems:
    - Supplier Management (backend operations)
    - Catalog/Quotation (quote building)
    - Customer Itineraries (AI generation)
  4. ✅ Clarified that BOTH systems are needed (not old/new, but complementary)
  5. ✅ Safely pushed to Git (no secrets, no staging data)

  💭 Things to Discuss Tomorrow

  1. Hybrid Model Strategy: How to best link QuoteHotel ↔ Supplier
  2. Data Population: Whether to populate catalog from suppliers or keep separate
  3. Google Places Integration: How to leverage it in the workflow
  4. Next Features: What to build next (more pages? API improvements?)

  Have a great evening! See you tomorrow morning with fresh minds. 🌙