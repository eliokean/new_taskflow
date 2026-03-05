FROM php:8.3-apache

# Dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libpng-dev unzip git \
    && docker-php-ext-install pgsql pdo_pgsql zip gd exif pcntl bcmath \
    && a2enmod rewrite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_MEMORY_LIMIT=-1

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader --ignore-platform-reqs

COPY . .

# ✅ Remplace le port 80 par 8080 dans ports.conf
RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf

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