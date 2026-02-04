@echo off
REM ========================================
REM Amzify Seller Panel - Quick Start Script
REM ========================================

echo.
echo ====================================================
echo  Amzify Seller Panel - Quick Start
echo ====================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js v18+ from https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version

REM Navigate to project directory
cd /d "%~dp0amzify-seller-panel"

if not exist package.json (
    echo ERROR: package.json not found!
    echo Make sure you run this script from the project root.
    pause
    exit /b 1
)

echo.
echo ✓ Found package.json

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo.
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    
    call npm install --legacy-peer-deps
    
    if %errorlevel% neq 0 (
        echo.
        echo WARNING: npm install encountered some warnings/errors
        echo Attempting to continue...
    )
)

echo.
echo ✓ Dependencies ready

REM Check if .env.local exists
if not exist .env.local (
    echo.
    echo WARNING: .env.local not found
    echo Creating .env.local with default values...
    echo.
    
    (
        echo VITE_API_BASE_URL=http://localhost:5000/api
        echo VITE_POSTHOG_KEY=phc_demo_token
        echo VITE_POSTHOG_HOST=https://us.posthog.com
        echo VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ) > .env.local
    
    echo ✓ Created .env.local
    echo   Edit .env.local to add your actual API keys
)

echo.
echo ====================================================
echo  Starting Seller Panel Dev Server
echo ====================================================
echo.
echo Development server will be available at:
echo   http://localhost:3000
echo.
echo Demo Credentials:
echo   Email: seller@amzify.com
echo   Password: seller123
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start development server
    pause
    exit /b 1
)

pause
