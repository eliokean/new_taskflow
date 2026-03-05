FROM php:8.3-apache

# Dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libpng-dev unzip git \
    && docker-php-ext-install pgsql pdo_pgsql zip gd exif pcntl bcmath \
    && a2enmod rewrite

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_MEMORY_LIMIT=-1

WORKDIR /var/www/html/public
COPY composer.json composer.lock ../
RUN cd .. && composer install --no-dev --no-scripts --no-interaction --optimize-autoloader --ignore-platform-reqs

# Copie code + permissions
COPY . ../
RUN chown -R www-data:www-data ../ \
    && chmod -R 775 ../storage ../bootstrap/cache

# Apache → public/ par défaut
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

EXPOSE 8080
CMD ["apache2-foreground"]
