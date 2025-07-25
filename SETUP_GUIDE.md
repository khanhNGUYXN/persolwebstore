# PERSOL Webstore - Setup and Usage Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Guide](#installation-guide)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Development Environment](#development-environment)
6. [Production Deployment](#production-deployment)
7. [API Configuration](#api-configuration)
8. [Admin Panel Setup](#admin-panel-setup)
9. [File Permissions](#file-permissions)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)
12. [Security Checklist](#security-checklist)

## System Requirements

### Server Requirements
- **PHP**: 7.4 or higher (8.0+ recommended)
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Operating System**: Linux (Ubuntu 20.04+), Windows 10+, or macOS 10.15+

### PHP Extensions Required
```bash
# Required PHP extensions
- pdo
- pdo_mysql
- json
- curl
- gd or imagick
- fileinfo
- mbstring
- openssl
```

### Recommended Hardware
- **RAM**: Minimum 512MB, Recommended 2GB+
- **Storage**: Minimum 1GB free space
- **CPU**: Any modern processor

### Browser Requirements (Frontend)
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Installation Guide

### Step 1: Download and Extract

```bash
# Clone or download the project
git clone https://github.com/your-repo/persolwebstore.git
cd persolwebstore

# Or extract from zip
unzip persolwebstore.zip
cd persolwebstore
```

### Step 2: Directory Setup

```bash
# Create necessary directories
mkdir -p uploads/products
mkdir -p uploads/banner
mkdir -p cache
mkdir -p logs

# Set proper permissions (Linux/macOS)
chmod 755 uploads/
chmod 755 uploads/products/
chmod 755 uploads/banner/
chmod 755 cache/
chmod 755 logs/
```

### Step 3: Web Server Configuration

#### Apache Configuration

Create `.htaccess` in the root directory:
```apache
# .htaccess
RewriteEngine On

# Redirect to frontend if accessing root
RewriteRule ^$ frontend/ [L]

# Protect sensitive files
<Files "*.sql">
    Deny from all
</Files>

<Files "config_gemini.php">
    Deny from all
</Files>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

#### Nginx Configuration

```nginx
# nginx.conf section
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/persolwebstore;
    index index.html index.php;

    # Main location
    location / {
        try_files $uri $uri/ /frontend/index.html;
    }

    # Frontend static files
    location /frontend/ {
        try_files $uri $uri/ /frontend/index.html;
    }

    # Backend API
    location /backend/ {
        try_files $uri $uri/ =404;
    }

    # Admin panel
    location /admin/ {
        try_files $uri $uri/ =404;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Protect sensitive files
    location ~ \.(sql|log)$ {
        deny all;
    }

    # Static file caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Database Setup

### Step 1: Create Database

```sql
-- Create database
CREATE DATABASE persol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'persol_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON persol.* TO 'persol_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Import Database Schema

```bash
# Import the database schema
mysql -u root -p persol < database/persol.sql

# Or using phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select the 'persol' database
# 3. Go to 'Import' tab
# 4. Choose file: database/persol.sql
# 5. Click 'Go'
```

### Step 3: Import Sample Data (Optional)

```bash
# Import CSV data using the provided script
php backend/db/import_csv.php

# Or manually import via phpMyAdmin
# 1. Select 'products' table
# 2. Go to 'Import' tab
# 3. Choose file: database/converted-file.csv
# 4. Set format to CSV
# 5. Configure import settings
# 6. Click 'Go'
```

### Step 4: Verify Database Setup

```sql
-- Check if tables were created
USE persol;
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM users;
```

## Configuration

### Step 1: Database Configuration

Edit `backend/db/db.php`:
```php
<?php
// Database configuration
$host = 'localhost';
$db   = 'persol';
$user = 'root';  // Change to your database user
$pass = '';      // Change to your database password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
?>
```

### Step 2: Gemini AI Configuration

Create `backend/config_gemini.php`:
```php
<?php
// Gemini AI API Configuration
define('GEMINI_API_KEY', 'your_gemini_api_key_here');

// Get your API key from:
// https://makersuite.google.com/app/apikey
?>
```

### Step 3: Frontend Configuration

Edit `frontend/assets/js/app.js` to update API base URL if needed:
```javascript
// Update base URL if not using localhost
const API_BASE_URL = 'http://your-domain.com/persolwebstore/backend/api/';
// or for production:
// const API_BASE_URL = '/backend/api/';
```

### Step 4: Admin Configuration

The admin panel uses the same database configuration as the backend. No additional setup required.

## Development Environment

### Using XAMPP (Windows/macOS/Linux)

1. **Install XAMPP**
   - Download from https://www.apachefriends.org/
   - Install with Apache, MySQL, and PHP

2. **Setup Project**
   ```bash
   # Copy project to htdocs
   cp -r persolwebstore /opt/lampp/htdocs/
   # or on Windows: C:\xampp\htdocs\
   ```

3. **Start Services**
   - Start Apache and MySQL from XAMPP Control Panel
   - Access: http://localhost/persolwebstore/frontend/

### Using WAMP (Windows)

1. **Install WAMP**
   - Download from http://www.wampserver.com/
   - Install and start all services

2. **Setup Project**
   ```bash
   # Copy project to www directory
   cp -r persolwebstore C:\wamp64\www\
   ```

3. **Access Application**
   - Access: http://localhost/persolwebstore/frontend/

### Using Docker

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  web:
    image: php:8.0-apache
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - db
    environment:
      - APACHE_DOCUMENT_ROOT=/var/www/html

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: persol
      MYSQL_USER: persol_user
      MYSQL_PASSWORD: userpassword
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

Run with Docker:
```bash
# Start services
docker-compose up -d

# Import database
docker exec -i container_name mysql -u root -prootpassword persol < database/persol.sql

# Access application
# http://localhost:8080/frontend/
```

## Production Deployment

### Step 1: Server Preparation

```bash
# Update system (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apache2 mysql-server php8.0 php8.0-mysql php8.0-curl php8.0-gd php8.0-mbstring php8.0-xml

# Or for CentOS/RHEL
sudo yum install -y httpd mysql-server php php-mysql php-curl php-gd php-mbstring php-xml
```

### Step 2: Security Configuration

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create dedicated database user
mysql -u root -p
```

```sql
CREATE DATABASE persol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'persol_app'@'localhost' IDENTIFIED BY 'strong_random_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON persol.* TO 'persol_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: File Deployment

```bash
# Upload files to web directory
sudo cp -r persolwebstore /var/www/html/

# Set ownership and permissions
sudo chown -R www-data:www-data /var/www/html/persolwebstore
sudo chmod -R 755 /var/www/html/persolwebstore
sudo chmod -R 775 /var/www/html/persolwebstore/uploads
sudo chmod -R 775 /var/www/html/persolwebstore/cache
```

### Step 4: SSL Certificate Setup

```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 5: Performance Optimization

```bash
# Enable Apache modules
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
sudo a2enmod headers

# Restart Apache
sudo systemctl restart apache2

# Configure PHP for production
sudo nano /etc/php/8.0/apache2/php.ini
```

Production PHP settings:
```ini
; Production PHP configuration
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
upload_max_filesize = 10M
post_max_size = 12M
max_execution_time = 30
memory_limit = 256M
session.cookie_httponly = 1
session.cookie_secure = 1
```

## API Configuration

### Step 1: Enable CORS (if needed)

Add to all API files or create a common header file:
```php
<?php
// CORS headers
header('Access-Control-Allow-Origin: https://your-domain.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>
```

### Step 2: Rate Limiting (Production)

Create `backend/includes/rate_limit.php`:
```php
<?php
class RateLimiter {
    private $pdo;
    private $limit;
    private $window;
    
    public function __construct($pdo, $limit = 100, $window = 3600) {
        $this->pdo = $pdo;
        $this->limit = $limit;
        $this->window = $window;
    }
    
    public function isAllowed($identifier) {
        $now = time();
        $window_start = $now - $this->window;
        
        // Clean old entries
        $stmt = $this->pdo->prepare('DELETE FROM rate_limits WHERE timestamp < ?');
        $stmt->execute([$window_start]);
        
        // Check current count
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM rate_limits WHERE identifier = ? AND timestamp > ?');
        $stmt->execute([$identifier, $window_start]);
        $count = $stmt->fetchColumn();
        
        if ($count >= $this->limit) {
            return false;
        }
        
        // Log this request
        $stmt = $this->pdo->prepare('INSERT INTO rate_limits (identifier, timestamp) VALUES (?, ?)');
        $stmt->execute([$identifier, $now]);
        
        return true;
    }
}

// Usage in API files
$rateLimiter = new RateLimiter($pdo);
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

if (!$rateLimiter->isAllowed($clientIP)) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
    exit;
}
?>
```

### Step 3: API Logging

Create `backend/includes/logger.php`:
```php
<?php
class APILogger {
    private $logFile;
    
    public function __construct($logFile = '../logs/api.log') {
        $this->logFile = $logFile;
        
        // Create log directory if not exists
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    public function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'unknown';
        $uri = $_SERVER['REQUEST_URI'] ?? 'unknown';
        
        $logEntry = "[$timestamp] [$level] [$ip] [$method] $uri - $message" . PHP_EOL;
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    public function logError($message) {
        $this->log($message, 'ERROR');
    }
    
    public function logWarning($message) {
        $this->log($message, 'WARNING');
    }
}

// Usage in API files
$logger = new APILogger();
$logger->log('API request processed successfully');
?>
```

## Admin Panel Setup

### Step 1: Create Admin User

```sql
-- Create admin user
INSERT INTO users (user_id, username, fullname, email, password, role) 
VALUES (
    'admin_001',
    'admin',
    'System Administrator',
    'admin@your-domain.com',
    SHA2('your_secure_admin_password', 256),
    'ADMIN'
);
```

### Step 2: Admin Security

Edit `admin/includes/auth.php` to add additional security:
```php
<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

// Verify admin role and session validity
$stmt = $pdo->prepare('SELECT role, last_activity FROM users WHERE user_id = ?');
$stmt->execute([$_SESSION['admin_id']]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'ADMIN') {
    session_destroy();
    header('Location: login.php');
    exit;
}

// Session timeout (30 minutes)
$timeout = 1800; // 30 minutes
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout) {
    session_destroy();
    header('Location: login.php?timeout=1');
    exit;
}

$_SESSION['last_activity'] = time();

// Update user activity
$stmt = $pdo->prepare('UPDATE users SET last_activity = NOW() WHERE user_id = ?');
$stmt->execute([$_SESSION['admin_id']]);
?>
```

## File Permissions

### Linux/macOS Permissions

```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/html/persolwebstore

# Set directory permissions
find /var/www/html/persolwebstore -type d -exec chmod 755 {} \;

# Set file permissions
find /var/www/html/persolwebstore -type f -exec chmod 644 {} \;

# Set writable directories
chmod 775 /var/www/html/persolwebstore/uploads
chmod 775 /var/www/html/persolwebstore/uploads/products
chmod 775 /var/www/html/persolwebstore/uploads/banner
chmod 775 /var/www/html/persolwebstore/cache
chmod 775 /var/www/html/persolwebstore/logs

# Protect sensitive files
chmod 600 /var/www/html/persolwebstore/backend/config_gemini.php
chmod 600 /var/www/html/persolwebstore/backend/db/db.php
```

### Windows Permissions

```cmd
# Give IIS_IUSRS full control to upload directories
icacls "C:\inetpub\wwwroot\persolwebstore\uploads" /grant IIS_IUSRS:F /T
icacls "C:\inetpub\wwwroot\persolwebstore\cache" /grant IIS_IUSRS:F /T
icacls "C:\inetpub\wwwroot\persolwebstore\logs" /grant IIS_IUSRS:F /T
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: "Database connection failed"

**Solutions**:
```bash
# Check MySQL service
sudo systemctl status mysql

# Check credentials in db.php
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check PHP MySQL extension
php -m | grep mysql
```

#### 2. File Upload Issues

**Error**: "Failed to upload file"

**Solutions**:
```bash
# Check directory permissions
ls -la uploads/

# Check PHP upload settings
php -i | grep upload

# Increase upload limits in php.ini
upload_max_filesize = 10M
post_max_size = 12M
```

#### 3. API CORS Errors

**Error**: "CORS policy blocked"

**Solutions**:
```php
// Add to API files
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
```

#### 4. Session Issues

**Error**: "Session expired" or "Not logged in"

**Solutions**:
```bash
# Check session directory permissions
sudo chown -R www-data:www-data /var/lib/php/sessions

# Check PHP session settings
php -i | grep session
```

#### 5. Gemini API Issues

**Error**: "Gemini API error"

**Solutions**:
```php
// Verify API key in config_gemini.php
// Check cURL extension
php -m | grep curl

// Test API key manually
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY"
```

### Debug Mode

Enable debug mode for development:

Create `debug.php`:
```php
<?php
// Debug configuration
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', 'debug.log');
}

function debugLog($message, $data = null) {
    if (DEBUG_MODE) {
        $log = date('Y-m-d H:i:s') . ' - ' . $message;
        if ($data) {
            $log .= ' - ' . json_encode($data);
        }
        file_put_contents('debug.log', $log . PHP_EOL, FILE_APPEND);
    }
}
?>
```

Include in API files:
```php
<?php
include_once 'debug.php';
debugLog('API call received', $_POST);
?>
```

## Maintenance

### Regular Tasks

#### 1. Database Optimization

```sql
-- Run monthly
OPTIMIZE TABLE products;
OPTIMIZE TABLE orders;
OPTIMIZE TABLE users;
OPTIMIZE TABLE cart;

-- Check table status
SHOW TABLE STATUS;
```

#### 2. Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/persolwebstore
```

```
/var/www/html/persolwebstore/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

#### 3. Cache Cleanup

```bash
# Clean old cache files (older than 24 hours)
find /var/www/html/persolwebstore/cache -name "*.cache" -mtime +1 -delete

# Clean old session files
find /var/lib/php/sessions -name "sess_*" -mtime +1 -delete
```

#### 4. Database Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/persolwebstore"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u root -p persol > $BACKUP_DIR/database_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html/persolwebstore/uploads

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### 5. Security Updates

```bash
# Regular system updates
sudo apt update && sudo apt upgrade

# Check for PHP security updates
sudo apt list --upgradable | grep php

# Monitor logs for suspicious activity
tail -f /var/log/apache2/access.log | grep -E "(POST|PUT|DELETE)"
```

## Security Checklist

### Pre-Production Security

- [ ] Change default database passwords
- [ ] Remove or secure phpMyAdmin
- [ ] Configure firewall (UFW/iptables)
- [ ] Enable HTTPS/SSL
- [ ] Set secure file permissions
- [ ] Configure secure PHP settings
- [ ] Enable rate limiting
- [ ] Set up log monitoring
- [ ] Regular security updates
- [ ] Backup strategy implemented

### Security Headers

Add to Apache `.htaccess` or Nginx config:
```apache
# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net code.jquery.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' cdn.jsdelivr.net"
```

### Database Security

```sql
-- Remove test databases
DROP DATABASE IF EXISTS test;

-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Flush privileges
FLUSH PRIVILEGES;
```

This comprehensive setup guide should help you successfully deploy and maintain the PERSOL Webstore system in both development and production environments.