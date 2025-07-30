# New
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    gnupg \
    netcat-traditional \
    default-mysql-client

# Clear apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user
RUN groupadd -g 1000 www
RUN useradd -u 1000 -ms /bin/bash -g www www

# Copy source code and give correct ownership
COPY --chown=www:www ./src /var/www/html

# Copy docker initialization items
COPY docker/ /usr/local/bin/docker/
RUN chmod +x /usr/local/bin/docker/*.sh

# Set correct permissions
RUN chown -R www:www /var/www/html

# Use non-root user from here on
USER www

# Default startup command (runs entrypoint.sh then php-fpm)
ENTRYPOINT ["/usr/local/bin/docker/entrypoint.sh"]
CMD ["php-fpm"]