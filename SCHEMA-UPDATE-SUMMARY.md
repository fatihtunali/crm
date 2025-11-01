# Schema Update Summary

**Date:** November 1, 2025
**Status:** ⏳ In Progress - Fixing TypeScript Errors

---

## ✅ What Was Changed in Schema

### 1. **VehicleClass ENUM Created**
```prisma
enum VehicleClass {
  VITO          // Max 4 pax
  SPRINTER      // Max 12 pax
  ISUZU         // Max 20 pax
  COACH         // Max 44 pax
}
```

### 2. **Transfer Model Updated**
| Old Field | New Field | Type Change |
|-----------|-----------|-------------|
| `capacity` | `maxPassengers` | int |
| N/A | `city` | string (NEW) |
| `vehicleClass` | `vehicleClass` | String → VehicleClass ENUM |

### 3. **Vehicle Model Updated**
| Old Field | New Field | Type Change |
|-----------|-----------|-------------|
| `seats` | `maxPassengers` | int |
| `vehicleClass` | `vehicleClass` | String → VehicleClass ENUM |

### 4. **VehicleRate Model Updated - MAJOR CHANGE**
| Old Fields | New Fields |
|------------|------------|
| `pricingModel` (ENUM) | **REMOVED** |
| `baseCostTry` | **REMOVED** |
| N/A | `dailyRateTry` (NEW) |
| N/A | `hourlyRateTry` (NEW) |
| N/A | `minHours` (NEW) |

---

## ❌ TypeScript Errors to Fix

### File: `pricing.service.ts` (3 errors)
- Line 202: `baseCostTry` → should use `dailyRateTry` or `hourlyRateTry`
- Line 203: `baseCostTry` → same fix
- Line 227: `pricingModel` → field removed, logic needs update

### File: `transfers.service.ts` (3 errors)
- Line 48: DTO doesn't match new Transfer schema
- Line 161: DTO doesn't match new Transfer schema
- Line 286: `capacity` → should be `maxPassengers`
- Line 381: `vehicleClass.contains` → ENUM doesn't support `contains`, use direct match

### File: `vehicles.service.ts` (8 errors)
- Line 48: DTO doesn't match new Vehicle schema
- Line 76: `vehicleClass.contains` → use direct ENUM match
- Line 159: DTO doesn't match new Vehicle schema
- Line 221: `baseCostTry` → use `dailyRateTry` and `hourlyRateTry`
- Line 284: `seats` → should be `maxPassengers`
- Line 301: `baseCostTry` → ordering logic needs update
- Line 380: `vehicleClass.contains` → use direct ENUM match

---

## 🔧 Required Code Fixes

### Fix 1: Update DTOs
**Files:**
- `src/transfers/dto/create-transfer.dto.ts`
- `src/transfers/dto/update-transfer.dto.ts`
- `src/vehicles/dto/create-vehicle.dto.ts`
- `src/vehicles/dto/update-vehicle.dto.ts`
- `src/vehicles/dto/create-vehicle-rate.dto.ts`

**Changes:**
```typescript
// OLD
export class CreateTransferDto {
  capacity: number;
  vehicleClass: string;
}

// NEW
export class CreateTransferDto {
  city: string;              // NEW FIELD
  maxPassengers: number;     // RENAMED from capacity
  vehicleClass: VehicleClass; // NOW ENUM
}
```

### Fix 2: Update Service Methods
**vehicles.service.ts:**
```typescript
// OLD
vehicleClass: {
  contains: filters.vehicleClass,
  mode: 'insensitive'
}

// NEW (ENUM - exact match only)
vehicleClass: filters.vehicleClass  // Direct ENUM value
```

### Fix 3: Update Vehicle Rate Logic
**vehicles.service.ts:**
```typescript
// OLD
{
  baseCostTry: dto.baseCostTry,
  pricingModel: dto.pricingModel
}

// NEW
{
  dailyRateTry: dto.dailyRateTry,
  hourlyRateTry: dto.hourlyRateTry,
  minHours: dto.minHours
}
```

### Fix 4: Update Pricing Service
**pricing.service.ts:**
```typescript
// OLD - Single pricing model
const cost = rate.baseCostTry;

// NEW - Choose daily or hourly based on request
const cost = params.rentalType === 'daily'
  ? rate.dailyRateTry
  : rate.hourlyRateTry;
```

---

## 📋 Next Steps

1. Fix all DTOs to match new schema
2. Update service methods to use new field names
3. Update pricing logic for dual-rate system
4. Restart servers and verify
5. Create sample seed data

---

**Status:** Working on fixes...
