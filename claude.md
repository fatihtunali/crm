# Tour Operatörü CRM - Geliştirme Notları

**Amaç**: Rezervasyonlar, oteller, araçlar, rehberler ve turizm operasyonlarını yönetmek.

---

## 🏗️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind v4 + Axios
**Backend**: Node.js v20 + Express + TypeScript + Prisma + JWT
**Database**: PostgreSQL 14 (Digital Ocean)
**DevOps**: PM2 + Nginx + Let's Encrypt

**Ports**: Backend:5000 | Frontend:5173

---

## ✅ TAMAMLANAN MODÜLLER

### 1. Authentication & User Management
- JWT authentication + role-based authorization
- User roles: SUPER_ADMIN, ADMIN, OPERATOR, ACCOUNTING, SALES
- Endpoints: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`

### 2. Hotels (Oteller)
**Schema**: Hotel + HotelPricing (seasonal, per person)
- Per Person pricing: DBL, TRP, Single Supplement
- Child age groups: 0-2, 3-5, 6-11
- **Routes**: `/resources/hotels`, `/resources/hotels/:id/pricing`
- **Endpoints**: `/api/v1/hotels/*`

### 3. Guides (Rehberler)
**Schema**: Guide + GuidePricing (service type based)
- Service types: FULL_DAY, HALF_DAY, TRANSFER, NIGHT_SERVICE, PACKAGE_TOUR
- Table view: All service types in single row
- **Routes**: `/resources/guides`, `/resources/guides/:id/pricing`
- **Endpoints**: `/api/v1/guides/*`

### 4. Suppliers (Tedarikçiler)
**Schema**: Supplier + EntranceFeePricing + SupplierPricing
- Types: RESTAURANT, MUSEUM, ACTIVITY, OTHER
- **EntranceFeePricing**: Age-based (Adult, Child 0-6, Child 7-12, Student)
- **SupplierPricing**: Service-based (BREAKFAST, LUNCH, DINNER, ACTIVITY, OTHER)
- **Routes**: `/resources/suppliers`, `/entrance-fees`, `/entrance-fees/new`
- **Endpoints**: `/api/v1/suppliers/*`
- **NOTE**: MUSEUM suppliers only visible in Entrance Fees page

### 5. Vehicle Suppliers (DATABASE READY - UI PENDING)
**Schema**: VehicleSupplier + TransferPricing + VehicleAllocationPricing
- Vehicle types: VITO, SPRINTER, ISUZU, COACH, CAR, VAN, MINIBUS, MIDIBUS, BUS, LUXURY
- TransferPricing: Airport↔Hotel, City↔City transfers
- AllocationPricing: FULL_DAY, HALF_DAY, NIGHT_SERVICE, PACKAGE_TOUR
- Turkish cities: 81 cities in `backend/src/constants/cities.ts`
- **TODO**: Backend controllers + Frontend UI

---

## 📦 KRITIK KONFIGÜRASYONLAR

### Tailwind CSS v4 (DIKKAT!)
```javascript
// postcss.config.js - DOĞRU SYNTAX
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // ✅ v4 için string format
    autoprefixer: {},
  },
}
```

```javascript
// tailwind.config.js
plugins: [
  '@tailwindcss/forms',  // ✅ String format (v4)
]
// ❌ YANLIŞ: require('@tailwindcss/forms')
```

### Port Management (KRITIK!)
```bash
# ❌ ASLA KULLANMA: taskkill /F /IM node.exe  (Claude'u da kapatır!)

# ✅ DOĞRU: Port bazlı durdurma
./start-dev.sh   # Servisleri başlat
./stop-dev.sh    # Servisleri durdur (port bazlı - güvenli)
```

**Vite Config**:
```typescript
// vite.config.ts
server: {
  port: 5173,
  strictPort: true,  // ✅ Port değişmesin
}
```

---

## 🔄 DEV WORKFLOW

### Development
```bash
./start-dev.sh                          # Servisleri başlat
./stop-dev.sh                           # Servisleri durdur
./stop-dev.sh && ./start-dev.sh         # Restart
```

### Database Migration
```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma generate
```

### Git
```bash
git status
git add .
git commit -m "feat: açıklama"
git push origin main
```

---

## 📍 MEVCUT DURUM (2025-10-30)

### ✅ Tamamlanan
1. Authentication + Dashboard
2. Hotels modülü (full)
3. Guides modülü (full)
4. Suppliers modülü (full)
5. Entrance Fees modülü (separate page)
6. Vehicle database schema (ready)

### ⏳ Yapılacaklar (ÖNCELİK SIRASI)
1. **Vehicle Module UI** (Backend + Frontend)
   - vehicleSupplier.controller.ts
   - transferPricing.controller.ts
   - vehicleAllocationPricing.controller.ts
   - VehicleSuppliers.tsx, VehicleSupplierForm.tsx, VehiclePricing.tsx

2. **Customers (CRM)** - Müşteri yönetimi
3. **Reservations** - Ana modül (tüm kaynakları birleştir)
4. **Finance** - Faturalar, ödemeler, kar-zarar

---

## 🗂️ DATABASE SCHEMA HIGHLIGHTS

### Main Tables
- **users** - User management (auth)
- **hotels** + **hotel_pricings** - Per person seasonal pricing
- **guides** + **guide_pricings** - Service type pricing
- **suppliers** + **entrance_fee_pricings** + **supplier_pricings**
- **vehicle_suppliers** + **transfer_pricings** + **vehicle_allocation_pricings**

### Key Enums
```prisma
enum UserRole { SUPER_ADMIN, ADMIN, OPERATOR, ACCOUNTING, SALES }
enum SupplierType { RESTAURANT, MUSEUM, ACTIVITY, OTHER }
enum SupplierServiceType { BREAKFAST, LUNCH, DINNER, ACTIVITY, OTHER }
enum GuideServiceType { FULL_DAY, HALF_DAY, TRANSFER, NIGHT_SERVICE, PACKAGE_TOUR }
enum VehicleType { VITO, SPRINTER, ISUZU, COACH, CAR, VAN, MINIBUS, MIDIBUS, BUS, LUXURY }
enum AllocationType { FULL_DAY, HALF_DAY, NIGHT_SERVICE, PACKAGE_TOUR }
```

---

## 🎨 UI/UX PATTERNS

### Design Principles
- **List Format**: Compact list view (NOT grid)
- **Table View**: All price categories in single row (Guides, Entrance Fees)
- **Color-Coded**: Different colors for different categories
- **Inline Actions**: Delete/Edit on hover
- **Gradient**: Purple/Blue theme (#667eea, #764ba2)

### Page Structure
```
├── Dashboard (6 module cards)
├── Resources
│   ├── Hotels (+ Pricing)
│   ├── Guides (+ Pricing)
│   ├── Vehicles (+ Pricing) [TODO]
│   └── Suppliers
├── Entrance Fees (MUSEUM suppliers)
├── Customers [TODO]
├── Reservations [TODO]
└── Finance [TODO]
```

---

## 🔐 GÜVENLİK

1. **JWT Secret**: Production'da güçlü secret kullan
2. **Database Password**: .env asla Git'e ekleme
3. **CORS**: Production'da sadece kendi domain
4. **HTTPS**: Let's Encrypt SSL

---

## 📚 REFERANSLAR

**Pattern Files** (Yeni modül geliştirirken kopyala):
```
backend/src/controllers/hotel.controller.ts       → Diğer controller'lar için
backend/src/routes/hotel.routes.ts                → Diğer route'lar için
frontend/src/pages/Hotels.tsx                     → List view pattern
frontend/src/pages/HotelPricing.tsx               → Pricing page pattern
frontend/src/pages/GuidePricing.tsx               → Table view pattern
```

**External Docs**:
- [Prisma](https://www.prisma.io/docs)
- [React](https://react.dev)
- [Tailwind v4](https://tailwindcss.com/docs)

---

**Son Güncelleme**: 2025-10-30
**Git**: `main` branch
**Durum**: ✅ Core modules completed | ⏳ Vehicle UI pending
**Sonraki**: Vehicle Backend API + Frontend UI
