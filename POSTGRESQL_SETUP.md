# 🐘 PostgreSQL Setup Guide for AWS Barangay Management System

## 🎯 Quick Setup Checklist

- [ ] Install PostgreSQL Server
- [ ] Install PHP PostgreSQL Extensions  
- [ ] Create Database and User
- [ ] Configure Environment Variables
- [ ] Test Connection
- [ ] Run Migrations
- [ ] Seed Database

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Install PostgreSQL Server**

**Windows:**
```powershell
# Option A: Download installer
# Visit: https://www.postgresql.org/download/windows/

# Option B: Using Chocolatey
choco install postgresql

# Option C: Using Docker
docker run --name barangay-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=barangay_management \
  -p 5432:5432 -d postgres:15
```

**Verify Installation:**
```powershell
psql --version
# Should output: psql (PostgreSQL) 15.x
```

### **Step 2: Install PHP Extensions**

**Check Current Extensions:**
```powershell
php -m | findstr pgsql
```

**If missing, enable in php.ini:**
```ini
extension=pdo_pgsql
extension=pgsql
```

### **Step 3: Create Database and User**

Run the setup script:
```powershell
# Connect to PostgreSQL
psql -U postgres

# Or run the setup script
psql -U postgres -f database/setup/postgres_setup.sql
```

### **Step 4: Configure Environment**

1. Copy the environment template:
```powershell
cp .env.postgres.example .env
```

2. Update your `.env` file with your credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=barangay_management
DB_USERNAME=barangay_user
DB_PASSWORD=your_secure_password
```

### **Step 5: Test Connection**

```powershell
php database/setup/test_connection.php
```

Expected output: ✅ Connection test successful

### **Step 6: Run Migrations**

```powershell
# Install dependencies (if not done)
composer install

# Generate application key
php artisan key:generate

# Run our relationship consistency migrations
php artisan migrate

# Verify migrations
php artisan migrate:status
```

### **Step 7: Seed Database (Optional)**

```powershell
# Run all seeders
php artisan db:seed

# Or run specific seeders
php artisan db:seed --class=RelationshipTestSeeder
```

### **Step 8: Validate Setup**

```powershell
# Test relationship integrity
php artisan barangay:validate-relationships

# Start development server
php artisan serve
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: PHP Extensions Not Found**
```
Error: could not find driver
```

**Solution:**
1. Check `php --ini` for configuration file location
2. Edit `php.ini` and uncomment:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   ```
3. Restart web server

### **Issue 2: Connection Refused**
```
Connection refused (SQLSTATE[08006])
```

**Solution:**
1. Verify PostgreSQL is running:
   ```powershell
   # Windows
   net start postgresql-x64-15
   
   # Or check services
   services.msc
   ```
2. Check port availability:
   ```powershell
   netstat -an | findstr :5432
   ```

### **Issue 3: Authentication Failed**
```
FATAL: password authentication failed
```

**Solution:**
1. Verify credentials in `.env`
2. Reset password:
   ```sql
   ALTER USER barangay_user PASSWORD 'new_password';
   ```

### **Issue 4: Database Does Not Exist**
```
FATAL: database "barangay_management" does not exist
```

**Solution:**
```sql
CREATE DATABASE barangay_management;
GRANT ALL PRIVILEGES ON DATABASE barangay_management TO barangay_user;
```

### **Issue 5: UUID Extension Missing**
```
ERROR: function uuid_generate_v4() does not exist
```

**Solution:**
```sql
\c barangay_management;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🔧 **Advanced Configuration**

### **Performance Tuning (postgresql.conf)**
```ini
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connection settings
max_connections = 100
listen_addresses = '*'

# Logging
log_statement = 'all'
log_duration = on
```

### **AWS RDS Configuration**
```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_SSLMODE=require
DB_USERNAME=your_rds_username
DB_PASSWORD=your_rds_password
```

### **Connection Pooling (Optional)**
```env
DB_PERSISTENT=true
DB_TIMEOUT=30
```

---

## 📊 **Verification Commands**

```powershell
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Check migration status
php artisan migrate:status

# Validate relationships
php artisan barangay:validate-relationships

# Test with sample data
php artisan db:seed --class=RelationshipTestSeeder
```

---

## 🎉 **Success Indicators**

When setup is complete, you should see:

1. ✅ Connection test passes
2. ✅ All migrations run successfully
3. ✅ UUID extension enabled
4. ✅ Relationship validation passes
5. ✅ Application starts without errors

---

## 📞 **Need Help?**

If you encounter issues:

1. Run the connection test: `php database/setup/test_connection.php`
2. Check Laravel logs: `storage/logs/laravel.log`
3. Verify PostgreSQL logs
4. Review environment configuration

The relationship consistency implementation is ready to work with PostgreSQL once the connection is established!
