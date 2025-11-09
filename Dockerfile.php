FROM php:8.2-apache

# Install PDO MySQL + MySQLi
RUN docker-php-ext-install pdo pdo_mysql mysqli

COPY . /var/www/html/

# Hardcode Apache port 8080 for Railway
RUN sed -i "s/Listen 80/Listen 8080/g" /etc/apache2/ports.conf \
    && sed -i "s/<VirtualHost \*:80>/<VirtualHost *:8080>/g" /etc/apache2/sites-available/000-default.conf

EXPOSE 8080

CMD ["apache2-foreground"]
