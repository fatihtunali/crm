#!/bin/bash

# Tour Operator CRM - Stop Development Services
# Bu script tüm development servislerini durdurur

echo "🛑 Stopping Tour Operator CRM Services..."
echo "========================================"
echo ""

# Port bilgileri
BACKEND_PORT=5000
FRONTEND_PORT=5173

# Backend'i durdur (Windows için netstat kullan)
echo "🔴 Stopping Backend (Port $BACKEND_PORT)..."
netstat -ano | grep ":$BACKEND_PORT " | grep LISTENING | awk '{print $5}' | while read pid; do
    taskkill //F //PID $pid >nul 2>&1 && echo "  ✅ Backend stopped (PID: $pid)" || echo "  ℹ️  Backend was not running"
done

# Frontend'i durdur
echo "🔴 Stopping Frontend (Port $FRONTEND_PORT)..."
netstat -ano | grep ":$FRONTEND_PORT " | grep LISTENING | awk '{print $5}' | while read pid; do
    taskkill //F //PID $pid >nul 2>&1 && echo "  ✅ Frontend stopped (PID: $pid)" || echo "  ℹ️  Frontend was not running"
done

echo ""
echo "✅ All services stopped!"
echo ""
