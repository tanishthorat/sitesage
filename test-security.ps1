# BFF Security Verification Script (PowerShell)
# This script tests the security implementation on Windows

Write-Host "🔐 SiteSage BFF Security Test Suite" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Direct Backend Access (Should Fail)
Write-Host "Test 1: Direct Backend Access (Should Fail)" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
Write-Host "Attempting to call backend directly without API key..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/analyze" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"url": "https://example.com"}' `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 403) {
        Write-Host "✓ PASSED - Backend correctly rejected request (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED - Expected 403, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 403) {
        Write-Host "✓ PASSED - Backend correctly rejected request (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED - Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Backend Health Check (Should Work)
Write-Host "Test 2: Backend Health Check (Should Work)" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
Write-Host "Checking if backend is accessible for health endpoint..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ PASSED - Health endpoint accessible (200 OK)" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED - Expected 200, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAILED - Cannot reach backend: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Frontend Proxy Endpoint (Should Work if Next.js is running)
Write-Host "Test 3: Frontend Proxy Endpoint" -ForegroundColor Yellow
Write-Host "--------------------------------"
Write-Host "Attempting to call through Next.js proxy..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/proxy/api/v1/analyze" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"url": "https://example.com"}' `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -in @(200, 201)) {
        Write-Host "✓ PASSED - Proxy successfully forwarded request ($($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED - Expected 200/201, got $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Message -like "*Unable to connect*") {
        Write-Host "⚠ SKIPPED - Next.js not running or not reachable" -ForegroundColor Yellow
    } else {
        Write-Host "✗ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Check Environment Variables
Write-Host "Test 4: Environment Variable Configuration" -ForegroundColor Yellow
Write-Host "------------------------------------------"

# Check backend .env
if (Test-Path ".\backend\.env") {
    $backendEnv = Get-Content ".\backend\.env" -Raw
    if ($backendEnv -match "INTERNAL_API_KEY=") {
        Write-Host "✓ PASSED - backend\.env contains INTERNAL_API_KEY" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED - backend\.env missing INTERNAL_API_KEY" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ WARNING - backend\.env not found (create from .env.example)" -ForegroundColor Yellow
}

# Check frontend .env.local
if (Test-Path ".\frontend\.env.local") {
    $frontendEnv = Get-Content ".\frontend\.env.local" -Raw
    if ($frontendEnv -match "INTERNAL_API_KEY=") {
        Write-Host "✓ PASSED - frontend\.env.local contains INTERNAL_API_KEY" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED - frontend\.env.local missing INTERNAL_API_KEY" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ WARNING - frontend\.env.local not found (create from .env.example)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Check Required Files
Write-Host "Test 5: Required Files Existence" -ForegroundColor Yellow
Write-Host "---------------------------------"

$files = @(
    "backend\app\security.py",
    "frontend\src\app\api\proxy\[...path]\route.ts",
    "SECURITY_SETUP.md",
    "IMPLEMENTATION_SUMMARY.md",
    "test-security.sh",
    "test-security.ps1"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file (MISSING)" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure both backend and frontend are running (docker-compose up)"
Write-Host "2. Generate secure API key: openssl rand -hex 32"
Write-Host "   (Or use: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })))"
Write-Host "3. Set INTERNAL_API_KEY in both backend\.env and frontend\.env.local"
Write-Host "4. Review SECURITY_SETUP.md for detailed instructions"
Write-Host ""
