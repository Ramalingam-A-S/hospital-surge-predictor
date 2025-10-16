#!/bin/bash

# MedCentric AI - Pre-Deployment Verification Script
# Run this before deploying to catch issues early

set -e

echo "🔍 MedCentric AI - Pre-Deployment Check"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check file exists
check_file() {
  local file=$1
  local name=$2
  
  echo -n "Checking $name... "
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ Found${NC}"
    ((CHECKS_PASSED++))
    return 0
  else
    echo -e "${RED}❌ Missing${NC}"
    ((CHECKS_FAILED++))
    return 1
  fi
}

# Function to check env variable
check_env() {
  local var=$1
  local name=$2
  
  echo -n "Checking $name... "
  
  if grep -q "^$var=" .env 2>/dev/null; then
    value=$(grep "^$var=" .env | cut -d'=' -f2-)
    if [ -n "$value" ]; then
      echo -e "${GREEN}✅ Set${NC}"
      ((CHECKS_PASSED++))
      return 0
    fi
  fi
  
  echo -e "${YELLOW}⚠️  Not set (optional)${NC}"
  return 0
}

# Function to check required env variable
check_env_required() {
  local var=$1
  local name=$2
  
  echo -n "Checking $name (required)... "
  
  if grep -q "^$var=" .env 2>/dev/null; then
    value=$(grep "^$var=" .env | cut -d'=' -f2-)
    if [ -n "$value" ]; then
      echo -e "${GREEN}✅ Set${NC}"
      ((CHECKS_PASSED++))
      return 0
    fi
  fi
  
  echo -e "${RED}❌ Missing${NC}"
  ((CHECKS_FAILED++))
  return 1
}

echo "📁 Phase 1: Critical Files"
echo "-------------------------"
check_file "package.json" "package.json"
check_file "next.config.ts" "next.config.ts"
check_file ".env" ".env file"
check_file "tsconfig.json" "tsconfig.json"
check_file "src/app/page.tsx" "Homepage"
check_file "src/app/login/page.tsx" "Login page"
check_file "src/app/register/page.tsx" "Register page"
check_file "src/app/dashboard/page.tsx" "Dashboard page"
echo ""

echo "🔐 Phase 2: Environment Variables"
echo "--------------------------------"
check_env_required "TURSO_CONNECTION_URL" "Database URL"
check_env_required "TURSO_AUTH_TOKEN" "Database Auth Token"
check_env_required "BETTER_AUTH_SECRET" "Auth Secret"
check_env "BASE_URL" "Base URL"
check_env "USE_AGENTIC" "Agentic Mode"
check_env "OPENAI_API_KEY" "OpenAI API Key"
echo ""

echo "📦 Phase 3: Dependencies"
echo "-----------------------"
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅ Installed${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌ Missing - Run: npm install${NC}"
  ((CHECKS_FAILED++))
fi

echo -n "Checking package-lock.json... "
if [ -f "package-lock.json" ]; then
  echo -e "${GREEN}✅ Found${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${YELLOW}⚠️  Missing (will be generated)${NC}"
fi
echo ""

echo "🔨 Phase 4: Build Test"
echo "---------------------"
echo "Attempting production build..."
echo ""

if npm run build 2>&1 | tee build.log; then
  echo ""
  echo -e "${GREEN}✅ Build successful!${NC}"
  ((CHECKS_PASSED++))
  
  # Check build output
  if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Build output directory created${NC}"
    ((CHECKS_PASSED++))
    
    # Show build size
    if command -v du &> /dev/null; then
      size=$(du -sh .next 2>/dev/null | cut -f1)
      echo "📦 Build size: $size"
    fi
  fi
else
  echo ""
  echo -e "${RED}❌ Build failed!${NC}"
  echo "Check build.log for details"
  ((CHECKS_FAILED++))
fi
echo ""

echo "🧹 Phase 5: Code Quality"
echo "-----------------------"
echo -n "Checking for console.log statements... "
log_count=$(grep -r "console\.log" src/ 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
if [ "$log_count" -eq 0 ]; then
  echo -e "${GREEN}✅ None found${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${YELLOW}⚠️  Found $log_count (consider removing for production)${NC}"
fi

echo -n "Checking for TODO comments... "
todo_count=$(grep -r "TODO" src/ 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
if [ "$todo_count" -eq 0 ]; then
  echo -e "${GREEN}✅ None found${NC}"
else
  echo -e "${YELLOW}⚠️  Found $todo_count${NC}"
fi

echo -n "Checking for FIXME comments... "
fixme_count=$(grep -r "FIXME" src/ 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
if [ "$fixme_count" -eq 0 ]; then
  echo -e "${GREEN}✅ None found${NC}"
else
  echo -e "${YELLOW}⚠️  Found $fixme_count${NC}"
fi
echo ""

echo "========================================"
echo "📊 Pre-Deployment Summary"
echo "========================================"
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
  echo ""
  echo "🚀 Deploy using one of these methods:"
  echo ""
  echo "Option 1 - GitHub (Recommended):"
  echo "  git add ."
  echo "  git commit -m 'chore: deploy to production'"
  echo "  git push origin main"
  echo "  Then connect repo in Vercel dashboard"
  echo ""
  echo "Option 2 - Vercel CLI:"
  echo "  vercel --prod"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please fix issues before deploying.${NC}"
  echo ""
  echo "Common fixes:"
  echo "1. Missing .env file: Create .env with required variables"
  echo "2. Missing node_modules: Run 'npm install'"
  echo "3. Build errors: Check build.log for details"
  exit 1
fi