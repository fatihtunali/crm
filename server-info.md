# CRM Projesi - Server Bilgileri

## 🖥️ Digital Ocean Sunucu

### SSH Bağlantı
```bash
ssh root@134.209.137.11
ssh crm@134.209.137.11
```

### Kullanıcı Bilgileri
- **Root Kullanıcı**: root
- **CRM Kullanıcı**: crm
- **Şifre**: Dlr235672.-Yt

---

## 🗄️ PostgreSQL Veritabanı

### Bağlantı Bilgileri
```
Host: 134.209.137.11
Port: 5432
Database: crm
User: crm
Password: Dlr235672.-Yt
```

### Connection String
```
DATABASE_URL="postgresql://crm:Dlr235672.-Yt@134.209.137.11:5432/crm?schema=public"
```

### PostgreSQL Komutları
```bash
# Sunucuda PostgreSQL'e bağlan
sudo -u postgres psql

# crm veritabanına bağlan
psql -U crm -d crm -h localhost
```

---

## 🛠️ Kurulu Araçlar

### Sistem
- **OS**: Ubuntu 22.04 LTS
- **Location**: Amsterdam

### Yazılımlar
- **Node.js**: v20.19.5
- **npm**: 10.8.2
- **PostgreSQL**: 14.19
- **Nginx**: 1.18.0
- **PM2**: 6.0.13 (Process Manager)
- **Prisma**: CLI kurulu
- **Git**: 2.34.1

---

## 📦 Deployment Notları

### PM2 ile Uygulama Başlatma
```bash
# Backend başlat
pm2 start npm --name "crm-backend" -- start

# Frontend başlat (build sonrası static serve)
pm2 start npm --name "crm-frontend" -- run preview

# Servisleri listele
pm2 list

# Logları görüntüle
pm2 logs

# Restart
pm2 restart crm-backend
```

### Nginx Yapılandırma
```bash
# Config dosyası
sudo nano /etc/nginx/sites-available/crm

# Nginx test
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx
```

---

## 🔐 Güvenlik Notları

1. PostgreSQL varsayılan olarak sadece localhost'tan erişilebilir
2. Uzaktan erişim için `/etc/postgresql/14/main/postgresql.conf` düzenle
3. `pg_hba.conf` dosyasında IP kısıtlamaları ayarla
4. SSL sertifikası için Let's Encrypt kullan

---

## ⚡ Hızlı Komutlar

```bash
# Servis durumları
systemctl status postgresql
systemctl status nginx
pm2 status

# Disk kullanımı
df -h

# Bellek kullanımı
free -h

# Port kontrolü
netstat -tulpn | grep LISTEN
```

---

**Oluşturma Tarihi**: 2025-10-29
**Son Güncelleme**: 2025-10-29
