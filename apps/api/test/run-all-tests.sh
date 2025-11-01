#!/bin/bash

# Tour Operator CRM - Complete Test Suite Runner
# This script runs all tests and generates coverage reports

set -e  # Exit on error

echo "========================================="
echo "🧪 Tour Operator CRM - Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if test database exists
echo -e "${BLUE}📋 Checking test database...${NC}"
if psql -U tourcrm -lqt | cut -d \| -f 1 | grep -qw tour_crm_test; then
    echo -e "${GREEN}✓ Test database exists${NC}"
else
    echo -e "${RED}✗ Test database does not exist${NC}"
    echo "Creating test database..."
    psql -U tourcrm -c "CREATE DATABASE tour_crm_test;" || {
        echo -e "${RED}Failed to create test database${NC}"
        echo "Please create manually: psql -U tourcrm -c \"CREATE DATABASE tour_crm_test;\""
        exit 1
    }
    echo -e "${GREEN}✓ Test database created${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Setting up test environment...${NC}"

# Load test environment
export $(cat .env.test | grep -v '^#' | xargs)

# Safety check
if [[ ! $DATABASE_URL =~ "_test" ]]; then
    echo -e "${RED}✗ SAFETY CHECK FAILED!${NC}"
    echo "DATABASE_URL must contain '_test' to prevent using production database"
    exit 1
fi

echo -e "${GREEN}✓ Test environment loaded${NC}"

echo ""
echo -e "${BLUE}🗄️  Preparing test database...${NC}"

# Reset and migrate test database
npx prisma migrate reset --force --skip-seed || {
    echo -e "${RED}Failed to reset database${NC}"
    exit 1
}

npx prisma migrate deploy || {
    echo -e "${RED}Failed to run migrations${NC}"
    exit 1
}

echo -e "${GREEN}✓ Test database ready${NC}"

echo ""
echo -e "${BLUE}🧪 Running E2E tests...${NC}"
echo ""

# Run tests with coverage
npm run test:e2e:cov

echo ""
if [ $? -eq 0 ]; then
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "📊 Coverage report: apps/api/coverage-e2e/lcov-report/index.html"
    echo ""
    exit 0
else
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}❌ Some tests failed${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    exit 1
fi
