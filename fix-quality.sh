#!/bin/bash

# Auto-fix Code Quality Issues
# Run this to automatically fix formatting and linting issues

set -e

echo "🔧 Auto-fixing Code Quality Issues..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend
echo "📦 Backend (Laravel/PHP)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend

echo "  → Formatting PHP code..."
composer format
echo -e "  ${GREEN}✓${NC} PHP code formatted"

cd ..

echo ""

# Frontend
echo "⚛️  Frontend (React/TypeScript)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend

echo "  → Fixing ESLint issues..."
npm run lint:fix
echo -e "  ${GREEN}✓${NC} ESLint issues fixed"

echo "  → Formatting code with Prettier..."
npm run format
echo -e "  ${GREEN}✓${NC} Code formatted"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ All issues fixed! Run ./check-quality.sh to verify.${NC}"
