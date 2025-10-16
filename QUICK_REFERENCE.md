# Quick Reference: Code Quality Commands

## Backend (Laravel/PHP)

### Analysis & Linting
```bash
cd backend

# Run all analysis tools
composer analyse

# Run PHPStan only
composer phpstan

# Generate PHPStan baseline (ignore existing errors)
composer phpstan:baseline

# Run PHP Insights
composer insights
```

### Formatting
```bash
cd backend

# Format all PHP files
composer format

# Check formatting without changes
composer format-check

# Use Laravel Pint (alternative)
./vendor/bin/pint
```

### Combined Commands
```bash
cd backend

# Lint (PHPStan + format check)
composer lint

# Lint and auto-fix
composer lint:fix
```

## Frontend (React/TypeScript)

### Analysis & Linting
```bash
cd frontend

# Run all checks
npm run analyse

# Type checking
npm run type-check

# ESLint
npm run lint

# ESLint auto-fix
npm run lint:fix
```

### Formatting
```bash
cd frontend

# Format all files
npm run format

# Check formatting
npm run format:check
```

### Combined Commands
```bash
cd frontend

# Fix everything
npm run fix
```

## Before Committing

Run these commands to ensure code quality:

```bash
# Backend
cd backend && composer lint

# Frontend
cd frontend && npm run analyse

# Or from root
cd backend && composer lint && cd ../frontend && npm run analyse
```

## VS Code Integration

### Format on Save
Already configured! Just save your file (`Cmd+S` / `Ctrl+S`).

### Manual Format
- Press `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (Mac)

### Show Problems Panel
- Press `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)

## Common Issues

### PHPStan: Class not found
```bash
cd backend && composer dump-autoload
```

### ESLint: Module not found
```bash
cd frontend && npm install
```

### Formatting conflicts
```bash
# Backend: Clear PHP CS Fixer cache
rm backend/.php-cs-fixer.cache

# Frontend: Clear ESLint cache
rm -rf frontend/node_modules/.cache
```

## Configuration Files

- Backend:
  - `phpstan.neon` - PHPStan config
  - `.php-cs-fixer.php` - PHP formatter config
  - `phpinsights.php` - Insights config

- Frontend:
  - `eslint.config.js` - ESLint config
  - `.prettierrc.json` - Prettier config
  - `tsconfig.json` - TypeScript config

- Global:
  - `.editorconfig` - Editor settings
  - `.vscode/settings.json` - VS Code settings
