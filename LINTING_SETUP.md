# Code Quality & Formatting Setup

This document describes the code quality tools and formatting setup for both backend (Laravel) and frontend (React/TypeScript).

## Backend (Laravel/PHP)

### Tools Installed

1. **PHPStan** - Static analysis tool for PHP
2. **Larastan** - Laravel-specific PHPStan extension
3. **PHP CS Fixer** - PHP code formatter
4. **PHP Insights** - Code quality analysis tool
5. **Laravel Pint** - Laravel's opinionated PHP code style fixer

### Configuration Files

- `phpstan.neon` - PHPStan configuration (Level 5)
- `.php-cs-fixer.php` - PHP CS Fixer rules
- `phpinsights.php` - PHP Insights configuration

### Available Commands

```bash
cd backend

# Run PHPStan analysis
composer phpstan

# Generate PHPStan baseline (ignore existing errors)
composer phpstan:baseline

# Format PHP code
composer format

# Check formatting without making changes
composer format-check

# Run all analysis tools
composer analyse

# Run linting (PHPStan + format check)
composer lint

# Fix linting issues
composer lint:fix

# Run PHP Insights
composer insights

# Run tests
composer test
```

### PHPStan Levels

The project is currently configured at **level 5**. You can gradually increase the level in `phpstan.neon`:

- Level 0: Basic checks
- Level 5: Good balance (current)
- Level 9: Strictest checks

### Auto-formatting in VS Code

PHP files will be automatically formatted on save if you have the recommended extensions installed.

## Frontend (React/TypeScript)

### Tools Configured

1. **ESLint** - JavaScript/TypeScript linter
2. **TypeScript** - Type checking
3. **Prettier** - Code formatter (via GTS)
4. **GTS** - Google TypeScript Style guide

### Configuration Files

- `eslint.config.js` - ESLint rules with TypeScript support
- `.prettierrc.json` - Prettier configuration
- `.prettierignore` - Files to exclude from Prettier
- `tsconfig.json` - TypeScript configuration

### Available Commands

```bash
cd frontend

# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without making changes
npm run format:check

# Run TypeScript type checking
npm run type-check

# Run all analysis tools (type-check + lint + format-check)
npm run analyse

# Fix all issues (lint + format)
npm run fix

# Development server
npm run dev

# Build for production
npm run build
```

### ESLint Rules

Key rules configured:

- **TypeScript**: Strict type checking with recommended rules
- **React Hooks**: Enforces hooks rules and dependencies
- **Code Quality**: Enforces best practices (no-console, prefer-const, etc.)
- **Import/Export**: Sorts imports alphabetically

### Auto-formatting in VS Code

TypeScript/JavaScript files will be automatically formatted on save and ESLint will auto-fix issues if you have the recommended extensions installed.

## VS Code Integration

### Recommended Extensions

The project includes extension recommendations in `.vscode/extensions.json`:

- **PHP**: Intelephense, PHP CS Fixer, PHPStan, Laravel Blade
- **JavaScript/TypeScript**: ESLint, Prettier
- **Git**: GitLens
- **Utilities**: EditorConfig, Path Intellisense

Install all recommended extensions with:
1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Extensions: Show Recommended Extensions"
4. Click "Install All Workspace Extension Recommendations"

### Settings

The `.vscode/settings.json` file configures:

- **Format on Save**: Enabled for all files
- **Auto-fix on Save**: ESLint will auto-fix issues
- **Default Formatters**: Prettier for TS/JS, PHP CS Fixer for PHP
- **PHPStan Integration**: Real-time error reporting
- **TypeScript**: Uses workspace TypeScript version

## EditorConfig

The `.editorconfig` file ensures consistent coding styles across different editors:

- **PHP**: 4 spaces indentation, 120 char line length
- **TypeScript/JavaScript**: 2 spaces indentation, 100 char line length
- **All files**: UTF-8, LF line endings, trim trailing whitespace

## Git Hooks (Optional)

Consider adding pre-commit hooks to run linting before commits:

```bash
# In package.json or composer.json
"husky": {
  "hooks": {
    "pre-commit": "npm run lint && composer lint"
  }
}
```

## CI/CD Integration

Add these commands to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Backend Lint
  run: cd backend && composer analyse

- name: Frontend Lint
  run: cd frontend && npm run analyse
```

## Ignoring Files

### Backend
PHP CS Fixer automatically excludes:
- `vendor/`
- `storage/`
- `bootstrap/cache/`

### Frontend
ESLint and Prettier ignore:
- `node_modules/`
- `dist/`
- `build/`
- `.vite/`
- `coverage/`

## Troubleshooting

### PHPStan Memory Issues

If PHPStan runs out of memory:

```bash
composer phpstan -- --memory-limit=4G
```

### ESLint Performance

If ESLint is slow, try:

```bash
# Clear ESLint cache
rm -rf node_modules/.cache

# Or disable type-aware linting for faster checks
# (not recommended for production)
```

### PHP CS Fixer Cache

If formatting behaves unexpectedly:

```bash
rm backend/.php-cs-fixer.cache
composer format
```

## Best Practices

1. **Run linters before committing**: Always run `composer lint` and `npm run lint` before pushing
2. **Fix issues incrementally**: Don't try to fix all issues at once
3. **Use baseline for PHPStan**: If you have many existing errors, generate a baseline
4. **Configure your IDE**: Install recommended extensions for the best experience
5. **Keep dependencies updated**: Regularly update linting tools
6. **Document exceptions**: If you need to disable a rule, document why

## Additional Resources

- [PHPStan Documentation](https://phpstan.org/)
- [Larastan Documentation](https://github.com/larastan/larastan)
- [PHP CS Fixer Documentation](https://github.com/FriendsOfPHP/PHP-CS-Fixer)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier Documentation](https://prettier.io/)
- [Laravel Pint Documentation](https://laravel.com/docs/pint)
