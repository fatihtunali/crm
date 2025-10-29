# Tour Operator CRM

Tur operatörleri için geliştirilmiş kapsamlı CRM ve yönetim sistemi.

## Özellikler

- 🔐 Kullanıcı girişi ve rol bazlı yetkilendirme
- 📅 Rezervasyon yönetimi
- 🏨 Otel, araç ve rehber yönetimi
- 💰 Finans ve fatura takibi
- 📊 Raporlama ve analiz
- 👥 Müşteri yönetimi (CRM)

## Teknolojiler

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios

## Kurulum

### Backend

```bash
cd backend
npm install

# .env dosyasını oluştur
cp .env.example .env

# Prisma client oluştur
npm run prisma:generate

# Development mode
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# .env dosyasını oluştur
# VITE_API_URL=http://localhost:5000/api/v1

# Development mode
npm run dev
```

## Kullanım

1. Backend'i başlat: `cd backend && npm run dev`
2. Frontend'i başlat: `cd frontend && npm run dev`
3. Tarayıcıda `http://localhost:5173` adresine git

## Kullanıcı Rolleri

- **SUPER_ADMIN**: Tüm yetkilere sahip sistem yöneticisi
- **ADMIN**: Yönetici
- **OPERATOR**: Operasyon yöneticisi
- **ACCOUNTING**: Muhasebe
- **SALES**: Satış

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Giriş yap
- `POST /api/v1/auth/register` - Yeni kullanıcı oluştur (ADMIN+)
- `GET /api/v1/auth/me` - Mevcut kullanıcı bilgisi

## Lisans

MIT

## İletişim

Sorularınız için: [GitHub Issues](https://github.com/fatihtunali/crm/issues)
