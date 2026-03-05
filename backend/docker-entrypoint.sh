#!/bin/bash
set -e

cd /var/www/html

echo "==> Creating .env from environment variables..."
cat > .env << EOF
APP_NAME=${APP_NAME:-TaskFlow}
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

LOG_CHANNEL=${LOG_CHANNEL:-stderr}
LOG_LEVEL=${LOG_LEVEL:-debug}

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_SSLMODE=${DB_SSLMODE:-require}

SESSION_DRIVER=${SESSION_DRIVER:-database}
CACHE_STORE=${CACHE_STORE:-database}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}
EOF

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
    exit(1);
}
"

echo "==> Caching..."
php artisan config:cache 2>&1 || echo "CONFIG CACHE FAILED"
php artisan route:cache 2>&1 || echo "ROUTE CACHE FAILED"
php artisan view:cache 2>&1 || echo "VIEW CACHE FAILED"

echo "==> Migrations..."
php artisan migrate --force 2>&1 || echo "MIGRATION FAILED"

echo "==> Starting Apache..."
exec apache2-foreground