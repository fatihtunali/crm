# 🚀 CRM Tur Operatörü - Deployment Rehberi

## 📋 Server'a Atılacak Dosyalar ve Adımlar

---

## 🔧 Ön Hazırlık

### 1. Lokal Geliştirmeyi Tamamla
- [ ] Backend tamamlandı ve test edildi
- [ ] Frontend build alındı (`npm run build`)
- [ ] Veritabanı migration'ları hazır
- [ ] .env dosyası production için hazırlandı

### 2. Server Bilgileri
```
IP: 134.209.137.11
User: crm
Password: Dlr235672.-Yt
Database: crm (PostgreSQL)
```

---

## 📦 Deployment Adımları

### ADIM 1: Lokal Projeyi Hazırla

```bash
# Frontend build
cd frontend
npm run build
# Bu dist/ klasörü oluşturur

# Backend build (TypeScript varsa)
cd ../backend
npm run build
```

### ADIM 2: Git Repository Oluştur (Önerilen)

```bash
# Lokal bilgisayarda
cd ~/Desktop/CRM/tour-operator-crm
git init
git add .
git commit -m "Initial commit"

# GitHub'a push (opsiyonel ama önerilen)
git remote add origin https://github.com/yourusername/tour-crm.git
git push -u origin main
```

### ADIM 3: Server'a Bağlan ve Klasör Oluştur

```bash
# SSH ile bağlan
ssh crm@134.209.137.11

# Proje klasörü oluştur
mkdir -p ~/apps/tour-crm
cd ~/apps/tour-crm
```

### ADIM 4: Dosyaları Server'a Aktar

**Seçenek A: Git ile (Önerilen)**
```bash
# Server'da
cd ~/apps/tour-crm
git clone https://github.com/yourusername/tour-crm.git .
```

**Seçenek B: SCP ile (Manuel)**
```bash
# Lokal bilgisayardan
cd ~/Desktop/CRM/tour-operator-crm

# Backend dosyalarını kopyala
scp -r backend crm@134.209.137.11:~/apps/tour-crm/

# Frontend build dosyalarını kopyala
scp -r frontend/dist crm@134.209.137.11:~/apps/tour-crm/frontend/
```

**Seçenek C: SFTP / FileZilla (GUI)**
```
Host: 134.209.137.11
Username: crm
Password: Dlr235672.-Yt
Port: 22

Aktar:
- backend/ klasörü
- frontend/dist/ klasörü
```

### ADIM 5: Server'da .env Dosyası Oluştur

```bash
# Server'da
cd ~/apps/tour-crm/backend

# .env dosyası oluştur
nano .env
```

**.env içeriği (Production):**
```env
DATABASE_URL="postgresql://crm:Dlr235672.-Yt@localhost:5432/crm?schema=public"
JWT_SECRET="crm-production-secret-2025-CHANGE-THIS"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=production
FRONTEND_URL="http://134.209.137.11"

# Email ayarları
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### ADIM 6: Backend Bağımlılıkları Kur

```bash
# Server'da
cd ~/apps/tour-crm/backend

# npm paketlerini kur
npm install --production

# Prisma migration ve generate
npx prisma generate
npx prisma migrate deploy
```

### ADIM 7: PM2 ile Backend Başlat

```bash
# Server'da
cd ~/apps/tour-crm/backend

# PM2 ile başlat
pm2 start npm --name "crm-backend" -- start

# Otomatik başlatma (server restart'ta)
pm2 save
pm2 startup

# Durumu kontrol et
pm2 list
pm2 logs crm-backend
```

### ADIM 8: Nginx Yapılandırması

```bash
# Server'da (root yetkisi gerekli)
sudo nano /etc/nginx/sites-available/crm
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name 134.209.137.11;  # veya domain.com

    # Frontend (static files)
    location / {
        root /home/crm/apps/tour-crm/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Nginx'i aktif et:**
```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### ADIM 9: SSL Sertifikası (HTTPS) - Opsiyonel

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d yourdomain.com

# Otomatik yenileme test
sudo certbot renew --dry-run
```

### ADIM 10: PostgreSQL Uzaktan Erişim (Sadece Gerekirse)

```bash
# PostgreSQL config düzenle
sudo nano /etc/postgresql/14/main/postgresql.conf

# Bul ve değiştir:
# listen_addresses = 'localhost'  →  listen_addresses = '*'

# pg_hba.conf düzenle
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ekle (dikkatli kullan - sadece bilinen IP'ler):
# host    all    all    0.0.0.0/0    md5

# PostgreSQL restart
sudo systemctl restart postgresql
```

---

## ✅ Deployment Checklist

- [ ] Backend dosyaları server'a yüklendi
- [ ] Frontend build dosyaları server'a yüklendi
- [ ] .env dosyası oluşturuldu (production ayarları)
- [ ] npm install çalıştırıldı
- [ ] Prisma migrations çalıştırıldı
- [ ] PM2 ile backend başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] Nginx reload edildi
- [ ] Uygulama erişilebilir (http://IP veya domain)
- [ ] SSL kuruldu (HTTPS)
- [ ] PM2 startup ayarlandı (auto-restart)

---

## 🔄 Güncelleme (Update) Adımları

```bash
# 1. Server'a bağlan
ssh crm@134.209.137.11

# 2. Proje klasörüne git
cd ~/apps/tour-crm

# 3. Yeni kodu çek (Git kullanıyorsan)
git pull origin main

# 4. Backend güncelle
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# 5. Frontend güncelle (lokal'de build aldıktan sonra)
# (SCP ile yeni dist klasörünü kopyala)

# 6. Backend'i restart et
pm2 restart crm-backend

# 7. Nginx reload (gerekirse)
sudo systemctl reload nginx

# 8. Kontrol et
pm2 logs crm-backend
curl http://localhost:5000/api/health
```

---

## 🐛 Sorun Giderme

### Backend başlamıyor
```bash
pm2 logs crm-backend --lines 100
pm2 restart crm-backend
```

### Database bağlantı hatası
```bash
# PostgreSQL çalışıyor mu?
systemctl status postgresql

# Bağlantı test et
psql -U crm -d crm -h localhost
```

### Nginx hatası
```bash
# Test config
sudo nginx -t

# Logs
sudo tail -f /var/log/nginx/error.log
```

### Port kullanımda
```bash
# Port 5000'i kim kullanıyor?
sudo netstat -tlnp | grep 5000
sudo lsof -i :5000

# Gerekirse kill et
pm2 delete crm-backend
```

---

## 📊 İzleme ve Bakım

### Log Dosyaları
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Performans İzleme
```bash
# PM2 monitoring
pm2 monit

# Sistem kaynakları
htop
df -h
free -h
```

### Backup
```bash
# Database backup (günlük cron job olarak ayarla)
pg_dump -U crm crm > ~/backups/crm-$(date +%Y%m%d).sql

# Proje dosyaları backup
tar -czf ~/backups/tour-crm-$(date +%Y%m%d).tar.gz ~/apps/tour-crm
```

---

## 📞 Önemli Komutlar

```bash
# PM2
pm2 list                    # Tüm process'leri listele
pm2 restart crm-backend     # Restart
pm2 stop crm-backend        # Durdur
pm2 delete crm-backend      # Sil
pm2 logs crm-backend        # Logları göster
pm2 save                    # Mevcut durumu kaydet
pm2 resurrect              # Kaydedilmiş durumu geri yükle

# Nginx
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl reload nginx
sudo nginx -t              # Config test

# PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo -u postgres psql
```

---

## 🔒 Güvenlik Notları

1. **.env dosyasını Git'e commit etme** (.gitignore'a ekle)
2. **Güçlü JWT_SECRET kullan** (production için değiştir)
3. **PostgreSQL şifresini değiştir** (production için)
4. **Firewall ayarla** (UFW)
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
5. **SSH key-based authentication kullan** (şifre yerine)
6. **SSL sertifikası kur** (Let's Encrypt)
7. **Düzenli backup al**

---

**Son Güncelleme**: 2025-10-29
**Durum**: Deployment Rehberi Hazır
