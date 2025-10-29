# 🔄 Environment Variables Güncelleme Rehberi

## ⚠️ ÖNEMLİ UYARI

.env dosyalarını her güncellediğinde **MUTLAKA** server'daki dosyaları da güncellemelisin!

---

## 📍 .env Dosyalarının Konumları

### Lokal (Geliştirme)
- Backend: `C:\Users\fatih\Desktop\CRM\backend\.env`
- Frontend: `C:\Users\fatih\Desktop\CRM\frontend\.env`

### Server (Production)
- Backend: `/root/crm-env-backup/backend.env`
- Frontend: `/root/crm-env-backup/frontend.env`

---

## 🔄 Güncelleme Adımları

### 1. Lokal'de .env Güncelle
Önce lokal dosyayı düzenle:
```bash
# Backend
notepad backend\.env

# Frontend
notepad frontend\.env
```

### 2. Server'a Kopyala

#### Backend .env Güncelleme
```bash
# PowerShell/CMD
type backend\.env | ssh root@134.209.137.11 "cat > /root/crm-env-backup/backend.env"

# Veya manuel:
ssh root@134.209.137.11
nano /root/crm-env-backup/backend.env
# Düzenle ve kaydet
```

#### Frontend .env Güncelleme
```bash
# PowerShell/CMD
type frontend\.env | ssh root@134.209.137.11 "cat > /root/crm-env-backup/frontend.env"

# Veya manuel:
ssh root@134.209.137.11
nano /root/crm-env-backup/frontend.env
# Düzenle ve kaydet
```

### 3. Server'da Aktif Et
```bash
ssh root@134.209.137.11

# Backend .env'i kopyala
cd /root/crm/backend
cp /root/crm-env-backup/backend.env .env

# Frontend .env'i kopyala
cd /root/crm/frontend
cp /root/crm-env-backup/frontend.env .env

# Backend'i yeniden başlat
pm2 restart crm-backend

# Frontend build'i yenile (eğer değişiklik varsa)
cd /root/crm/frontend
npm run build
```

---

## 📋 Güncelleme Checklist

- [ ] Lokal .env dosyasını güncelle
- [ ] Değişiklikleri test et (lokal'de çalıştır)
- [ ] Server'a .env dosyasını kopyala
- [ ] Server'da .env dosyasını doğru konuma taşı
- [ ] Backend'i restart et (pm2 restart)
- [ ] Frontend varsa rebuild et
- [ ] Production'da test et

---

## 🚨 Dikkat Edilmesi Gerekenler

### 1. Database URL
- **Lokal**: `postgresql://...@localhost:5432/...`
- **Server**: `postgresql://...@134.209.137.11:5432/...`

### 2. Frontend URL
- **Lokal**: `http://localhost:5173`
- **Server**: `http://134.209.137.11:3000` veya domain

### 3. NODE_ENV
- **Lokal**: `development`
- **Server**: `production`

### 4. JWT Secret
- Production'da mutlaka güçlü bir secret kullan
- Lokal ve production farklı olmalı

---

## 🔒 Güvenlik Notları

1. **.env dosyalarını asla Git'e commit etme**
2. Hassas bilgileri Slack/Email ile paylaşma
3. Production secrets'ları ayrı tut
4. Server'da backup al: `/root/crm-env-backup/`
5. .env.example'ı güncel tut ama gerçek değerler yazma

---

## 📝 Mevcut Environment Variables

### Backend (.env)
```
DATABASE_URL
JWT_SECRET
PORT
NODE_ENV
FRONTEND_URL
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_FIRST_NAME
ADMIN_LAST_NAME
```

### Frontend (.env)
```
VITE_API_URL
```

---

## 🛠️ Hızlı Komutlar

```bash
# Server'daki .env'leri görüntüle
ssh root@134.209.137.11 "cat /root/crm-env-backup/backend.env"
ssh root@134.209.137.11 "cat /root/crm-env-backup/frontend.env"

# Backup'ları listele
ssh root@134.209.137.11 "ls -lah /root/crm-env-backup/"

# Aktif .env'leri görüntüle
ssh root@134.209.137.11 "cat /root/crm/backend/.env"
ssh root@134.209.137.11 "cat /root/crm/frontend/.env"
```

---

**Son Güncelleme**: 2025-10-29
**Oluşturan**: Claude Code
