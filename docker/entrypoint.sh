#!/bin/sh

set -e  # Exit on any error

echo "Starting entrypoint script..."

# Wait for database
echo "Waiting for database connection..."
while ! nc -z db 3306; do 
    echo "Database not ready, waiting..."
    sleep 2
done
echo "Database connection established!"

# Install composer dependencies if vendor doesn't exist
if [ ! -d "/var/www/html/vendor" ]; then
    echo "Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Setup .env if it doesn't exist
if [ ! -f "/var/www/html/.env" ]; then
    echo "Creating .env file..."
    cp /var/www/html/.env.example /var/www/html/.env
    php artisan key:generate
fi

if [ ! -f "/var/www/html/.initialized" ]; then
    echo "First run detected, running setup..."

    echo "Migrating Laravel default tables..."
    php artisan migrate --force

    echo "Installing Laravel Passport..."
    php artisan passport:install --force

    echo "Inserting custom sql tables..."
    mysql -u"$db_username" -p"$db_password" -h db "$db_name" < /usr/local/bin/docker/mysql/init.sql

    echo "Creating .initialized file..."

    touch /var/www/html/.initialized
    
    echo "Setup completed"
else
    echo "Already initialized, skipping setup"
fi

echo "Starting PHP-FPM..."
exec php-fpm