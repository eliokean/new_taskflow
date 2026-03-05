FROM php:8.3-apache

# Dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libpng-dev unzip git \
    && docker-php-ext-install pgsql pdo_pgsql zip gd exif pcntl bcmath \
    && a2enmod rewrite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_MEMORY_LIMIT=-1

WORKDIR /var/www/html

# UNIQUEMENT composer (cache Docker)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader --ignore-platform-reqs

# Copie code SANS artisan commands
COPY . .

# ✅ VirtualHost → public/
RUN echo '<VirtualHost *:8080>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options Indexes FollowSymLinks\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

EXPOSE 8080
CMD ["apache2-foreground"]
