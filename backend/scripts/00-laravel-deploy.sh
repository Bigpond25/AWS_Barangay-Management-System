#!/usr/bin/env bash
set -e

echo "🚀 Starting Laravel deployment..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
php /var/www/html/artisan tinker --execute="DB::connection()->getPdo();" || sleep 5

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generating APP_KEY..."
    php /var/www/html/artisan key:generate --force
fi

# Clear and cache configuration
echo "🧹 Clearing caches..."
php /var/www/html/artisan config:clear
php /var/www/html/artisan cache:clear
php /var/www/html/artisan view:clear
php /var/www/html/artisan route:clear

echo "📦 Caching configuration..."
php /var/www/html/artisan config:cache
php /var/www/html/artisan route:cache
php /var/www/html/artisan view:cache

# Run migrations
echo "🗄️  Running database migrations..."
php /var/www/html/artisan migrate --force --no-interaction

# Create storage link
echo "🔗 Creating storage link..."
php /var/www/html/artisan storage:link || true

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 755 /var/www/html/storage
chmod -R 755 /var/www/html/bootstrap/cache

echo "✅ Deployment completed successfully!"