#!/bin/bash

# MedCentric AI - Post-Deployment Verification Script
# Usage: ./verify-deployment.sh https://your-app.vercel.app

set -e

PROD_URL=$1

if [ -z "$PROD_URL" ]; then
  echo "❌ Error: Production URL required"
  echo "Usage: ./verify-deployment.sh https://your-app.vercel.app"
  exit 1
fi

echo "🚀 MedCentric AI - Post-Deployment Verification"
echo "================================================"
echo "Production URL: $PROD_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test HTTP status
test_route() {
  local route=$1
  local expected=$2
  local name=$3
  
  echo -n "Testing $name ($route)... "
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$route" || echo "000")
  
  if [ "$status" = "$expected" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC} (Expected HTTP $expected, got $status)"
    ((FAILED++))
  fi
}

# Function to test API endpoint
test_api() {
  local endpoint=$1
  local method=$2
  local data=$3
  local name=$4
  
  echo -n "Testing $name... "
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$PROD_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" || echo "000")
    
    status=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$endpoint" || echo "000")
  fi
  
  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
    ((PASSED++))
    return 0
  elif [ "$status" = "401" ]; then
    echo -e "${YELLOW}⚠️  AUTH REQUIRED${NC} (HTTP 401 - Expected for protected routes)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $status)"
    ((FAILED++))
    return 1
  fi
}

echo "📋 Phase 1: Core Routes Verification"
echo "-------------------------------------"
test_route "/" "200" "Homepage"
test_route "/login" "200" "Login Page"
test_route "/register" "200" "Register Page"
test_route "/dashboard" "200" "Dashboard (may redirect)"
echo ""

echo "🔐 Phase 2: Authentication Endpoints"
echo "-------------------------------------"
test_api "/api/auth" "GET" "" "Auth API Health"
echo ""

echo "🧠 Phase 3: AI Analysis Endpoints"
echo "-------------------------------------"
test_api "/api/quick_check" "POST" '{"hospital_id":"TEST","beds_total":100,"beds_free":50}' "QuickCheck API (Protected)"
test_api "/api/agentic_analysis" "POST" '{"hospital_id":"TEST","beds_total":100,"beds_free":50}' "Agentic Analysis API (Protected)"
test_api "/api/snapshot" "POST" '{"hospital_id":"TEST","beds_total":100,"beds_free":50}' "Snapshot API (Protected)"
echo ""

echo "📊 Phase 4: Data Endpoints"
echo "-------------------------------------"
test_api "/api/historical-trends?hospital_id=MED-CENTRAL-001" "GET" "" "Historical Trends API (Protected)"
test_api "/api/multi-hospital-comparison" "GET" "" "Multi-Hospital Comparison (Protected)"
echo ""

echo "================================================"
echo "📈 Verification Summary"
echo "================================================"
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical routes are accessible!${NC}"
  echo ""
  echo "🎯 Next Steps:"
  echo "1. Test user registration in browser: $PROD_URL/register"
  echo "2. Test login flow: $PROD_URL/login"
  echo "3. Test AI analysis on dashboard: $PROD_URL/dashboard"
  echo "4. Check browser console for errors (F12)"
  echo "5. Run Lighthouse audit for performance"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please check:${NC}"
  echo "1. Environment variables in Vercel dashboard"
  echo "2. Build logs for errors"
  echo "3. Function logs for runtime errors"
  exit 1
fi