#!/usr/bin/env bash

echo "Running composer install..."
composer install --no-dev --optimize-autoloader --working-dir=/var/www/html

echo "Generating APP_KEY if not exists..."
php /var/www/html/artisan key:generate

echo "Clearing caches..."
php /var/www/html/artisan config:cache
php /var/www/html/artisan route:cache
php /var/www/html/artisan view:cache

echo "Migrating database..."
php /var/www/html/artisan migrate --force

echo "Linking storage..."
php /var/www/html/artisan storage:link

echo "Deployment script complete."
