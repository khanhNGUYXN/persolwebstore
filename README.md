# PERSOL Webstore - Complete E-commerce Platform

## Overview

PERSOL Webstore is a comprehensive e-commerce platform specialized in eyewear products, featuring a modern SPA frontend, robust PHP backend APIs, AI-powered chat assistance, and a complete admin management system.

## Key Features

### Customer Features
- **Product Catalog**: Browse eyewear products with advanced filtering and search
- **User Authentication**: Secure registration and login system
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Complete checkout process with order tracking
- **AI Chat Assistant**: Gemini-powered product recommendations and support
- **Responsive Design**: Mobile-first design with Bootstrap 5

### Admin Features
- **Dashboard**: Comprehensive analytics and system overview
- **Product Management**: Full CRUD operations with image uploads
- **User Management**: Customer account management and control
- **Order Processing**: Order status updates and management
- **Banner Management**: Homepage banner customization
- **Analytics**: Sales reports and performance metrics

### Technical Features
- **RESTful APIs**: JSON-based backend APIs
- **Single Page Application**: Hash-based routing SPA
- **Database Integration**: MySQL with PDO
- **File Upload System**: Secure image upload and management
- **AI Integration**: Google Gemini API for intelligent assistance
- **Security**: Session management, input validation, CSRF protection

## Project Structure

```
persolwebstore/
├── frontend/                   # SPA Frontend
│   ├── index.html             # Main application entry
│   └── assets/
│       ├── css/style.css      # Styles and themes
│       └── js/                # JavaScript modules
│           ├── app.js         # Core SPA framework
│           ├── auth.js        # Authentication
│           ├── cart.js        # Shopping cart
│           ├── order.js       # Order management
│           ├── product.js     # Product display
│           └── user.js        # User profiles
├── backend/                   # PHP Backend APIs
│   ├── api/                   # RESTful endpoints
│   │   ├── auth.php          # User authentication
│   │   ├── products.php      # Product operations
│   │   ├── cart.php          # Shopping cart
│   │   ├── order.php         # Order processing
│   │   ├── user.php          # User management
│   │   ├── banner.php        # Banner management
│   │   ├── categories.php    # Product categories
│   │   └── gemini_chat.php   # AI chat integration
│   └── db/                   # Database layer
│       ├── db.php            # Database connection
│       └── import_csv.php    # Data import utilities
├── admin/                    # Admin Panel
│   ├── dashboard.php         # System overview
│   ├── products.php          # Product management
│   ├── users.php            # User management
│   ├── orders.php           # Order management
│   ├── banner.php           # Banner management
│   └── includes/            # Shared components
├── database/                # Database files
│   ├── persol.sql           # Database schema
│   └── converted-file.csv   # Sample data
├── uploads/                 # File storage
│   ├── products/           # Product images
│   └── banner/             # Banner images
└── Documentation/          # Comprehensive guides
    ├── API_DOCUMENTATION.md
    ├── FRONTEND_DOCUMENTATION.md
    ├── ADMIN_DOCUMENTATION.md
    └── SETUP_GUIDE.md
```

## Quick Start

### Prerequisites
- PHP 7.4+ (8.0+ recommended)
- MySQL 5.7+ (8.0+ recommended)
- Web server (Apache/Nginx)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/persolwebstore.git
   cd persolwebstore
   ```

2. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE persol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # Import schema
   mysql -u root -p persol < database/persol.sql
   ```

3. **Configure Database**
   ```php
   // Edit backend/db/db.php
   $host = 'localhost';
   $db   = 'persol';
   $user = 'your_db_user';
   $pass = 'your_db_password';
   ```

4. **Set File Permissions**
   ```bash
   chmod 755 uploads/
   chmod 755 uploads/products/
   chmod 755 uploads/banner/
   ```

5. **Configure Gemini AI (Optional)**
   ```php
   // Create backend/config_gemini.php
   define('GEMINI_API_KEY', 'your_api_key_here');
   ```

6. **Access the Application**
   - Frontend: `http://localhost/persolwebstore/frontend/`
   - Admin Panel: `http://localhost/persolwebstore/admin/`

### Create Admin User

```sql
INSERT INTO users (user_id, username, fullname, email, password, role) 
VALUES (
    'admin_001',
    'admin',
    'System Administrator',
    'admin@example.com',
    SHA2('your_admin_password', 256),
    'ADMIN'
);
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /backend/api/auth.php?action=register
Content-Type: application/json

{
  "username": "johndoe",
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "repassword": "securepassword"
}
```

#### Login User
```http
POST /backend/api/auth.php?action=login
Content-Type: application/json

{
  "login": "johndoe",
  "password": "securepassword"
}
```

### Product Endpoints

#### Get Products
```http
GET /backend/api/products.php?page=1&limit=12&search=Ray-Ban&category_id=1
```

#### Get Product by ID
```http
GET /backend/api/products.php?id=123
```

### Cart Endpoints

#### Get Cart Items
```http
GET /backend/api/cart.php?user_id=user123
```

#### Add to Cart
```http
POST /backend/api/cart.php?user_id=user123
Content-Type: application/json

{
  "product_id": "prod123",
  "quantity": 2
}
```

### Order Endpoints

#### Create Order
```http
POST /backend/api/order.php?user_id=user123
Content-Type: application/json

{
  "delivery_id": 1,
  "trans_id": 1
}
```

## Frontend Usage

### SPA Navigation
The application uses hash-based routing:
- `#home` - Homepage
- `#products` - Product catalog
- `#cart` - Shopping cart
- `#orders` - Order history
- `#profile` - User profile
- `#login` - Login form

### Key JavaScript Functions

```javascript
// Load products
loadProducts(categoryId, page, searchTerm);

// Add to cart
addToCart(productId, quantity);

// Process checkout
processCheckout();

// User authentication
updateAuthMenu();
```

## Admin Panel Usage

### Dashboard Features
- Product, user, and order statistics
- Revenue analytics
- Monthly sales reports
- Top-selling products

### Product Management
- Add/edit/delete products
- Upload multiple product images
- Manage categories and pricing
- Import products from CSV

### Order Management
- View order details
- Update order status
- Track delivery information
- Generate reports

## Technology Stack

### Frontend
- **HTML5/CSS3**: Semantic markup and modern styling
- **JavaScript ES6+**: Modern JavaScript features
- **jQuery 3.6.0**: DOM manipulation and AJAX
- **Bootstrap 5.3.0**: Responsive UI framework
- **SPA Architecture**: Hash-based routing

### Backend
- **PHP 8.0+**: Server-side scripting
- **MySQL 8.0+**: Database management
- **PDO**: Database abstraction layer
- **RESTful APIs**: JSON-based communication
- **Session Management**: Secure authentication

### AI Integration
- **Google Gemini API**: Natural language processing
- **Product Recommendations**: AI-powered suggestions
- **Smart Search**: Intelligent product filtering

## Security Features

- **Input Validation**: Server-side validation and sanitization
- **SQL Injection Protection**: Prepared statements with PDO
- **Session Security**: Secure session management
- **File Upload Security**: Validated file uploads
- **HTTPS Support**: SSL/TLS encryption
- **CSRF Protection**: Cross-site request forgery prevention

## Performance Features

- **Caching**: Browser and server-side caching
- **Image Optimization**: Compressed images
- **Lazy Loading**: On-demand content loading
- **Database Indexing**: Optimized queries
- **CDN Support**: External library delivery

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Development Environment Setup

1. **Using XAMPP**
   ```bash
   # Copy to htdocs
   cp -r persolwebstore /opt/lampp/htdocs/
   ```

2. **Using Docker**
   ```bash
   docker-compose up -d
   ```

3. **Local Development Server**
   ```bash
   php -S localhost:8000 -t frontend/
   ```

### Code Structure

- **Modular Design**: Separated concerns across modules
- **RESTful Architecture**: Clean API design
- **MVC Pattern**: Model-View-Controller separation
- **Responsive Design**: Mobile-first approach

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Frontend Documentation](FRONTEND_DOCUMENTATION.md)** - SPA components and functions
- **[Admin Documentation](ADMIN_DOCUMENTATION.md)** - Admin panel guide
- **[Setup Guide](SETUP_GUIDE.md)** - Installation and deployment

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation files
- Review the troubleshooting guide

## Changelog

### Version 1.0.0
- Initial release with complete e-commerce functionality
- SPA frontend with responsive design
- RESTful backend APIs
- Admin panel with full management capabilities
- AI chat integration with Gemini
- Comprehensive documentation

---

**PERSOL Webstore** - A modern, secure, and scalable e-commerce platform for eyewear retail.