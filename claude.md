# Tour Operatörü CRM Projesi - Geliştirme Notları

## 📋 Proje Özeti

Masaüstü ve web tabanlı, dışarıdan erişilebilen, tur operatörü yönetim sistemi.

**Amaç**: Rezervasyonlar, oteller, araçlar, rehberler ve tüm turizm operasyonlarını yönetmek.

---

## 🏗️ Teknoloji Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite (⚡ Lightning fast)
- **UI Library**: TBD (Ant Design / Material-UI / ShadcN)
- **State Management**: React Context / Zustand
- **Routing**: React Router
- **API Client**: Axios

### Backend
- **Runtime**: Node.js v20
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod / Joi

### Database
- **DBMS**: PostgreSQL 14
- **Location**: Digital Ocean - Amsterdam
- **ORM**: Prisma

### DevOps
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (certbot)
- **Version Control**: Git

---

## 📦 Temel Modüller

### 1. Rezervasyon Yönetimi
- [ ] Rezervasyon oluşturma/düzenleme/silme
- [ ] Rezervasyon durumu (pending, confirmed, cancelled, completed)
- [ ] Otomatik rezervasyon kodu üretimi
- [ ] Online rezervasyon entegrasyonu (Booking.com, Expedia)
- [ ] Ödeme takibi

### 2. Tur Yönetimi
- [ ] Tur programları oluşturma
- [ ] Günlük itinerary (gün gün program)
- [ ] Tur şablonları
- [ ] Fiyat hesaplama (dinamik)
- [ ] Tur kopyalama özelliği

### 3. Kaynak Yönetimi

#### Oteller
- [ ] Otel havuzu
- [ ] Anlaşmalı fiyatlar
- [ ] Müsaitlik takvimi
- [ ] Kontak bilgileri

#### Araçlar
- [ ] Araç filosu yönetimi
- [ ] Plaka, kapasite, tip
- [ ] Şoför bilgileri
- [ ] Bakım takibi
- [ ] Müsaitlik durumu

#### Rehberler
- [ ] Rehber bilgileri
- [ ] Dil yetkinlikleri (array)
- [ ] Günlük ücret
- [ ] Müsaitlik takvimi
- [ ] Performance takibi

### 4. Müşteri Yönetimi (CRM)
- [ ] Müşteri veritabanı
- [ ] İletişim geçmişi
- [ ] Özel notlar
- [ ] Sadakat programı
- [ ] Email/SMS gönderimi

### 5. Finans Modülü
- [ ] Fatura oluşturma
- [ ] Maliyet hesaplama
- [ ] Kar-zarar analizi
- [ ] Alacak/Borç takibi
- [ ] Ödeme geçmişi

### 6. Raporlama
- [ ] Satış raporları
- [ ] Doluluk oranları
- [ ] Müşteri analizi
- [ ] Finansal raporlar (günlük/aylık/yıllık)
- [ ] Excel/PDF export

### 7. Kullanıcı Yönetimi
- [ ] Rol bazlı yetkilendirme
  - Admin
  - Operatör
  - Muhasebe
  - Sales
- [ ] Kullanıcı aktivite logları
- [ ] Multi-tenant support (opsiyonel)

---

## 🗂️ Veritabanı Şeması (Prisma)

### Ana Tablolar
1. **customers** - Müşteriler
2. **reservations** - Rezervasyonlar
3. **tour_days** - Günlük tur detayları
4. **hotels** - Oteller
5. **vehicles** - Araçlar
6. **guides** - Rehberler
7. **payments** - Ödemeler
8. **users** - Sistem kullanıcıları
9. **suppliers** - Tedarikçiler (restoran, müze, vb.)

---

## 🚀 Geliştirme Planı

### Faz 1: MVP (2-3 ay)
- [x] Server altyapısı kurulumu
- [ ] Lokal geliştirme ortamı
- [ ] Database schema (Prisma)
- [ ] Temel CRUD API'ler
- [ ] React frontend kurulumu
- [ ] Authentication (login/logout)
- [ ] Rezervasyon modülü (temel)
- [ ] Otel/Araç/Rehber kayıt

### Faz 2: Operasyonel (2-3 ay)
- [ ] Gelişmiş planlama özellikleri
- [ ] Çakışma kontrolü
- [ ] Email/SMS entegrasyonu
- [ ] Dashboard ve raporlar
- [ ] Finans modülü
- [ ] PDF/Excel export

### Faz 3: İleri Özellikler (2-3 ay)
- [ ] Mobil responsive
- [ ] PWA desteği
- [ ] WhatsApp Business entegrasyonu
- [ ] Otomatik rezervasyon sync
- [ ] Gelişmiş analitik
- [ ] Multi-dil desteği

---

## 🎨 UI/UX Tasarım Kararları

### Renk Paleti
- **Primary**: TBD
- **Secondary**: TBD
- **Success**: Green
- **Warning**: Orange
- **Danger**: Red

### Sayfa Yapısı
```
├── Dashboard (Ana Sayfa)
├── Rezervasyonlar
│   ├── Tüm Rezervasyonlar
│   ├── Yeni Rezervasyon
│   └── Rezervasyon Detay
├── Turlar
│   ├── Aktif Turlar
│   ├── Tur Şablonları
│   └── Tur Oluştur
├── Kaynaklar
│   ├── Oteller
│   ├── Araçlar
│   ├── Rehberler
│   └── Tedarikçiler
├── Müşteriler
├── Finans
│   ├── Faturalar
│   ├── Ödemeler
│   └── Raporlar
└── Ayarlar
    ├── Kullanıcılar
    ├── Şirket Bilgileri
    └── Entegrasyonlar
```

---

## 🔧 Lokal Geliştirme Ortamı

### Gereksinimler
- [x] Node.js v20+
- [x] PostgreSQL (uzak sunucu kullanacağız)
- [ ] VS Code
- [ ] Git

### İlk Kurulum
```bash
# 1. Proje klasörü oluştur
cd ~/Desktop/CRM
mkdir tour-operator-crm
cd tour-operator-crm

# 2. Backend kurulumu
mkdir backend
cd backend
npm init -y
npm install express prisma @prisma/client typescript ts-node
npm install -D @types/node @types/express nodemon

# 3. Frontend kurulumu
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# 4. Prisma setup
cd ../backend
npx prisma init
```

### Environment Variables (.env)
```env
# Backend .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
```

---

## 📝 Notlar ve Kararlar

### API Endpoint Yapısı
```
/api/v1/auth          - Authentication
/api/v1/reservations  - Rezervasyonlar
/api/v1/hotels        - Oteller
/api/v1/vehicles      - Araçlar
/api/v1/guides        - Rehberler
/api/v1/customers     - Müşteriler
/api/v1/payments      - Ödemeler
/api/v1/reports       - Raporlar
```

### Öncelikli Özellikler
1. Rezervasyon CRUD
2. Kaynak (otel/araç/rehber) yönetimi
3. Müsaitlik kontrolü
4. Basit raporlama

### Sonra Eklenecekler
- Email entegrasyonu
- WhatsApp entegrasyonu
- Online ödeme
- Multi-currency
- Multi-language

---

## 🐛 Bilinen Sorunlar / TODO

- [ ] PostgreSQL'e uzaktan bağlantı için güvenlik ayarları
- [ ] SSL sertifikası kurulumu
- [ ] Backup stratejisi
- [ ] CI/CD pipeline

---

## 📚 Kaynaklar

- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Express.js](https://expressjs.com)
- [Vite](https://vitejs.dev)
- [PM2](https://pm2.keymetrics.io)

---

**Proje Başlangıç**: 2025-10-29
**Son Güncelleme**: 2025-10-29
**Durum**: ✅ Giriş Sistemi Tamamlandı - Dashboard Hazır

---

## ✅ TAMAMLANAN İŞLER (2025-10-29)

### 1. Backend Altyapısı
- ✅ Express.js + TypeScript kurulumu yapıldı
- ✅ Prisma ORM entegrasyonu tamamlandı
- ✅ JWT authentication sistemi oluşturuldu
- ✅ Rol bazlı yetkilendirme middleware'i yazıldı
- ✅ User modeli ve database şeması oluşturuldu

**Oluşturulan Dosyalar:**
```
backend/
├── src/
│   ├── index.ts                      # Express server
│   ├── controllers/
│   │   └── auth.controller.ts        # Login, Register, Me endpoints
│   ├── middleware/
│   │   └── auth.ts                   # JWT ve rol kontrolü middleware
│   ├── routes/
│   │   └── auth.routes.ts            # Auth route'ları
│   └── lib/
│       ├── prisma.ts                 # Prisma client singleton
│       └── jwt.ts                    # JWT token işlemleri
├── prisma/
│   └── schema.prisma                 # Database şeması
├── .env                              # Environment variables (local)
├── .env.production                   # Production env
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript config
```

**User Modeli:**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // bcrypt hash
  firstName String
  lastName  String
  role      UserRole @default(OPERATOR)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  SUPER_ADMIN  // Tüm yetkilere sahip
  ADMIN        // Yönetici
  OPERATOR     // Operasyon
  ACCOUNTING   // Muhasebe
  SALES        // Satış
}
```

**API Endpoints:**
- `POST /api/v1/auth/login` - Giriş yap
- `POST /api/v1/auth/register` - Yeni kullanıcı (ADMIN+)
- `GET /api/v1/auth/me` - Mevcut kullanıcı

### 2. Frontend Altyapısı
- ✅ React 18 + TypeScript + Vite kurulumu
- ✅ React Router entegrasyonu
- ✅ Axios API client yapılandırması
- ✅ Login sayfası tasarlandı (gradient design)
- ✅ Dashboard sayfası oluşturuldu
- ✅ Protected routes sistemi
- ✅ Authentication service (token yönetimi)

**Oluşturulan Dosyalar:**
```
frontend/
├── src/
│   ├── App.tsx                       # Ana routing
│   ├── pages/
│   │   ├── Login.tsx                 # Login sayfası (modern UI)
│   │   └── Dashboard.tsx             # Dashboard (modül kartları)
│   ├── components/
│   │   └── ProtectedRoute.tsx        # Route koruma
│   ├── services/
│   │   ├── api.ts                    # Axios instance
│   │   └── auth.service.ts           # Auth işlemleri
│   └── index.css                     # Global styles
├── .env                              # API URL (local)
└── .env.production                   # Production env
```

**Özellikler:**
- Modern gradient tasarım (purple/blue)
- Responsive form design
- Token-based authentication
- Automatic redirect (401 hatalarında)
- LocalStorage token yönetimi
- Role-based UI (kullanıcı rolüne göre)

### 3. Git & GitHub
- ✅ Repository oluşturuldu: https://github.com/fatihtunali/crm
- ✅ .gitignore yapılandırıldı (.env, node_modules, dist vb.)
- ✅ README.md hazırlandı
- ✅ İlk commit ve push yapıldı

### 4. Deployment Hazırlığı
- ✅ setup-server.sh scripti yazıldı (otomatik kurulum)
- ✅ SUNUCU-KURULUM.md rehberi hazırlandı
- ✅ Production .env dosyaları oluşturuldu
- ✅ PM2 configuration notları eklendi
- ✅ Nginx yapılandırma örneği hazırlandı

---

## 🎯 SONRAKİ ADIMLAR

### Acil Yapılacaklar
1. **Veritabanı Migration** - Sunucu bağlantısı kurulup migration çalıştırılacak
2. **İlk Super Admin** - Manuel olarak SUPER_ADMIN kullanıcı eklenecek
3. **Test** - Login/logout akışı test edilecek

### Modül Geliştirme Sırası
1. **Kullanıcı Yönetimi** - CRUD (sadece ADMIN+)
2. **Otel Yönetimi** - Otel havuzu oluşturma
3. **Araç Yönetimi** - Araç filosu
4. **Rehber Yönetimi** - Rehber havuzu
5. **Müşteri Yönetimi** - CRM modülü
6. **Rezervasyon Yönetimi** - Ana modül
7. **Finans Modülü** - Faturalar, ödemeler

---

## 📍 MEVCUT DURUM

### Çalışır Durumda
- ✅ Backend API server (port 5000)
- ✅ Frontend dev server (port 5173)
- ✅ Login/Logout sistemi
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Protected routes

### Bekleniyor
- ⏳ Veritabanı migration
- ⏳ İlk kullanıcı oluşturma
- ⏳ Sunucu deployment

### Lokal Test
```bash
# Backend
cd backend
npm run dev
# http://localhost:5000

# Frontend (yeni terminal)
cd frontend
npm run dev
# http://localhost:5173
```

---

## 🔐 GÜVENLİK NOTLARI

1. **JWT Secret**: Production'da mutlaka güçlü bir secret kullan
2. **Database Password**: .env dosyasını asla Git'e ekleme
3. **CORS**: Production'da sadece kendi domain'e izin ver
4. **HTTPS**: Let's Encrypt ile SSL sertifikası ekle
5. **Rate Limiting**: API için rate limiter ekle (gelecek)
6. **Input Validation**: Zod/Joi ile validation ekle (gelecek)

---

## 📞 DEPLOYMENT NOTLARI

### Sunucu Kurulum
```bash
# Sunucuya SSH ile bağlan
ssh root@134.209.137.11

# Otomatik kurulum
cd /root
curl -o setup.sh https://raw.githubusercontent.com/fatihtunali/crm/main/setup-server.sh
chmod +x setup.sh
./setup.sh
```

### İlk Super Admin Oluşturma
```bash
# Şifreyi hashle
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"

# Veritabanına ekle (Prisma Studio veya SQL)
npx prisma studio
```

### Güncelleme
```bash
cd /root/crm
git pull
cd backend && npm run build && pm2 restart crm-backend
cd ../frontend && npm run build
```

---

## 🗃️ DATABASE CONNECTION

**Connection String:**
```
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
```

**Not:** Database bilgileri .env dosyasında saklanmalıdır. Bu bilgiler asla Git'e eklenmemelidir.

---

## 🎨 UI/UX TASARIM

### Login Sayfası
- Modern gradient background (purple/blue)
- Centered card layout
- Email + Password form
- Error messages
- Loading states

### Dashboard
- Header with gradient (purple/blue)
- User info card
- 6 modül kartı (grid layout)
- "Yakında" buttons (tüm modüller)
- Logout button

### Renk Paleti (Kullanılan)
- Primary: #667eea (mavi)
- Secondary: #764ba2 (mor)
- Background: #f5f5f5 (açık gri)
- Card: white
- Text: #333

---

## 🔧 DEVELOPMENT NOTES

### Backend Scripts
```json
"dev": "nodemon src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio"
```

### Frontend Scripts
```json
"dev": "vite",
"build": "tsc && vite build",
"preview": "vite preview"
```

### Port'lar
- Backend: 5000
- Frontend (dev): 5173
- Frontend (production): 3000 (veya Nginx ile 80)
- Database: 5432
- Prisma Studio: 5555

---

**Son Güncelleme**: 2025-10-29 23:00
**Durum**: ✅ Authentication modülü tamamlandı, GitHub'a yüklendi
**Sonraki**: Veritabanı migration ve ilk kullanıcı oluşturma
