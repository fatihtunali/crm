# Sunucu Kurulum Rehberi

## Sunucu Bilgileri
- **IP**: 134.209.137.11
- **Location**: Amsterdam
- **Database**: PostgreSQL
- **User**: crm
- **Database Name**: crm

## Otomatik Kurulum

Sunucuya SSH ile bağlan ve şu komutu çalıştır:

```bash
# Root olarak
cd /root

# Kurulum scriptini çalıştır
curl -o setup.sh https://raw.githubusercontent.com/fatihtunali/crm/main/setup-server.sh
chmod +x setup.sh
./setup.sh
```

## Manuel Kurulum

### 1. Projeyi Klonla

```bash
cd /root
git clone https://github.com/fatihtunali/crm.git
cd crm
```

### 2. Backend Kurulumu

```bash
cd backend
npm install

# .env dosyası oluştur
nano .env
```

**.env içeriği:**
```env
DATABASE_URL="postgresql://crm:Dlr235672.-Yt@134.209.137.11:5432/crm?schema=public"
JWT_SECRET="crm-tour-operator-production-secret-2025-XyZ!@#$%"
PORT=5000
NODE_ENV=production
FRONTEND_URL="http://134.209.137.11:3000"
```

```bash
# Prisma migration
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# PM2 ile başlat
pm2 start dist/index.js --name crm-backend
pm2 save
```

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install

# .env dosyası oluştur
nano .env
```

**.env içeriği:**
```env
VITE_API_URL=http://134.209.137.11:5000/api/v1
```

```bash
# Build
npm run build

# Static dosyaları serve et (Nginx kullanabilirsin)
```

### 4. İlk Super Admin Kullanıcısını Oluştur

```bash
cd backend
npx prisma studio
```

Veya doğrudan SQL ile:

```sql
INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
  'admin@crm.com',
  '$2a$10$YourHashedPasswordHere',  -- bcrypt hash
  'Admin',
  'User',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

Şifreyi hashlemek için:

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

### 5. Nginx Yapılandırması (Opsiyonel)

```nginx
# /etc/nginx/sites-available/crm
server {
    listen 80;
    server_name 134.209.137.11;

    # Frontend
    location / {
        root /root/crm/frontend/dist;
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
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Kontrol Komutları

```bash
# PM2 durumu
pm2 status

# Logları görüntüle
pm2 logs crm-backend

# Restart
pm2 restart crm-backend

# Stop
pm2 stop crm-backend

# Database bağlantısını test et
cd backend
npx prisma studio
```

## Test

- Backend: http://134.209.137.11:5000
- Frontend: http://134.209.137.11:3000
- Login: admin@crm.com / admin123

## Güncelleme

```bash
cd /root/crm
git pull
cd backend && npm install && npm run build
pm2 restart crm-backend
cd ../frontend && npm install && npm run build
```
