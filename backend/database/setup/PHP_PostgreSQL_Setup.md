# PHP PostgreSQL Extension Setup Guide

## For Windows Development

### Option 1: Enable in php.ini (if already installed)
1. Locate your `php.ini` file:
   ```powershell
   php --ini
   ```

2. Open `php.ini` and uncomment these lines:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   ```

3. Restart your web server (Apache/Nginx) or PHP-FPM

### Option 2: Install via Package Manager
```powershell
# If using XAMPP, download PostgreSQL extensions
# Visit: https://www.apachefriends.org/download.html

# If using Laravel Herd or Valet
# Extensions are usually included
```

### Option 3: Manual Installation
1. Download PostgreSQL extensions for your PHP version
2. Copy `.dll` files to your PHP extensions directory
3. Update `php.ini` as shown above

## Verification
Run this command to verify installation:
```powershell
php -m | findstr pgsql
```

Expected output:
```
pdo_pgsql
pgsql
```
