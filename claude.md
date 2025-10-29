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
DATABASE_URL="postgresql://crm:Dlr235672.-Yt@134.209.137.11:5432/crm?schema=public"
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
**Durum**: Altyapı Hazır - Lokal Geliştirme Başlıyor
