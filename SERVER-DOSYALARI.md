# 📂 Server Dosya Konumları

## 🔐 Environment Variables (Production)

### Backup Konumu
```bash
/root/crm-env-backup/
├── backend.env    # Backend production env
└── frontend.env   # Frontend production env
```

### Server'dan Lokal'e Çekme Komutları

#### Backend .env İndir
```bash
scp root@134.209.137.11:/root/crm-env-backup/backend.env backend/.env.production
```

#### Frontend .env İndir
```bash
scp root@134.209.137.11:/root/crm-env-backup/frontend.env frontend/.env.production
```

#### Her İkisini Birden
```bash
# Backend
scp root@134.209.137.11:/root/crm-env-backup/backend.env backend/.env.production

# Frontend
scp root@134.209.137.11:/root/crm-env-backup/frontend.env frontend/.env.production
```

---

## 📁 Proje Konumları (Server)

### Ana Proje Klasörü
```bash
/root/crm/
├── backend/
│   ├── .env              # Aktif backend env
│   ├── node_modules/
│   ├── dist/             # Build çıktıları
│   └── src/
└── frontend/
    ├── .env              # Aktif frontend env
    ├── node_modules/
    ├── dist/             # Build çıktıları
    └── src/
```

### Backup Klasörü
```bash
/root/crm-env-backup/
├── backend.env           # Backend env backup
├── frontend.env          # Frontend env backup
└── (ileride buraya db backup vb eklenebilir)
```

---

## 🔄 Server'dan Dosya Görüntüleme

### .env Dosyalarını Görüntüle
```bash
# Backup'ları görüntüle
ssh root@134.209.137.11 "cat /root/crm-env-backup/backend.env"
ssh root@134.209.137.11 "cat /root/crm-env-backup/frontend.env"

# Aktif .env'leri görüntüle
ssh root@134.209.137.11 "cat /root/crm/backend/.env"
ssh root@134.209.137.11 "cat /root/crm/frontend/.env"
```

### Dosya Listelerini Görüntüle
```bash
# Backup klasörünü listele
ssh root@134.209.137.11 "ls -lah /root/crm-env-backup/"

# Proje klasörünü listele
ssh root@134.209.137.11 "ls -lah /root/crm/"
```

---

## 📤 Lokal'den Server'a Gönderme

### .env Dosyalarını Server'a Yükle
```bash
# Backend .env gönder
type backend\.env | ssh root@134.209.137.11 "cat > /root/crm-env-backup/backend.env"

# Frontend .env gönder
type frontend\.env | ssh root@134.209.137.11 "cat > /root/crm-env-backup/frontend.env"

# Aktif konuma kopyala (server'da)
ssh root@134.209.137.11 "cp /root/crm-env-backup/backend.env /root/crm/backend/.env"
ssh root@134.209.137.11 "cp /root/crm-env-backup/frontend.env /root/crm/frontend/.env"
```

---

## 🗄️ Database Backup Konumları (İleride)

### Backup Klasörü
```bash
/root/crm-backups/
├── db/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
└── files/
    └── uploads/
```

### Database Backup Alma
```bash
# Manual backup
ssh root@134.209.137.11 "pg_dump -U crm -h localhost crm > /root/crm-backups/db/backup-$(date +%Y%m%d-%H%M%S).sql"

# Backup'ı lokal'e çek
scp root@134.209.137.11:/root/crm-backups/db/backup-*.sql ./backups/
```

---

## 📋 Hızlı Komutlar

### Server'a SSH Bağlan
```bash
ssh root@134.209.137.11
```

### Server Durumunu Kontrol Et
```bash
# PostgreSQL durumu
ssh root@134.209.137.11 "systemctl status postgresql@14-main"

# PM2 durumu (backend)
ssh root@134.209.137.11 "pm2 status"

# Disk kullanımı
ssh root@134.209.137.11 "df -h"

# Memory kullanımı
ssh root@134.209.137.11 "free -h"
```

### Log'ları İzle
```bash
# Backend logs
ssh root@134.209.137.11 "pm2 logs crm-backend"

# PostgreSQL logs
ssh root@134.209.137.11 "tail -f /var/log/postgresql/postgresql-14-main.log"
```

---

## 🔧 Önemli Notlar

### 1. .env Güncellemesi
- Lokal'de `.env` değiştirdiğinde:
  1. Server'daki backup'ı güncelle → `/root/crm-env-backup/`
  2. Aktif dosyayı kopyala → `/root/crm/backend/.env`
  3. Backend'i restart et → `pm2 restart crm-backend`

### 2. Güvenlik
- Backup klasörü sadece root erişebilir
- .env dosyaları asla Git'e commit edilmez
- Server'da regular backup al

### 3. Senkronizasyon
- Lokal ve server .env farklı olabilir (DATABASE_URL, NODE_ENV vb.)
- Production değerleri server'da, development değerleri lokal'de
- .env.example her zaman güncel tut

---

**Server IP:** 134.209.137.11
**SSH User:** root
**SSH Port:** 22
**Lokasyon:** Amsterdam, Digital Ocean

---

**Oluşturulma:** 2025-10-29
**Son Güncelleme:** 2025-10-29
**Oluşturan:** Claude Code
