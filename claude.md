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

### 5. Vehicle Suppliers (COMPLETE)
**Schema**: VehicleSupplier + TransferPricing + VehicleAllocationPricing
- Vehicle types: VITO, SPRINTER, ISUZU, COACH, CAR, VAN, MINIBUS, MIDIBUS, BUS, LUXURY
- TransferPricing: Airport↔Hotel, City↔City transfers
- AllocationPricing: FULL_DAY, HALF_DAY, NIGHT_SERVICE, PACKAGE_TOUR
- Turkish cities: 81 cities in `backend/src/constants/cities.ts`
- **Routes**: `/resources/vehicle-suppliers`, `/resources/vehicle-suppliers/:id/pricing`
- **Endpoints**: `/api/v1/vehicle-suppliers/*`

### 6. Customer Management (B2B + B2C) - COMPLETE
**Schema**: Agent + Customer + AgentContactHistory + CustomerContactHistory

**B2B (Agents)**:
- Travel agencies and tour operators we work with
- Business terms: payment terms, credit limits, commission rates
- Each agent can have multiple customers
- **Routes**: `/customers/agents`, `/customers/agents/:id`, `/customers/agents/:id/edit`
- **Endpoints**: `/api/v1/agents/*`

**B2C (Direct Clients)**:
- Individual travelers booking directly
- Personal info, passport details, travel preferences
- Linked to agent if B2B, or standalone if B2C
- **Routes**: `/customers/direct`, `/customers/direct/:id/edit`
- **Endpoints**: `/api/v1/customers/*` (with `?type=b2c` or `?type=b2b`)

### 7. Tour Package Pricing (COMPLETE - 2025-10-30)
**Schema**: TourPackagePricing (linked to TOUR_OPERATOR suppliers)
- External tour operator packages with seasonal pricing
- Age-based pricing: Adult, Child 0-6, Child 7-12, Student
- Package info: duration, city, season, description
- Inclusions: lunch, entrance fees, guide, transport
- **Routes**: `/resources/suppliers/:id/tour-packages`
- **Endpoints**: `/api/v1/suppliers/:supplierId/tour-packages/*`
- **Test Data**: Green Tour (€45/adult, 6h) + Red Tour (€50/adult, 7h)

### 8. Tour Templates (COMPLETE - 2025-10-30)
**Schema**: TourTemplate + TourTemplateDay + TourTemplateActivity
- Reusable tour blueprints for creating reservations
- Multi-day templates with daily activities
- Each day includes: hotel, guide, vehicle, meals, activities
- Copy template to create new reservation
- **Routes**: `/tour-templates`, `/tour-templates/new`, `/tour-templates/:id/edit`
- **Endpoints**:
  - `/api/v1/tour-templates/*` - Template CRUD
  - `/api/v1/tour-templates/:id/create-reservation` - Copy to reservation
- **Special Feature**: Creates full reservation from template with participants

### 9. Reservation Management (COMPLETE)
**Schema**: Reservation + ReservationDay + ReservationActivity + ReservationParticipant + Payment
- Full multi-day tour reservations
- Day-by-day planning: hotel, guide, vehicle, meals, activities
- Participant tracking (age-based pricing)
- Payment tracking (multiple payments, remaining balance)
- Status tracking: PENDING, CONFIRMED, CANCELLED, COMPLETED
- **Routes**: `/reservations`, `/reservations/new`, `/reservations/:id`, `/reservations/:id/edit`
- **Endpoints**: `/api/v1/reservations/*`

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
1. ✅ Authentication + Dashboard
2. ✅ Hotels modülü (full)
3. ✅ Guides modülü (full)
4. ✅ Suppliers modülü (full)
5. ✅ Entrance Fees modülü (separate page)
6. ✅ Vehicle Suppliers modülü (full)
7. ✅ Customer Management (B2B Agents + B2C Direct Clients)
8. 🔨 Reservations modülü (IN PROGRESS)
   - ✅ Database schema (Reservation, ReservationDay, ReservationActivity, ReservationParticipant, Payment)
   - ✅ Backend API (CRUD + auto reservation code generation)
   - ✅ Reservations list page with filters
   - ✅ ReservationForm with 3-step customer selection
   - ⏳ Form completion (daily itinerary, participants, pricing)

### ⏳ Sıradaki Modüller (ÖNCELİK SIRASI)
1. **Reservations Form** - Complete the form
   - Day-by-day itinerary builder with activities
   - Participant management (ADULT, CHILD categories)
   - Real-time cost/price calculation
   - View/Edit existing reservations

2. **Finance** - Finans modülü
   - Invoices (faturalar)
   - Payments tracking (ödeme takibi)
   - Cost calculations (maliyet hesaplama)
   - Profit/loss analysis (kar-zarar)

---

## 🗂️ DATABASE SCHEMA HIGHLIGHTS

### Main Tables
- **users** - User management (auth)
- **hotels** + **hotel_pricings** - Per person seasonal pricing
- **guides** + **guide_pricings** - Service type pricing
- **suppliers** + **entrance_fee_pricings** + **supplier_pricings**
- **vehicle_suppliers** + **transfer_pricings** + **vehicle_allocation_pricings**
- **agents** + **agent_contact_history** - B2B travel agencies
- **customers** + **customer_contact_history** - B2B agent customers + B2C direct clients

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
├── Dashboard (8 module cards)
├── Resources
│   ├── Hotels (+ Pricing)
│   ├── Guides (+ Pricing)
│   ├── Vehicle Suppliers (+ Pricing)
│   └── Suppliers
├── Entrance Fees (MUSEUM suppliers)
├── Customers
│   ├── Agents (B2B) (+ Customer list)
│   └── Direct Clients (B2C)
├── Reservations (List + Form with 3-step customer selection)
└── Finance [TODO]
```

---

## 📅 RESERVATIONS MODULE (IN PROGRESS)

### Database Schema
```prisma
model Reservation {
  id               Int      @id @default(autoincrement())
  reservationCode  String   @unique          // REZ-2025-0001 (auto-generated)
  customerId       Int                       // References Customer (B2B or B2C)
  customer         Customer @relation(...)

  startDate        DateTime
  endDate          DateTime
  totalDays        Int
  status           ReservationStatus @default(PENDING)

  totalCost        Decimal                   // Total cost (buy price)
  totalPrice       Decimal                   // Total price (sell price)
  profit           Decimal                   // totalPrice - totalCost
  paidAmount       Decimal @default(0)
  remainingAmount  Decimal                   // totalPrice - paidAmount

  currency         String @default("EUR")
  notes            String?                   // Customer-facing notes
  internalNotes    String?                   // Internal team notes

  days             ReservationDay[]          // Daily itinerary
  participants     ReservationParticipant[]  // Guest list
  payments         Payment[]                 // Payment history
}

enum ReservationStatus {
  PENDING    // Ön rezervasyon
  CONFIRMED  // Onaylandı
  CANCELLED  // İptal
  COMPLETED  // Tamamlandı
}
```

### Backend API
**Routes**: `/api/v1/reservations`

**Key Features**:
- ✅ Auto-generates unique reservation codes (REZ-YYYY-NNNN)
- ✅ Nested creates (days, participants, activities, payments)
- ✅ Filters (status, customerId, date range)
- ✅ Full CRUD operations

**Endpoints**:
```
GET    /reservations              - List all reservations
GET    /reservations/:id          - Get reservation details
POST   /reservations              - Create new reservation
PUT    /reservations/:id          - Update reservation
DELETE /reservations/:id          - Delete reservation
POST   /reservations/:id/payments - Add payment
```

### Frontend - 3-Step Customer Selection Pattern

**Problem**: Users were confused about customer selection in the form.

**Solution**: Implemented a 3-step selection workflow:

1. **Step 1: Customer Type Selection** (Radio buttons)
   - ○ Acente (B2B) - For agency customers
   - ○ Direkt Müşteri (B2C) - For direct customers

2. **Step 2: Agent Selection** (Conditional - only for B2B)
   - Dropdown showing all agents
   - Disabled until B2B is selected

3. **Step 3: Customer Selection** (Filtered)
   - Shows only agent's customers (if B2B)
   - Shows only direct customers (if B2C)
   - Disabled until previous steps are complete

**Key Code Pattern**:
```typescript
const [customerType, setCustomerType] = useState<'AGENT' | 'DIRECT'>('DIRECT');
const [agents, setAgents] = useState<Agent[]>([]);
const [customers, setCustomers] = useState<Customer[]>([]);

const getFilteredCustomers = () => {
  if (customerType === 'AGENT' && formData.agentId) {
    return customers.filter(c => c.agent?.id === parseInt(formData.agentId));
  } else if (customerType === 'DIRECT') {
    return customers.filter(c => !c.agent);
  }
  return [];
};
```

**Files**:
- `frontend/src/pages/Reservations.tsx` - List view with filters
- `frontend/src/pages/ReservationForm.tsx` - Create/Edit form (IN PROGRESS)
- `backend/src/controllers/reservation.controller.ts` - API logic

### Pending Features
- ⏳ Daily itinerary builder (day-by-day resources)
- ⏳ Activity management per day
- ⏳ Participant management with age categories
- ⏳ Real-time cost/price calculation
- ⏳ Edit existing reservations
- ⏳ Payment tracking UI

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

## 🐛 KRİTİK FİX (2025-10-30)

### createdBy Field Issue - ÇÖZÜLDÜ ✅

**Sorun**: Tour Package ve Template modüllerinde `createdBy` alanı eksikti.
- Hata: `(req.user as any).id` kullanılıyordu
- Auth middleware `req.user.userId` sağlıyor
- Sonuç: Prisma validation hatası - "Argument createdBy is missing"

**Etkilenen Dosyalar**:
```typescript
// ❌ YANLIŞ
createdBy: (req.user as any).id

// ✅ DOĞRU
createdBy: req.user!.userId
```

**Düzeltilen Dosyalar** (5 instance):
1. `backend/src/controllers/tourPackagePricing.controller.ts` (line 116)
2. `backend/src/controllers/tourTemplate.controller.ts` (lines 99, 547)
3. `backend/src/controllers/reservation.controller.ts` (lines 198, 354)

**Test**: Green Tour ve Red Tour paketleri başarıyla oluşturuldu ve doğrulandı.

---

**Son Güncelleme**: 2025-10-30 14:25
**Git**: `main` branch (commit b25c134)
**Durum**: ✅ 9 modules complete | Tour Packages & Templates LIVE!
**Son Commit**: "fix: Tüm createdBy alanları düzeltildi ve Tour Package/Template modülleri eklendi"
**Test Data**: TOUR_OPERATOR supplier (ID:19) + Green Tour + Red Tour
**Sonraki**: Finance module (invoices, payments, reporting)
