# AWS Barangay Management System - Setup Guide

## Introduction

This comprehensive setup guide will help you install, configure, and deploy the AWS Barangay Management System. This is a full-stack application designed for Philippine local government services, featuring a Laravel 12 backend API and a React + TypeScript frontend.

### System Architecture
- **Backend**: Laravel 12 API with PostgreSQL database
- **Frontend**: React + TypeScript + Vite with TailwindCSS
- **Database**: PostgreSQL via Supabase (remote database with 1+ second latency)
- **Domain**: Philippine barangay (village) management services

## Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **PHP**: Version 8.2 or higher
- **Composer**: Latest version for PHP dependency management
- **Git**: For version control
- **PostgreSQL client**: For local database operations (optional)

```bash
sudo apt-get update
sudo apt-get install -y nodejs npm php php-cli composer git postgresql-client
```

### Required Accounts
- **Supabase Account**: For PostgreSQL database hosting
- **GitHub Account**: For repository access (if applicable)

### System Requirements
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: At least 2GB free space
- **Internet**: Stable connection for remote database access

## Installing Dependencies

### 1. Clone the Repository
```bash
git clone https://github.com/Bigpond25/AWS_Barangay-Management-System
cd AWS_Barangay-Management-System
```

### 2. Backend Dependencies (Laravel)
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

For development environment:
```bash
composer install
```

### 3. Frontend Dependencies (React)
```bash
cd ../frontend
npm install
```

Or using pnpm (if preferred):
```bash
pnpm install
```

## Environment Configuration

### 1. Backend Environment Setup

Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

Generate Laravel application key:
```bash
php artisan key:generate
```

### 2. Frontend Environment Setup

Copy the example environment file:
```bash
cd ../frontend
cp .env.example .env
```

## Setting Up the Database (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `barangay-management` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location (Singapore recommended for Philippines)
6. Click "Create new project"

### 2. Get Database Connection Details

Once your project is created:

1. Go to **Settings** → **Database**
2. Find the "Connection info" section
3. Note down:
   - **Host**: `db.xxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: The password you set during project creation

### 3. Get Supabase API Details

1. Go to **Settings** → **API**
2. Note down:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Connecting the Application to the Database

### 1. Configure Backend Database Connection

Edit `backend/.env` file:

```env
# Basic Laravel Configuration
APP_NAME="Barangay Management System"
APP_ENV=local
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

# Database Configuration (Supabase)
DB_CONNECTION=pgsql
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_supabase_password
DB_SSLMODE=require

# Optional PostgreSQL optimizations for remote database
DB_DISABLE_PREPARES=false
DB_TIMEOUT=60
DB_PERSISTENT=false

# Cache Configuration
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Mail Configuration
MAIL_MAILER=log
```

### 2. Configure Frontend API Connection

Edit `frontend/.env` file:

```env
# API Configuration
VITE_API_URL=http://127.0.0.1:8000

# Storage Configuration
VITE_STORAGE_PROVIDER=supabase

# Supabase Configuration
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Test Database Connection

```bash
cd backend
php artisan tinker
```

In tinker, test the connection:
```php
DB::connection()->getPdo();
// Should return PDO object if connection is successful
exit
```

## Running the Application

### 1. Run Database Migrations

Create all required tables:
```bash
cd backend
php artisan migrate
```

Seed the database with initial data:
```bash
php artisan db:seed
```

Or run both in one command:
```bash
php artisan migrate --seed
```

### 2. Start Backend Development Server

**Option A: Simple server only**
```bash
php artisan serve
```
This runs the API server on `http://localhost:8000`

**Option B: Full development environment (Recommended)**
```bash
composer run dev
```
This starts:
- Laravel server (`http://localhost:8000`)
- Queue worker for background jobs
- Laravel Pail for real-time logging
- Vite dev server for asset building

### 3. Start Frontend Development Server

In a new terminal:
```bash
cd frontend
npm run dev
```
This runs the React app on `http://localhost:5173`

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Laravel Backend**: http://localhost:8000


















## Verifying the Setup

### 1. Backend Health Check

Visit these URLs to verify backend is working:

- **API Status**: `http://localhost:8000/api/health` (if implemented)
- **Laravel Welcome**: `http://localhost:8000`

### 2. Database Verification

Check if tables are created:
```bash
cd backend
php artisan tinker
```

```php
// Check if tables exist
Schema::hasTable('users'); // Should return true
Schema::hasTable('residents'); // Should return true
Schema::hasTable('documents'); // Should return true
exit
```

### 3. Frontend Verification

1. Open `http://localhost:5173`
2. Check browser console for any errors
3. Verify API calls are reaching the backend
4. Test basic navigation and functionality

### 4. API Connectivity Test

Test API connection from frontend:
```bash
# In a new terminal
curl http://localhost:8000/api/users
```

Should return JSON response (might be empty if no users exist).

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Problem**: "SQLSTATE[08006] [7] could not connect to server"

**Solutions**:
- Verify Supabase project is active and not paused
- Check database credentials in `.env`
- Ensure SSL mode is set to `require`
- Verify network connectivity to Supabase

**Test connection**:
```bash
php artisan tinker
DB::connection()->getPdo();
```

#### 2. Migration Failures

**Problem**: "SQLSTATE[42P01]: Undefined table"

**Solutions**:
```bash
# Reset and re-run migrations
php artisan migrate:fresh --seed

# If foreign key constraints cause issues
php artisan migrate:fresh --seed --force
```

#### 3. Frontend API Connection Issues

**Problem**: Network errors or CORS issues

**Solutions**:
- Verify `VITE_API_URL` in `frontend/.env`
- Check if backend server is running
- Ensure Laravel API routes are properly configured
- Check browser network tab for specific error codes

#### 4. Composer/NPM Installation Issues

**Problem**: Dependency installation failures

**Solutions**:
```bash
# Clear composer cache
composer clear-cache
composer install --no-cache

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 5. Performance Issues

**Problem**: Slow database queries due to remote Supabase

**Solutions**:
- Optimize queries using `select()` to limit columns
- Use eager loading with `with()` for relationships
- Add database indexes for frequently queried columns
- Monitor query performance with Laravel Debugbar

#### 6. Authentication Issues

**Problem**: Token-related authentication errors

**Solutions**:
- Clear browser localStorage/sessionStorage
- Regenerate Laravel application key: `php artisan key:generate`
- Check Sanctum configuration in `config/sanctum.php`

### Debug Commands

```bash
# Backend debugging
php artisan route:list              # List all routes
php artisan config:clear            # Clear config cache
php artisan cache:clear             # Clear application cache
php artisan queue:work              # Process queue jobs manually

# Frontend debugging
npm run build                       # Test production build
npm run lint                        # Check for linting errors
npm run compile                     # Test TypeScript compilation
```

### Log Files

Monitor these log files for debugging:

- **Laravel Logs**: `backend/storage/logs/laravel.log`
- **Browser Console**: Press F12 → Console tab
- **Network Tab**: Press F12 → Network tab for API calls

## Additional Notes

### Production Deployment Considerations

1. **Environment Configuration**:
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Use strong, unique `APP_KEY`

2. **Database Optimization**:
   - Enable connection pooling in Supabase
   - Add appropriate database indexes
   - Configure proper backup schedules

3. **Caching**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

4. **Frontend Build**:
   ```bash
   npm run build
   ```

### Security Best Practices

1. **Environment Files**:
   - Never commit `.env` files to version control
   - Use different credentials for production
   - Regularly rotate database passwords

2. **Database Security**:
   - Enable Row Level Security (RLS) in Supabase
   - Use least-privilege database users
   - Monitor database access logs

3. **Application Security**:
   - Keep dependencies updated
   - Use HTTPS in production
   - Implement proper CORS configuration

### Development Workflow

1. **Database Changes**:
   ```bash
   php artisan make:migration create_new_table
   php artisan migrate
   ```

2. **Code Style**:
   ```bash
   # Backend
   ./vendor/bin/pint              # PHP code formatting

   # Frontend
   npm run lint                   # ESLint
   npm run fix                    # Auto-fix linting issues
   ```

3. **Testing**:
   ```bash
   # Backend
   php artisan test

   # Frontend
   npm run test                   # If tests are configured
   ```

### Performance Monitoring

Due to the remote Supabase database, monitor:
- Query execution times
- Network latency
- Database connection pool usage
- Application response times

Use Laravel's built-in profiling tools and browser developer tools for performance analysis.

### Support and Resources

- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://react.dev
- **Supabase Documentation**: https://supabase.com/docs
- **Vite Documentation**: https://vitejs.dev
- **TailwindCSS Documentation**: https://tailwindcss.com/docs

For project-specific issues, refer to the `CLAUDE.md` file for detailed architecture and coding patterns.