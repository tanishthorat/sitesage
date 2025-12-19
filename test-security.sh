#!/bin/bash

# BFF Security Verification Script
# This script tests the security implementation

echo "🔐 SiteSage BFF Security Test Suite"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Direct Backend Access (Should Fail)
echo "Test 1: Direct Backend Access (Should Fail)"
echo "-------------------------------------------"
echo "Attempting to call backend directly without API key..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}')

if [ "$RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Backend correctly rejected request (403 Forbidden)"
else
  echo -e "${RED}✗ FAILED${NC} - Expected 403, got $RESPONSE"
fi
echo ""

# Test 2: Backend Health Check (Should Work)
echo "Test 2: Backend Health Check (Should Work)"
echo "-------------------------------------------"
echo "Checking if backend is accessible for health endpoint..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Health endpoint accessible (200 OK)"
else
  echo -e "${RED}✗ FAILED${NC} - Expected 200, got $RESPONSE"
fi
echo ""

# Test 3: Frontend Proxy Endpoint (Should Work if Next.js is running)
echo "Test 3: Frontend Proxy Endpoint"
echo "--------------------------------"
echo "Attempting to call through Next.js proxy..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/proxy/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' 2>/dev/null)

if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Proxy successfully forwarded request ($RESPONSE)"
elif [ "$RESPONSE" = "000" ]; then
  echo -e "${YELLOW}⚠ SKIPPED${NC} - Next.js not running or not reachable"
else
  echo -e "${RED}✗ FAILED${NC} - Expected 200/201, got $RESPONSE"
fi
echo ""

# Test 4: Check Environment Variables
echo "Test 4: Environment Variable Configuration"
echo "------------------------------------------"

# Check backend .env
if [ -f "./backend/.env" ]; then
  if grep -q "INTERNAL_API_KEY=" "./backend/.env"; then
    echo -e "${GREEN}✓ PASSED${NC} - backend/.env contains INTERNAL_API_KEY"
  else
    echo -e "${RED}✗ FAILED${NC} - backend/.env missing INTERNAL_API_KEY"
  fi
else
  echo -e "${YELLOW}⚠ WARNING${NC} - backend/.env not found (create from .env.example)"
fi

# Check frontend .env.local
if [ -f "./frontend/.env.local" ]; then
  if grep -q "INTERNAL_API_KEY=" "./frontend/.env.local"; then
    echo -e "${GREEN}✓ PASSED${NC} - frontend/.env.local contains INTERNAL_API_KEY"
  else
    echo -e "${RED}✗ FAILED${NC} - frontend/.env.local missing INTERNAL_API_KEY"
  fi
else
  echo -e "${YELLOW}⚠ WARNING${NC} - frontend/.env.local not found (create from .env.example)"
fi
echo ""

# Test 5: Check Required Files
echo "Test 5: Required Files Existence"
echo "---------------------------------"

FILES=(
  "backend/app/security.py"
  "frontend/src/app/api/proxy/[...path]/route.ts"
  "SECURITY_SETUP.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
  fi
done
echo ""

# Summary
echo "=================================="
echo "Test Suite Complete"
echo "=================================="
echo ""
echo "Next Steps:"
echo "1. Ensure both backend and frontend are running (docker-compose up)"
echo "2. Generate secure API key: openssl rand -hex 32"
echo "3. Set INTERNAL_API_KEY in both backend/.env and frontend/.env.local"
echo "4. Review SECURITY_SETUP.md for detailed instructions"
echo ""
