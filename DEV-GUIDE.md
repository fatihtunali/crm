# 🚀 Tour Operator CRM - Development Guide

## Sabit Portlar

Artık servisler her zaman aynı portlarda çalışır:

- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:5173`

## 🎯 Hızlı Başlangıç

### Windows

```batch
# Servisleri başlat
start-dev.bat

# Servisleri durdur
stop-dev.bat
```

### Linux/Mac

```bash
# Servisleri başlat
./start-dev.sh

# Servisleri durdur
./stop-dev.sh
```

## 📝 Script'ler Ne Yapar?

### start-dev (başlat)
1. Port 5000'i temizler (Backend)
2. Port 5173'ü temizler (Frontend)
3. Backend'i başlatır
4. Frontend'i başlatır
5. Her ikisini de arka planda çalıştırır

### stop-dev (durdur)
1. Port 5000'deki tüm process'leri öldürür
2. Port 5173'teki tüm process'leri öldürür
3. Temiz bir şekilde kapatır

## ⚠️ Önemli Notlar

- **Script'leri kullan:** Manuel port temizleme yerine bu script'leri kullan
- **Port çakışması olursa:** `stop-dev` çalıştır, sonra `start-dev` çalıştır
- **ASLA kullanma:** `taskkill /F /IM node.exe` - Bu komutu asla kullanma!

## 🔧 Manuel Başlatma (Gerekirse)

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

## 📍 API Endpoints

- **Auth:** `POST http://localhost:5000/api/v1/auth/login`
- **Hotels:** `http://localhost:5000/api/v1/hotels`
- **Vehicles:** `http://localhost:5000/api/v1/vehicles`
- **Guides:** `http://localhost:5000/api/v1/guides`
- **Suppliers:** `http://localhost:5000/api/v1/suppliers`

## 🐛 Sorun Giderme

### Port zaten kullanımda hatası
```batch
# Windows
stop-dev.bat

# Linux/Mac
./stop-dev.sh
```

### Tailwind çalışmıyor
```bash
cd frontend
npm install
```

### Backend bağlanamıyor
- Database connection string'i kontrol et
- `.env` dosyasının doğru olduğundan emin ol
- PostgreSQL'in çalıştığından emin ol

## 📦 Yeni Başlangıç (Fresh Start)

```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## 🎨 Frontend URL'leri

- **Login:** http://localhost:5173/login
- **Dashboard:** http://localhost:5173/dashboard
- **Hotels:** http://localhost:5173/resources/hotels
- **Vehicles:** http://localhost:5173/resources/vehicles
- **Guides:** http://localhost:5173/resources/guides
- **Suppliers:** http://localhost:5173/resources/suppliers

## ✅ Başarılı Başlatma Kontrolü

Script çalıştıktan sonra:

1. Backend: http://localhost:5000 - `{"message":"Tour Operator CRM API"}` görmeli
2. Frontend: http://localhost:5173 - Login sayfası açılmalı

---

**Son Güncelleme:** 2025-10-29
