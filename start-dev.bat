@echo off
REM Tour Operator CRM - Development Startup Script (Windows)
REM Bu script backend ve frontend'i sabit portlarda başlatır

echo ========================================
echo 🚀 Tour Operator CRM - Development Mode
echo ========================================
echo.

SET BACKEND_PORT=5000
SET FRONTEND_PORT=5173

echo 📍 Backend Port: %BACKEND_PORT%
echo 📍 Frontend Port: %FRONTEND_PORT%
echo.

REM Backend portu temizle
echo 🧹 Clearing port %BACKEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%BACKEND_PORT%" ^| find "LISTENING"') do (
    echo   Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Frontend portu temizle
echo 🧹 Clearing port %FRONTEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%FRONTEND_PORT%" ^| find "LISTENING"') do (
    echo   Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✅ Ports cleared!
echo.

REM Backend başlat
echo 🔧 Starting Backend...
cd backend
start /B npm start
cd ..

timeout /t 2 /nobreak >nul

REM Frontend başlat
echo 🎨 Starting Frontend...
cd frontend
start /B cmd /c "set PORT=%FRONTEND_PORT% && npm run dev"
cd ..

echo.
echo ✅ Services Started!
echo.
echo 📡 Backend:  http://localhost:%BACKEND_PORT%
echo 🌐 Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo To stop services, run: stop-dev.bat
echo.
pause
