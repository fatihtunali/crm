@echo off
REM Tour Operator CRM - Stop Development Services (Windows)
REM Bu script tüm development servislerini durdurur

echo ========================================
echo 🛑 Stopping Tour Operator CRM Services
echo ========================================
echo.

SET BACKEND_PORT=5000
SET FRONTEND_PORT=5173

REM Backend'i durdur
echo 🔴 Stopping Backend (Port %BACKEND_PORT%)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%BACKEND_PORT%" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo   ✅ Backend stopped (PID: %%a)
)

REM Frontend'i durdur
echo 🔴 Stopping Frontend (Port %FRONTEND_PORT%)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%FRONTEND_PORT%" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo   ✅ Frontend stopped (PID: %%a)
)

echo.
echo ✅ All services stopped!
echo.
pause
