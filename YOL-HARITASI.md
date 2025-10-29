# 🗺️ Tour Operator CRM - Geliştirme Yol Haritası

## 📍 MEVCUT DURUM (2025-10-29)

### ✅ Tamamlanan
- Backend API (Express + TypeScript + Prisma)
- Frontend (React + TypeScript + Vite)
- Login/Logout sistemi
- JWT Authentication
- Role-based Authorization
- Protected Routes

### 🎯 Hedef
Tam fonksiyonlu tur operatörü CRM sistemi

---

## 🚀 FAZ 1: TEMEL ALTYAPI (1-2 Hafta)

### Hafta 1: Deployment & User Management

#### 1.1 Sunucu Kurulumu ⏱️ 1 gün
- [ ] Sunucuya bağlan ve deployment yap
- [ ] Database migration çalıştır
- [ ] Super Admin kullanıcı oluştur (seed script)
- [ ] Test: Login/Logout çalışıyor mu?

**Komutlar:**
```bash
ssh root@134.209.137.11
cd /root && git clone https://github.com/fatihtunali/crm.git
cd crm/backend
npm install
npm run prisma:migrate
npm run prisma:seed  # Super Admin oluştur
npm run build
pm2 start dist/index.js --name crm-backend
```

#### 1.2 Kullanıcı Yönetimi CRUD ⏱️ 2-3 gün
- [ ] Backend: User CRUD API endpoints
  - GET /api/v1/users (sadece SUPER_ADMIN & ADMIN)
  - POST /api/v1/users (kullanıcı oluştur)
  - PUT /api/v1/users/:id (kullanıcı güncelle)
  - DELETE /api/v1/users/:id (kullanıcı sil)
  - PATCH /api/v1/users/:id/toggle-active (aktif/pasif)

- [ ] Frontend: Kullanıcılar sayfası
  - Kullanıcı listesi (tablo)
  - Yeni kullanıcı ekleme formu
  - Kullanıcı düzenleme
  - Kullanıcı silme (confirmation)
  - Rol değiştirme
  - Aktif/pasif toggle

**Tablolar:**
- Email, Ad Soyad, Rol, Durum, Oluşturma Tarihi, İşlemler

#### 1.3 Dashboard İyileştirmeleri ⏱️ 1 gün
- [ ] Temel istatistikler
  - Toplam rezervasyon sayısı
  - Bu ay rezervasyon
  - Aktif turlar
  - Toplam müşteri
- [ ] Yaklaşan turlar widget
- [ ] Son aktiviteler

---

## 📦 FAZ 2: KAYNAK YÖNETİMİ (2-3 Hafta)

### Hafta 2: Otel & Araç Yönetimi

#### 2.1 Otel Yönetimi ⏱️ 3-4 gün
**Database Schema:**
```prisma
model Hotel {
  id          Int      @id @default(autoincrement())
  name        String
  address     String
  city        String
  phone       String?
  email       String?
  stars       Int?     // 1-5 yıldız
  contactName String?  // İletişim kişisi
  notes       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**API Endpoints:**
- GET /api/v1/hotels
- POST /api/v1/hotels
- PUT /api/v1/hotels/:id
- DELETE /api/v1/hotels/:id

**Frontend:**
- Otel listesi (tablo + arama/filtreleme)
- Otel ekleme formu
- Otel düzenleme
- Otel detay sayfası

#### 2.2 Araç Yönetimi ⏱️ 3-4 gün
**Database Schema:**
```prisma
model Vehicle {
  id          Int      @id @default(autoincrement())
  plate       String   @unique // Plaka
  brand       String   // Marka
  model       String   // Model
  year        Int?
  capacity    Int      // Kapasite
  type        VehicleType // MINIBUS, BUS, VAN, CAR
  driverName  String?  // Şoför adı
  driverPhone String?
  notes       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum VehicleType {
  CAR       // Araba
  VAN       // Minivan
  MINIBUS   // Minibüs
  BUS       // Otobüs
  LUXURY    // Lüks araç
}
```

**API Endpoints:**
- GET /api/v1/vehicles
- POST /api/v1/vehicles
- PUT /api/v1/vehicles/:id
- DELETE /api/v1/vehicles/:id

**Frontend:**
- Araç listesi (kartlar + tablo)
- Araç ekleme formu
- Araç düzenleme
- Kapasite ve durum gösterimi

### Hafta 3: Rehber & Tedarikçi Yönetimi

#### 2.3 Rehber Yönetimi ⏱️ 3-4 gün
**Database Schema:**
```prisma
model Guide {
  id          Int      @id @default(autoincrement())
  firstName   String
  lastName    String
  phone       String
  email       String?
  languages   String[] // ["TR", "EN", "DE", "RU"]
  dailyRate   Decimal? // Günlük ücret
  licenseNo   String?  // Ruhsat no
  notes       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**API Endpoints:**
- GET /api/v1/guides
- POST /api/v1/guides
- PUT /api/v1/guides/:id
- DELETE /api/v1/guides/:id

**Frontend:**
- Rehber listesi
- Dil filtreleme
- Müsaitlik gösterimi (sonra)
- Rehber profil sayfası

#### 2.4 Tedarikçi Yönetimi ⏱️ 2 gün
**Database Schema:**
```prisma
model Supplier {
  id          Int      @id @default(autoincrement())
  name        String
  type        SupplierType // RESTAURANT, MUSEUM, ACTIVITY, OTHER
  address     String?
  phone       String?
  email       String?
  contactName String?
  notes       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum SupplierType {
  RESTAURANT
  MUSEUM
  ACTIVITY
  TRANSFER
  OTHER
}
```

---

## 👥 FAZ 3: MÜŞTERİ YÖNETİMİ (1 Hafta)

### Hafta 4: CRM Modülü

#### 3.1 Müşteri Yönetimi ⏱️ 4-5 gün
**Database Schema:**
```prisma
model Customer {
  id          Int      @id @default(autoincrement())
  firstName   String
  lastName    String
  email       String?
  phone       String
  country     String?
  passportNo  String?  // Pasaport no
  dateOfBirth DateTime?
  address     String?
  notes       String?
  tags        String[] // ["VIP", "Regular", "FirstTime"]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // İlişkiler
  reservations Reservation[]
}
```

**API Endpoints:**
- GET /api/v1/customers
- POST /api/v1/customers
- PUT /api/v1/customers/:id
- DELETE /api/v1/customers/:id
- GET /api/v1/customers/:id/reservations

**Frontend:**
- Müşteri listesi (tablo + arama)
- Müşteri profil sayfası
- Müşteri geçmişi (rezervasyonlar)
- İstatistikler

---

## 🎫 FAZ 4: REZERVASYON SİSTEMİ (3-4 Hafta) - ANA MODÜL

### Hafta 5-6: Temel Rezervasyon

#### 4.1 Rezervasyon Database Schema ⏱️ 1 gün
```prisma
model Reservation {
  id              Int      @id @default(autoincrement())
  reservationCode String   @unique // RES-2025-0001

  // Müşteri
  customerId      Int
  customer        Customer @relation(fields: [customerId], references: [id])

  // Tur bilgileri
  tourName        String
  startDate       DateTime
  endDate         DateTime
  numberOfPeople  Int
  status          ReservationStatus @default(PENDING)

  // Fiyat
  totalPrice      Decimal
  paidAmount      Decimal @default(0)
  currency        String  @default("USD")

  // Notlar
  notes           String?
  internalNotes   String? // Sadece ekip görsün

  // İlişkiler
  tourDays        TourDay[]
  payments        Payment[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       Int      // User ID
}

enum ReservationStatus {
  PENDING     // Beklemede
  CONFIRMED   // Onaylandı
  ONGOING     // Devam ediyor
  COMPLETED   // Tamamlandı
  CANCELLED   // İptal
}

model TourDay {
  id             Int      @id @default(autoincrement())
  reservationId  Int
  reservation    Reservation @relation(fields: [reservationId], references: [id])

  dayNumber      Int      // 1, 2, 3...
  date           DateTime
  description    String?

  // Kaynaklar
  hotelId        Int?
  hotel          Hotel?   @relation(fields: [hotelId], references: [id])
  vehicleId      Int?
  vehicle        Vehicle? @relation(fields: [vehicleId], references: [id])
  guideId        Int?
  guide          Guide?   @relation(fields: [guideId], references: [id])

  // Maliyetler
  hotelCost      Decimal?
  vehicleCost    Decimal?
  guideCost      Decimal?
  otherCosts     Decimal?

  notes          String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### 4.2 Rezervasyon CRUD ⏱️ 5-6 gün
**API Endpoints:**
- GET /api/v1/reservations
- POST /api/v1/reservations
- GET /api/v1/reservations/:id
- PUT /api/v1/reservations/:id
- DELETE /api/v1/reservations/:id
- PATCH /api/v1/reservations/:id/status

**Frontend:**
- Rezervasyon listesi (tablo + filtreleme)
- Yeni rezervasyon formu (wizard - adım adım)
  - Adım 1: Müşteri seçimi/oluşturma
  - Adım 2: Tur bilgileri
  - Adım 3: Günlük program (TourDay ekleme)
  - Adım 4: Fiyat ve ödeme
  - Adım 5: Özet ve kaydet
- Rezervasyon detay sayfası
- Durum güncelleme

### Hafta 7-8: Gelişmiş Özellikler

#### 4.3 Müsaitlik Kontrolü ⏱️ 3-4 gün
- [ ] Araç müsaitlik kontrolü (tarih çakışması)
- [ ] Rehber müsaitlik kontrolü
- [ ] Otel müsaitlik (opsiyonel - ileri seviye)
- [ ] Takvim görünümü

#### 4.4 Rezervasyon Kopyalama & Şablonlar ⏱️ 2-3 gün
- [ ] Rezervasyon kopyalama özelliği
- [ ] Tur şablonları (sık kullanılan turlar)
- [ ] Şablondan rezervasyon oluşturma

---

## 💰 FAZ 5: FİNANS MODÜLÜ (2 Hafta)

### Hafta 9: Ödeme Takibi

#### 5.1 Ödeme Yönetimi ⏱️ 4-5 gün
**Database Schema:**
```prisma
model Payment {
  id              Int      @id @default(autoincrement())
  reservationId   Int
  reservation     Reservation @relation(fields: [reservationId], references: [id])

  amount          Decimal
  currency        String   @default("USD")
  paymentMethod   PaymentMethod
  paymentDate     DateTime
  receiptNo       String?
  notes           String?

  createdAt       DateTime @default(now())
  createdBy       Int      // User ID
}

enum PaymentMethod {
  CASH
  CREDIT_CARD
  BANK_TRANSFER
  PAYPAL
  OTHER
}
```

**Frontend:**
- Ödeme listesi
- Ödeme ekleme (rezervasyon içinden)
- Alacak/borç durumu
- Ödeme geçmişi

### Hafta 10: Raporlama

#### 5.2 Finansal Raporlar ⏱️ 4-5 gün
- [ ] Günlük satış raporu
- [ ] Aylık gelir raporu
- [ ] Rezervasyon durumu raporu
- [ ] Müşteri analizi
- [ ] Excel export

---

## 🎨 FAZ 6: UI/UX İYİLEŞTİRMELERİ (1-2 Hafta)

### Hafta 11-12: Polish & Features

#### 6.1 UI Kütüphanesi Entegrasyonu ⏱️ 3-4 gün
- [ ] Ant Design veya Material-UI kurulumu
- [ ] Tüm formlara güzel component'ler
- [ ] Modal'lar
- [ ] Notification sistemi
- [ ] Loading states

#### 6.2 Dashboard & Analytics ⏱️ 3-4 gün
- [ ] Grafikler (Chart.js / Recharts)
- [ ] İstatistik kartları
- [ ] Yaklaşan turlar takvimi
- [ ] Hızlı işlemler

#### 6.3 Responsive Design ⏱️ 2-3 gün
- [ ] Mobil uyumlu
- [ ] Tablet görünümü
- [ ] Touch optimizasyonu

---

## 🔧 FAZ 7: ÖZELLİKLER & ENTEGRASYONLAR (2-3 Hafta)

### Hafta 13: Ek Özellikler

#### 7.1 Arama & Filtreleme ⏱️ 2-3 gün
- [ ] Global arama
- [ ] Gelişmiş filtreleme
- [ ] Sıralama

#### 7.2 Dosya Yükleme ⏱️ 2-3 gün
- [ ] Rezervasyona dosya ekleme (sözleşme, pasaport vb.)
- [ ] Müşteriye dosya ekleme
- [ ] S3 veya lokal storage

#### 7.3 Bildirimler ⏱️ 2 gün
- [ ] Email bildirimleri (rezervasyon onayı)
- [ ] SMS entegrasyonu (opsiyonel)
- [ ] In-app notifications

### Hafta 14-15: Gelişmiş Entegrasyonlar

#### 7.4 PDF Oluşturma ⏱️ 3-4 gün
- [ ] Rezervasyon voucher (PDF)
- [ ] Fatura (PDF)
- [ ] Tur programı (PDF)

#### 7.5 WhatsApp Business API ⏱️ 3-4 gün
- [ ] WhatsApp mesaj gönderimi
- [ ] Rezervasyon onay mesajı
- [ ] Hatırlatıcılar

---

## 🚀 FAZ 8: PRODUCTION READY (1 Hafta)

### Hafta 16: Final

#### 8.1 Güvenlik & Performans ⏱️ 2-3 gün
- [ ] Input validation (Zod)
- [ ] Rate limiting
- [ ] HTTPS (Let's Encrypt)
- [ ] Database indexleme
- [ ] Caching (Redis - opsiyonel)

#### 8.2 Testing & Deployment ⏱️ 2-3 gün
- [ ] Backend unit testleri
- [ ] E2E testler (Playwright)
- [ ] Production deployment
- [ ] Backup stratejisi
- [ ] Monitoring (PM2 + logs)

#### 8.3 Dokümantasyon ⏱️ 1-2 gün
- [ ] API dokümantasyonu
- [ ] Kullanıcı kılavuzu
- [ ] Admin kılavuzu

---

## 📊 ÖZET

### Toplam Süre: ~16 Hafta (4 ay)

**Kritik Path:**
1. Hafta 1-4: Temel altyapı ve kaynak yönetimi
2. Hafta 5-8: Rezervasyon sistemi (en önemli)
3. Hafta 9-10: Finans ve raporlama
4. Hafta 11-16: İyileştirmeler ve entegrasyonlar

### Öncelik Sırası:
🔴 **Kritik:** Rezervasyon, Müşteri, Otel, Araç, Rehber
🟡 **Önemli:** Finans, Raporlar, Kullanıcı Yönetimi
🟢 **Nice to Have:** WhatsApp, PDF, Gelişmiş Raporlar

### İlk 30 Günde Yapılacaklar:
- ✅ Deployment
- ✅ Kullanıcı yönetimi
- ✅ Otel, Araç, Rehber modülleri
- ✅ Müşteri yönetimi
- ⏳ Temel rezervasyon sistemi

---

## 🎯 BAŞARLI OLMA KRİTERLERİ

### Minimum Viable Product (MVP):
- [x] Login/Logout çalışıyor
- [ ] Kullanıcıları yönetebiliyoruz
- [ ] Otel/Araç/Rehber ekleyebiliyoruz
- [ ] Müşteri ekleyebiliyoruz
- [ ] Rezervasyon oluşturabiliyoruz
- [ ] Ödeme takibi yapabiliyoruz
- [ ] Basit raporlar alabiliyoruz

### Production Ready:
- [ ] Tüm modüller çalışıyor
- [ ] UI modern ve kullanıcı dostu
- [ ] Mobil uyumlu
- [ ] Güvenli (HTTPS, validation)
- [ ] Performanslı
- [ ] Backup sistemi var

---

**Hazırlayan:** Claude Code
**Tarih:** 2025-10-29
**Versiyon:** 1.0
