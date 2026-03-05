#!/bin/bash
set -e

cd /var/www/html

echo "==> PHP version: $(php -v | head -1)"
echo "==> Testing DB connection..."
php -r "
try {
    \$pdo = new PDO(
        'pgsql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE};sslmode=require',
        '${DB_USERNAME}',
        '${DB_PASSWORD}'
    );
    echo 'DB: OK' . PHP_EOL;
} catch(Exception \$e) {
    echo 'DB ERROR: ' . \$e->getMessage() . PHP_EOL;
}
"

echo "==> Clearing cache..."
php artisan config:clear 2>&1
php artisan cache:clear 2>&1

echo "==> Generating key..."
php artisan key:generate --force 2>&1

echo "==> Caching..."
php artisan config:cache 2>&1 || echo "CONFIG CACHE FAILED"
php artisan route:cache 2>&1 || echo "ROUTE CACHE FAILED"  
php artisan view:cache 2>&1 || echo "VIEW CACHE FAILED"

echo "==> Migrations..."
php artisan migrate --force 2>&1 || echo "MIGRATION FAILED"

echo "==> Starting Apache..."
exec apache2-foreground
```



