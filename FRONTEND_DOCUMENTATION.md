# PERSOL Webstore - Frontend Documentation

## Overview

The PERSOL Webstore frontend is a Single Page Application (SPA) built with vanilla JavaScript, jQuery, and Bootstrap 5. It provides a modern, responsive user interface for browsing and purchasing eyewear products.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [JavaScript Modules](#javascript-modules)
4. [SPA Navigation](#spa-navigation)
5. [Authentication Functions](#authentication-functions)
6. [Product Management](#product-management)
7. [Shopping Cart](#shopping-cart)
8. [Order Management](#order-management)
9. [User Profile](#user-profile)
10. [UI Components](#ui-components)
11. [Styling and Themes](#styling-and-themes)
12. [Browser Compatibility](#browser-compatibility)

## Architecture Overview

### File Structure
```
frontend/
├── index.html              # Main SPA entry point
└── assets/
    ├── css/
    │   └── style.css       # Main stylesheet
    ├── js/
    │   ├── app.js          # Core SPA logic and navigation
    │   ├── auth.js         # Authentication functions
    │   ├── cart.js         # Shopping cart management
    │   ├── order.js        # Order processing
    │   ├── product.js      # Product display and search
    │   └── user.js         # User profile management
    └── images/             # Static images
```

### Technology Stack
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with Bootstrap 5
- **JavaScript ES6+**: Modern JavaScript features
- **jQuery 3.6.0**: DOM manipulation and AJAX
- **Bootstrap 5.3.0**: Responsive UI framework
- **Bootstrap Icons**: Icon library

### SPA Architecture
The application uses hash-based routing (`#page`) to manage different views without page reloads. All content is dynamically rendered into the `#spa-content` container.

## Core Components

### Main HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta tags and stylesheets -->
</head>
<body>
    <header>
        <!-- Site title and branding -->
    </header>
    <nav id="main-menu">
        <!-- Navigation menu -->
    </nav>
    <main>
        <div id="spa-content">
            <!-- Dynamic content area -->
        </div>
    </main>
    <div id="chatbot">
        <!-- AI chat widget -->
    </div>
    <!-- Scripts -->
</body>
</html>
```

### Navigation Menu

The main navigation supports:
- **Home**: Landing page with banners
- **Products**: Product catalog with categories
- **Cart**: Shopping cart management
- **Orders**: Order history
- **Profile**: User account management
- **Auth**: Login/Register forms

## JavaScript Modules

### 1. App.js - Core SPA Framework

**Main Functions:**

#### `showSection(hash)`
Handles SPA navigation and content rendering.

```javascript
function showSection(hash) {
    $("#spa-content").removeClass("fade-in").addClass("fade-out");
    setTimeout(function() {
        $("#spa-content").removeClass("fade-out").addClass("fade-in");
        // Route to appropriate function based on hash
        if (/^#products(?:-page-\d+)?$/.test(hash)) {
            loadProducts(null, page);
        } else if (hash === '#cart') {
            loadCart();
        }
        // ... other routes
    }, 200);
}
```

**Usage:**
```javascript
// Navigate to products page
window.location.hash = '#products';

// Navigate to specific category
window.location.hash = '#category-1';

// Navigate to search results
window.location.hash = '#search-' + encodeURIComponent(searchTerm);
```

#### `setActiveMenu(hash)`
Updates navigation menu active states.

```javascript
function setActiveMenu(hash) {
    $("#main-menu .nav-link").removeClass("active");
    // Set appropriate menu item as active
}
```

#### `updateAuthMenu()`
Updates authentication-related menu items based on login status.

```javascript
function updateAuthMenu() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        // Show logged-in menu items
        $("#auth-menu").html(`
            <a href="#profile">Profile</a>
            <a href="#orders">Orders</a>
            <a href="#logout">Logout</a>
        `);
    } else {
        // Show login/register options
        $("#auth-menu").html(`
            <a href="#login">Login</a>
            <a href="#register">Register</a>
        `);
    }
}
```

### 2. Auth.js - Authentication Management

#### `loadLogin()`
Renders and handles the login form.

```javascript
function loadLogin() {
    $('#spa-content').html(`
        <div class="auth-box">
            <h2>Login</h2>
            <form id="login-form">
                <input type="text" name="login" placeholder="Username or Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <div id="login-msg"></div>
            <a href="#register">Don't have an account? Register</a>
        </div>
    `);
    
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        // Handle login logic
    });
}
```

#### `loadRegister()`
Renders and handles the registration form.

```javascript
function loadRegister() {
    $('#spa-content').html(`
        <div class="auth-box">
            <h2>Register</h2>
            <form id="register-form">
                <input type="text" name="username" placeholder="Username" required>
                <input type="text" name="fullname" placeholder="Full Name" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="password" name="repassword" placeholder="Confirm Password" required>
                <button type="submit">Register</button>
            </form>
            <div id="register-msg"></div>
        </div>
    `);
}
```

#### `logout()`
Handles user logout process.

```javascript
function logout() {
    localStorage.removeItem('user');
    updateAuthMenu();
    window.location.hash = '#home';
}
```

**Usage Examples:**
```javascript
// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (user) {
    console.log('User logged in:', user.username);
}

// Login process
const loginData = {
    login: 'username',
    password: 'password123'
};

fetch('backend/api/auth.php?action=login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        localStorage.setItem('user', JSON.stringify(data));
        updateAuthMenu();
        window.location.hash = '#home';
    }
});
```

### 3. Product.js - Product Management

#### `loadProducts(categoryId, page, searchTerm)`
Loads and displays product listings with filtering and pagination.

```javascript
function loadProducts(categoryId = null, page = 1, searchTerm = '') {
    let url = 'backend/api/products.php?page=' + page + '&limit=12';
    
    if (categoryId) url += '&category_id=' + categoryId;
    if (searchTerm) url += '&search=' + encodeURIComponent(searchTerm);
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderProductGrid(data.products);
            renderPagination(data.total_pages, page, categoryId, searchTerm);
        });
}
```

#### `renderProductGrid(products)`
Renders product cards in a responsive grid.

```javascript
function renderProductGrid(products) {
    const html = products.map(product => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card product-card h-100">
                <img src="${normalizeImageUrl(product.image_url)}" 
                     class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted">${product.brand}</p>
                    <p class="price fw-bold">$${Number(product.price).toFixed(2)}</p>
                    <button class="btn btn-primary btn-sm" 
                            onclick="addToCart('${product.product_id}')">
                        Add to Cart
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" 
                            onclick="viewProduct('${product.product_id}')">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    $('#products-grid').html(html);
}
```

#### `viewProduct(productId)`
Displays detailed product information.

```javascript
function viewProduct(productId) {
    fetch(`backend/api/products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            const product = data.product;
            $('#spa-content').html(`
                <div class="product-detail">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="product-images">
                                ${renderProductImages(product.images || [product.image_url])}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h1>${product.name}</h1>
                            <p class="brand">${product.brand}</p>
                            <p class="price h3">$${Number(product.price).toFixed(2)}</p>
                            <p class="description">${product.description}</p>
                            <button class="btn btn-primary btn-lg" 
                                    onclick="addToCart('${product.product_id}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `);
        });
}
```

#### `searchProducts(query)`
Handles product search functionality.

```javascript
function searchProducts(query) {
    if (query.trim()) {
        window.location.hash = '#search-' + encodeURIComponent(query.trim());
    }
}
```

**Usage Examples:**
```javascript
// Load all products
loadProducts();

// Load products from specific category
loadProducts(1); // Category ID 1

// Load products with search
loadProducts(null, 1, 'Ray-Ban');

// Search for products
$('#search-form').on('submit', function(e) {
    e.preventDefault();
    const query = $('#search-input').val();
    searchProducts(query);
});
```

### 4. Cart.js - Shopping Cart Management

#### `loadCart()`
Displays the shopping cart with items and totals.

```javascript
function loadCart() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.hash = '#login';
        return;
    }
    
    fetch(`backend/api/cart.php?user_id=${user.user_id}`)
        .then(response => response.json())
        .then(data => {
            renderCartItems(data.cart);
            updateCartTotal(data.cart);
        });
}
```

#### `addToCart(productId, quantity = 1)`
Adds a product to the shopping cart.

```javascript
function addToCart(productId, quantity = 1) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.hash = '#login';
        return;
    }
    
    fetch(`backend/api/cart.php?user_id=${user.user_id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Product added to cart!');
            updateCartCounter();
        }
    });
}
```

#### `updateCartQuantity(productId, newQuantity)`
Updates the quantity of an item in the cart.

```javascript
function updateCartQuantity(productId, newQuantity) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    fetch(`backend/api/cart.php?user_id=${user.user_id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            product_id: productId,
            quantity: newQuantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCart(); // Refresh cart display
        }
    });
}
```

#### `removeFromCart(productId)`
Removes an item from the cart.

```javascript
function removeFromCart(productId) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    fetch(`backend/api/cart.php?user_id=${user.user_id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCart(); // Refresh cart display
        }
    });
}
```

**Usage Examples:**
```javascript
// Add product to cart from product page
$('.add-to-cart-btn').on('click', function() {
    const productId = $(this).data('product-id');
    addToCart(productId);
});

// Update quantity in cart
$('.quantity-input').on('change', function() {
    const productId = $(this).data('product-id');
    const newQuantity = parseInt($(this).val());
    updateCartQuantity(productId, newQuantity);
});
```

### 5. Order.js - Order Management

#### `loadOrders()`
Displays the user's order history.

```javascript
function loadOrders() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.hash = '#login';
        return;
    }
    
    fetch(`backend/api/order.php?user_id=${user.user_id}`)
        .then(response => response.json())
        .then(data => {
            renderOrderList(data.orders);
        });
}
```

#### `viewOrder(orderId)`
Displays detailed information for a specific order.

```javascript
function viewOrder(orderId) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    fetch(`backend/api/order.php?user_id=${user.user_id}&id=${orderId}`)
        .then(response => response.json())
        .then(data => {
            renderOrderDetail(data.order, data.items);
        });
}
```

#### `processCheckout()`
Handles the complete checkout process.

```javascript
async function processCheckout() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    try {
        // 1. Create delivery information
        const deliveryData = {
            recipient: $('#recipient').val(),
            address: $('#address').val(),
            city: $('#city').val(),
            phone: $('#phone').val(),
            zipcode: $('#zipcode').val()
        };
        
        const deliveryResponse = await fetch(`backend/api/order.php?user_id=${user.user_id}&action=delivery`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(deliveryData)
        });
        const deliveryResult = await deliveryResponse.json();
        
        // 2. Create transaction information
        const transactionData = {
            payment_method: $('#payment-method').val()
        };
        
        const transactionResponse = await fetch(`backend/api/order.php?user_id=${user.user_id}&action=transaction`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(transactionData)
        });
        const transactionResult = await transactionResponse.json();
        
        // 3. Create the order
        const orderResponse = await fetch(`backend/api/order.php?user_id=${user.user_id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                delivery_id: deliveryResult.delivery_id,
                trans_id: transactionResult.trans_id
            })
        });
        const orderResult = await orderResponse.json();
        
        if (orderResult.success) {
            showNotification('Order placed successfully!');
            window.location.hash = '#orders';
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Error processing order. Please try again.');
    }
}
```

### 6. User.js - User Profile Management

#### `loadProfile()`
Displays and handles the user profile form.

```javascript
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        window.location.hash = '#login';
        return;
    }
    
    fetch(`backend/api/user.php?user_id=${user.user_id}&action=profile`)
        .then(response => response.json())
        .then(data => {
            renderProfileForm(data.user);
        });
}
```

#### `updateProfile()`
Updates user profile information.

```javascript
function updateProfile() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const formData = {
        fullname: $('#fullname').val(),
        phone: $('#phone').val(),
        address: $('#address').val(),
        city: $('#city').val(),
        zipcode: $('#zipcode').val(),
        birthdate: $('#birthdate').val()
    };
    
    fetch(`backend/api/user.php?user_id=${user.user_id}&action=update_profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Profile updated successfully!');
        }
    });
}
```

#### `loadChangePassword()`
Displays the change password form.

```javascript
function loadChangePassword() {
    $('#spa-content').html(`
        <div class="profile-section">
            <h3>Change Password</h3>
            <form id="change-password-form">
                <div class="mb-3">
                    <label>Current Password</label>
                    <input type="password" class="form-control" name="current_password" required>
                </div>
                <div class="mb-3">
                    <label>New Password</label>
                    <input type="password" class="form-control" name="new_password" required>
                </div>
                <div class="mb-3">
                    <label>Confirm New Password</label>
                    <input type="password" class="form-control" name="confirm_password" required>
                </div>
                <button type="submit" class="btn btn-primary">Change Password</button>
            </form>
        </div>
    `);
    
    $('#change-password-form').on('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
}
```

## SPA Navigation

### Hash-based Routing

The application uses hash-based routing for navigation:

```javascript
// Supported routes
#home              // Homepage
#products          // All products
#products-page-2   // Products with pagination
#category-1        // Products by category
#search-term       // Search results
#cart              // Shopping cart
#orders            // Order history
#profile           // User profile
#login             // Login form
#register          // Registration form
#logout            // Logout action
```

### Navigation Events

```javascript
$(window).on('hashchange', function() {
    const hash = window.location.hash || '#home';
    showSection(hash);
    setActiveMenu(hash);
});

// Initial load
$(document).ready(function() {
    const hash = window.location.hash || '#home';
    showSection(hash);
    setActiveMenu(hash);
    updateAuthMenu();
});
```

## UI Components

### Notifications

```javascript
function showNotification(message, type = 'success') {
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    const notification = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').prepend(notification);
    
    setTimeout(() => {
        notification.fadeOut();
    }, 3000);
}
```

### Loading States

```javascript
function showLoading() {
    $('#spa-content').html(`
        <div class="text-center my-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
}
```

### Modal Components

```javascript
function showModal(title, content, actions = '') {
    const modal = $(`
        <div class="modal fade" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${actions}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    modal.modal('show');
    
    modal.on('hidden.bs.modal', function() {
        modal.remove();
    });
}
```

## Styling and Themes

### CSS Variables
```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
}
```

### Responsive Design
- **Mobile-first**: Design starts with mobile and scales up
- **Breakpoints**: Bootstrap 5 responsive breakpoints
- **Grid System**: 12-column responsive grid
- **Flexible Images**: Images scale with container size

### Animation Classes
```css
.fade-in {
    animation: fadeIn 0.3s ease-in;
}

.fade-out {
    animation: fadeOut 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
```

## Browser Compatibility

### Supported Browsers
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile Safari**: 13+
- **Chrome Mobile**: 80+

### Polyfills Included
- **fetch()**: For older browsers
- **Promise**: For IE11 support
- **Array methods**: For enhanced compatibility

### Feature Detection
```javascript
// Check for required features
if (!window.fetch) {
    console.error('Fetch API not supported. Please use a modern browser.');
}

if (!window.localStorage) {
    console.error('LocalStorage not supported. Some features may not work.');
}
```

## Performance Optimization

### Lazy Loading
- **Images**: Load images as they come into viewport
- **Components**: Load JavaScript modules on demand
- **API Calls**: Cache API responses when appropriate

### Caching Strategy
```javascript
// Simple cache implementation
const cache = new Map();

function cachedFetch(url, options = {}) {
    if (options.method && options.method !== 'GET') {
        return fetch(url, options);
    }
    
    if (cache.has(url)) {
        return Promise.resolve(cache.get(url));
    }
    
    return fetch(url, options)
        .then(response => response.json())
        .then(data => {
            cache.set(url, data);
            return data;
        });
}
```

### Bundle Size Optimization
- **Minification**: Minify CSS and JavaScript in production
- **Tree Shaking**: Remove unused code
- **Image Optimization**: Compress and resize images
- **CDN**: Use CDN for external libraries

## Getting Started

### Prerequisites
- Modern web browser
- Web server (Apache, Nginx, or development server)
- Backend API running

### Installation
1. **Clone the repository**
2. **Set up web server** to serve the frontend directory
3. **Configure API endpoints** in JavaScript files
4. **Test the application** in your browser

### Development Setup
```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server frontend/

# Using PHP built-in server
php -S localhost:8000 -t frontend/
```

### Building for Production
1. **Minify JavaScript and CSS files**
2. **Optimize images**
3. **Configure proper caching headers**
4. **Set up HTTPS**
5. **Enable compression (gzip/brotli)**

## Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// If you encounter CORS issues, ensure your backend includes proper headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
```

#### localStorage Issues
```javascript
// Check if localStorage is available
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    console.error('localStorage not available');
    // Implement fallback storage
}
```

#### API Connection Issues
```javascript
// Add error handling for API calls
fetch('api/endpoint')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('API Error:', error);
        showNotification('Connection error. Please try again.', 'error');
    });
```

### Debug Mode
```javascript
// Enable debug mode
const DEBUG = true;

function debugLog(message, data = null) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`, data);
    }
}
```