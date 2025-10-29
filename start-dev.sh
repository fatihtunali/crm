#!/bin/bash

# Tour Operator CRM - Development Startup Script
# Bu script backend ve frontend'i sabit portlarda başlatır

echo "🚀 Tour Operator CRM - Development Mode"
echo "========================================"
echo ""

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Port bilgileri
BACKEND_PORT=5000
FRONTEND_PORT=5173

echo "📍 Backend Port: $BACKEND_PORT"
echo "📍 Frontend Port: $FRONTEND_PORT"
echo ""

# Backend portu temizle (Windows için netstat kullan)
echo -e "${YELLOW}🧹 Clearing port $BACKEND_PORT...${NC}"
netstat -ano | grep ":$BACKEND_PORT " | grep LISTENING | awk '{print $5}' | while read pid; do
    taskkill //F //PID $pid >nul 2>&1 && echo "  Killed process $pid" || echo "  Port $BACKEND_PORT is free"
done

# Frontend portu temizle
echo -e "${YELLOW}🧹 Clearing port $FRONTEND_PORT...${NC}"
netstat -ano | grep ":$FRONTEND_PORT " | grep LISTENING | awk '{print $5}' | while read pid; do
    taskkill //F //PID $pid >nul 2>&1 && echo "  Killed process $pid" || echo "  Port $FRONTEND_PORT is free"
done

echo ""
echo -e "${GREEN}✅ Ports cleared!${NC}"
echo ""

# Backend başlat
echo -e "${YELLOW}🔧 Starting Backend...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 2

# Frontend başlat
echo -e "${YELLOW}🎨 Starting Frontend...${NC}"
cd frontend
VITE_PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Services Started!${NC}"
echo ""
echo "📡 Backend:  http://localhost:$BACKEND_PORT"
echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "To stop services, run: ./stop-dev.sh"
echo ""
