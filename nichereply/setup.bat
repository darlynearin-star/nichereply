@echo off
echo ============================================
echo  NicheReply - Quick Setup
echo ============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERR] Node.js is not installed. Download from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed

:: Check .env.local
if not exist ".env.local" (
    echo.
    echo [WARN] .env.local not found. Copy from .env.example:
    echo   copy .env.example .env.local
    echo   Then edit .env.local with your credentials.
) else (
    echo [OK] .env.local found
)

:: Run database schema prompt
echo.
echo ============================================
echo  NEXT STEPS:
echo ============================================
echo.
echo  1. Create a Supabase project at:
echo     https://supabase.com
echo.
echo  2. Copy your project URL and keys into .env.local
echo.
echo  3. Run the database schema:
echo     - Open Supabase SQL Editor
echo     - Paste contents of supabase\schema.sql
echo     - Click "Run"
echo.
echo  4. (Optional) Set up WhatsApp Cloud API:
echo     - Go to https://developers.facebook.com
echo     - Create a WhatsApp Business App
echo     - Get Phone Number ID and Access Token
echo.
echo  5. Start the app:
echo     npm run dev
echo.
echo ============================================
pause
