#!/bin/bash

# Code Quality Check Script
# Run this before committing to ensure code quality

set -e

echo "🔍 Running Code Quality Checks..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
BACKEND_FAILED=0
FRONTEND_FAILED=0

# Backend checks
echo "📦 Backend (Laravel/PHP)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend

echo "  → Running PHPStan..."
if composer phpstan --quiet; then
    echo -e "  ${GREEN}✓${NC} PHPStan passed"
else
    echo -e "  ${RED}✗${NC} PHPStan failed"
    BACKEND_FAILED=1
fi

echo "  → Checking PHP code formatting..."
if composer format-check --quiet; then
    echo -e "  ${GREEN}✓${NC} Formatting check passed"
else
    echo -e "  ${YELLOW}⚠${NC} Formatting issues found (run: composer format)"
    BACKEND_FAILED=1
fi

cd ..

echo ""

# Frontend checks
echo "⚛️  Frontend (React/TypeScript)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend

echo "  → Running TypeScript type check..."
if npm run type-check --silent; then
    echo -e "  ${GREEN}✓${NC} Type check passed"
else
    echo -e "  ${RED}✗${NC} Type check failed"
    FRONTEND_FAILED=1
fi

echo "  → Running ESLint..."
if npm run lint --silent; then
    echo -e "  ${GREEN}✓${NC} ESLint passed"
else
    echo -e "  ${YELLOW}⚠${NC} ESLint issues found (run: npm run lint:fix)"
    FRONTEND_FAILED=1
fi

echo "  → Checking code formatting..."
if npm run format:check --silent; then
    echo -e "  ${GREEN}✓${NC} Formatting check passed"
else
    echo -e "  ${YELLOW}⚠${NC} Formatting issues found (run: npm run format)"
    FRONTEND_FAILED=1
fi

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Summary
if [ $BACKEND_FAILED -eq 0 ] && [ $FRONTEND_FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Ready to commit.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues before committing.${NC}"
    echo ""
    echo "Quick fixes:"
    if [ $BACKEND_FAILED -eq 1 ]; then
        echo "  Backend:  cd backend && composer lint:fix"
    fi
    if [ $FRONTEND_FAILED -eq 1 ]; then
        echo "  Frontend: cd frontend && npm run fix"
    fi
    exit 1
fi
