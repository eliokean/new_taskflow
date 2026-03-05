FROM php:8.3-apache

# Dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libpng-dev unzip git \
    && docker-php-ext-install pgsql pdo_pgsql zip gd exif pcntl bcmath \
    && a2enmod rewrite

# Composer avec mémoire max
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_MEMORY_LIMIT=-1

WORKDIR /var/www/html

# Cache Docker : composer d'abord
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader \
    --ignore-platform-reqs

# Copie reste
COPY . .
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080
CMD ["apache2-foreground"]
