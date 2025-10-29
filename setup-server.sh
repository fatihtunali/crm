#!/bin/bash

echo "🚀 Tour Operator CRM - Server Setup"
echo "===================================="

# Renklendirme
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Projeyi klonla (eğer yoksa)
if [ ! -d "crm" ]; then
    echo -e "${BLUE}📦 Repository klonlanıyor...${NC}"
    git clone https://github.com/fatihtunali/crm.git
    cd crm
else
    echo -e "${BLUE}📦 Repository güncelleniyor...${NC}"
    cd crm
    git pull
fi

# 2. Backend kurulumu
echo -e "${BLUE}🔧 Backend kurulumu...${NC}"
cd backend

# Node modules yükle
npm install

# .env dosyasını oluştur
echo -e "${GREEN}📝 Backend .env dosyası oluşturuluyor...${NC}"
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://crm:Dlr235672.-Yt@134.209.137.11:5432/crm?schema=public"

# JWT Secret
JWT_SECRET="crm-tour-operator-production-secret-2025-XyZ!@#$%"

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL="http://134.209.137.11:3000"
EOF

# Prisma setup
echo -e "${GREEN}🗄️  Prisma migration çalıştırılıyor...${NC}"
npx prisma generate
npx prisma migrate deploy

# Build
echo -e "${GREEN}🔨 Backend build ediliyor...${NC}"
npm run build

# 3. Frontend kurulumu
echo -e "${BLUE}🎨 Frontend kurulumu...${NC}"
cd ../frontend

# Node modules yükle
npm install

# .env dosyasını oluştur
echo -e "${GREEN}📝 Frontend .env dosyası oluşturuluyor...${NC}"
cat > .env << 'EOF'
VITE_API_URL=http://134.209.137.11:5000/api/v1
EOF

# Build
echo -e "${GREEN}🔨 Frontend build ediliyor...${NC}"
npm run build

# 4. PM2 ile başlat
echo -e "${BLUE}🚀 Uygulamalar başlatılıyor...${NC}"
cd ../backend

# PM2 yoksa yükle
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}📦 PM2 yükleniyor...${NC}"
    npm install -g pm2
fi

# Backend'i başlat
pm2 delete crm-backend 2>/dev/null || true
pm2 start dist/index.js --name crm-backend

# Frontend serve (Nginx kullanacaksan bunu atlayabilirsin)
# pm2 serve frontend/dist 3000 --name crm-frontend --spa

# PM2 kaydet
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}✅ Kurulum tamamlandı!${NC}"
echo ""
echo "📊 PM2 durumunu kontrol et: pm2 status"
echo "📝 Logları gör: pm2 logs crm-backend"
echo ""
echo "🌐 Backend: http://134.209.137.11:5000"
echo "🌐 Frontend: http://134.209.137.11:3000"
