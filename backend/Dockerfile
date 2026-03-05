FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libpng-dev unzip git \
    && docker-php-ext-install pgsql pdo_pgsql zip gd exif pcntl bcmath \
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENV COMPOSER_MEMORY_LIMIT=-1
ENV COMPOSER_CACHE_DIR=/tmp/composer-cache

WORKDIR /var/www/html

COPY composer.json composer.lock ./

# ✅ Installation avec retry et sans cache pour économiser l'espace
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --optimize-autoloader \
    --ignore-platform-reqs \
    --no-cache \
    && rm -rf /tmp/composer-cache

COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf

RUN echo '<VirtualHost *:8080>\n\
    ServerName localhost\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options Indexes FollowSymLinks\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

EXPOSE 8080

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["docker-entrypoint.sh"]