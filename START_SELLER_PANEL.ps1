#!/usr/bin/env pwsh
# ========================================
# Amzify Seller Panel - Quick Start Script
# ========================================

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Amzify Seller Panel - Quick Start" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Please install Node.js v18+ from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Navigate to seller panel directory
$sellerPanelPath = Join-Path $PSScriptRoot "ecommerce-amzify-v1" "amzify-seller-panel"

if (-not (Test-Path $sellerPanelPath)) {
    Write-Host "✗ Seller panel directory not found: $sellerPanelPath" -ForegroundColor Red
    exit 1
}

Push-Location $sellerPanelPath

# Check for package.json
if (-not (Test-Path "package.json")) {
    Write-Host "✗ package.json not found!" -ForegroundColor Red
    Write-Host "  Make sure you run this script from the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found package.json" -ForegroundColor Green

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "⚠ npm install encountered some warnings/errors" -ForegroundColor Yellow
        Write-Host "Attempting to continue..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✓ Dependencies ready" -ForegroundColor Green

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "Creating .env.local with default values..." -ForegroundColor Yellow
    
    @"
VITE_API_BASE_URL=http://localhost:5000/api
VITE_POSTHOG_KEY=phc_demo_token
VITE_POSTHOG_HOST=https://us.posthog.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here
"@ | Set-Content ".env.local" -Encoding UTF8
    
    Write-Host "✓ Created .env.local" -ForegroundColor Green
    Write-Host "  Edit .env.local to add your actual API keys" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Starting Seller Panel Dev Server" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Development server will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Email: seller@amzify.com" -ForegroundColor Green
Write-Host "  Password: seller123" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Failed to start development server" -ForegroundColor Red
    exit 1
}

Pop-Location
