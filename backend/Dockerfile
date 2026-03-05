FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev unzip libpng-dev \
    && docker-php-ext-install pgsql pdo_pgsql zip gd exif pcntl bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN a2enmod rewrite \
    && sed -i 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-scripts \
    && php artisan config:cache \
    && php artisan route:cache \
    && chown -R www-data:www-data /var/www/html

EXPOSE 8080
CMD ["apache2-foreground"]
