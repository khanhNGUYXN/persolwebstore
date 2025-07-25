# PERSOL Webstore - API Documentation

## Overview

PERSOL Webstore is a comprehensive e-commerce platform specializing in eyewear products. The backend provides RESTful APIs for user authentication, product management, shopping cart functionality, order processing, and AI-powered chat assistance.

**Base URL:** `http://localhost/persolwebstore/backend/api/`

**Content-Type:** All requests and responses use `application/json`

## Table of Contents

1. [Authentication API](#authentication-api)
2. [Products API](#products-api)
3. [Categories API](#categories-api)
4. [Cart API](#cart-api)
5. [Orders API](#orders-api)
6. [User Management API](#user-management-api)
7. [Banner API](#banner-api)
8. [Gemini Chat API](#gemini-chat-api)
9. [Error Handling](#error-handling)
10. [Database Configuration](#database-configuration)

## Authentication API

### Endpoint: `/auth.php`

#### User Registration

**POST** `/auth.php?action=register`

Registers a new user account.

**Request Body:**
```json
{
  "username": "string",
  "fullname": "string", 
  "email": "string",
  "password": "string",
  "repassword": "string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user_id": "string"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Example:**
```javascript
fetch('backend/api/auth.php?action=register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: 'johndoe',
    fullname: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword',
    repassword: 'securepassword'
  })
});
```

#### User Login

**POST** `/auth.php?action=login`

Authenticates a user and returns user information.

**Request Body:**
```json
{
  "login": "string", // username or email
  "password": "string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user_id": "string",
  "username": "string",
  "fullname": "string",
  "email": "string",
  "role": "string" // CUSTOMER, ADMIN
}
```

**Example:**
```javascript
fetch('backend/api/auth.php?action=login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    login: 'johndoe',
    password: 'securepassword'
  })
});
```

## Products API

### Endpoint: `/products.php`

#### Get Products List

**GET** `/products.php`

Retrieves a paginated list of products with filtering and search capabilities.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search keywords (supports multiple words with AND logic)
- `category_id` (optional): Filter by category ID
- `price_min` (optional): Minimum price filter
- `price_max` (optional): Maximum price filter

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "product_id": "string",
      "name": "string",
      "brand": "string",
      "price": "number",
      "description": "string",
      "image_url": "string",
      "images": ["array of image URLs"],
      "category_id": "string",
      "detail_file": "string"
    }
  ],
  "total": "number",
  "total_pages": "number",
  "page": "number",
  "limit": "number"
}
```

**Examples:**

```javascript
// Get first page of products
fetch('backend/api/products.php?page=1&limit=12')

// Search for Ray-Ban products
fetch('backend/api/products.php?search=Ray-Ban')

// Filter by category and price range
fetch('backend/api/products.php?category_id=1&price_min=100&price_max=500')
```

#### Get Product by ID

**GET** `/products.php?id={product_id}`

Retrieves specific product(s) by ID. Supports multiple IDs separated by commas.

**Response (Single Product):**
```json
{
  "product": {
    "product_id": "string",
    "name": "string",
    "brand": "string",
    "price": "number",
    "description": "string",
    "image_url": "string",
    "images": ["array of image URLs"],
    "category_id": "string",
    "detail_file": "string"
  }
}
```

**Examples:**
```javascript
// Get single product
fetch('backend/api/products.php?id=123')

// Get multiple products
fetch('backend/api/products.php?id=123,456,789')
```

## Categories API

### Endpoint: `/categories.php`

#### Get All Categories

**GET** `/categories.php`

Retrieves all product categories.

**Response:**
```json
{
  "categories": [
    {
      "category_id": "string",
      "name": "string",
      "parent_id": "string"
    }
  ]
}
```

**Example:**
```javascript
fetch('backend/api/categories.php')
```

## Cart API

### Endpoint: `/cart.php`

All cart operations require a `user_id` query parameter.

#### Get Cart Items

**GET** `/cart.php?user_id={user_id}`

Retrieves all items in the user's cart.

**Response:**
```json
{
  "cart": [
    {
      "cart_id": "string",
      "product_id": "string",
      "quantity": "number",
      "name": "string",
      "price": "number",
      "image_url": "string"
    }
  ]
}
```

#### Add/Update Cart Item

**POST** `/cart.php?user_id={user_id}`

Adds a new item to cart or updates quantity if item already exists.

**Request Body:**
```json
{
  "product_id": "string",
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true
}
```

#### Remove Cart Item

**DELETE** `/cart.php?user_id={user_id}`

Removes an item from the cart.

**Request Body:**
```json
{
  "product_id": "string"
}
```

**Examples:**
```javascript
// Get cart items
fetch('backend/api/cart.php?user_id=user123')

// Add item to cart
fetch('backend/api/cart.php?user_id=user123', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    product_id: 'prod123',
    quantity: 2
  })
});

// Remove item from cart
fetch('backend/api/cart.php?user_id=user123', {
  method: 'DELETE',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    product_id: 'prod123'
  })
});
```

## Orders API

### Endpoint: `/order.php`

All order operations require a `user_id` query parameter.

#### Create Delivery Information

**POST** `/order.php?user_id={user_id}&action=delivery`

Creates delivery information for an order.

**Request Body:**
```json
{
  "recipient": "string",
  "address": "string",
  "city": "string",
  "phone": "string",
  "zipcode": "string"
}
```

**Response:**
```json
{
  "delivery_id": "number"
}
```

#### Create Transaction Information

**POST** `/order.php?user_id={user_id}&action=transaction`

Creates payment transaction information.

**Request Body:**
```json
{
  "payment_method": "string"
}
```

**Response:**
```json
{
  "trans_id": "number"
}
```

#### Create Order

**POST** `/order.php?user_id={user_id}`

Creates a complete order using cart items, delivery, and transaction information.

**Request Body:**
```json
{
  "delivery_id": "number",
  "trans_id": "number"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "number"
}
```

#### Get Orders List

**GET** `/order.php?user_id={user_id}`

Retrieves all orders for a user.

**Response:**
```json
{
  "orders": [
    {
      "order_id": "string",
      "order_date": "string",
      "total_amount": "number",
      "status": "string"
    }
  ]
}
```

#### Get Order Details

**GET** `/order.php?user_id={user_id}&id={order_id}`

Retrieves detailed information for a specific order.

**Response:**
```json
{
  "order": {
    "order_id": "string",
    "order_date": "string",
    "total_amount": "number",
    "status": "string",
    "delivery_id": "number",
    "trans_id": "number"
  },
  "items": [
    {
      "product_id": "string",
      "quantity": "number",
      "price": "number",
      "name": "string",
      "image_url": "string"
    }
  ]
}
```

**Complete Order Example:**
```javascript
// 1. Create delivery info
const deliveryResponse = await fetch('backend/api/order.php?user_id=user123&action=delivery', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    recipient: 'John Doe',
    address: '123 Main St',
    city: 'New York',
    phone: '+1234567890',
    zipcode: '10001'
  })
});
const {delivery_id} = await deliveryResponse.json();

// 2. Create transaction info
const transResponse = await fetch('backend/api/order.php?user_id=user123&action=transaction', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    payment_method: 'credit_card'
  })
});
const {trans_id} = await transResponse.json();

// 3. Create order
const orderResponse = await fetch('backend/api/order.php?user_id=user123', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    delivery_id,
    trans_id
  })
});
```

## User Management API

### Endpoint: `/user.php`

All user operations require a `user_id` query parameter.

#### Get User Profile

**GET** `/user.php?user_id={user_id}&action=profile`

Retrieves user profile information.

**Response:**
```json
{
  "user": {
    "username": "string",
    "fullname": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "zipcode": "string",
    "birthdate": "string"
  }
}
```

#### Update User Profile

**POST** `/user.php?user_id={user_id}&action=update_profile`

Updates user profile information.

**Request Body:**
```json
{
  "fullname": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "zipcode": "string",
  "birthdate": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

#### Change Password

**POST** `/user.php?user_id={user_id}&action=change_password`

Changes user password.

**Request Body:**
```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

**Examples:**
```javascript
// Get user profile
fetch('backend/api/user.php?user_id=user123&action=profile')

// Update profile
fetch('backend/api/user.php?user_id=user123&action=update_profile', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    fullname: 'John Smith',
    phone: '+1234567890',
    address: '456 Oak St',
    city: 'Boston',
    zipcode: '02101',
    birthdate: '1990-01-01'
  })
});

// Change password
fetch('backend/api/user.php?user_id=user123&action=change_password', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    current_password: 'oldpassword',
    new_password: 'newpassword'
  })
});
```

## Banner API

### Endpoint: `/banner.php`

#### Get All Banners

**GET** `/banner.php`

Retrieves all active banners ordered by sort order.

**Response:**
```json
{
  "banners": [
    {
      "id": "number",
      "image_url": "string",
      "link_url": "string",
      "sort_order": "number",
      "status": "number"
    }
  ]
}
```

#### Get Single Banner

**GET** `/banner.php?id={banner_id}`

Retrieves a specific banner by ID.

**Response:**
```json
{
  "banner": {
    "id": "number",
    "image_url": "string",
    "link_url": "string",
    "sort_order": "number",
    "status": "number"
  }
}
```

#### Create Banner

**POST** `/banner.php`

Creates a new banner.

**Request Body:**
```json
{
  "image_url": "string",
  "link_url": "string",
  "sort_order": "number",
  "status": "number"
}
```

**Response:**
```json
{
  "success": true,
  "id": "number"
}
```

#### Update Banner

**PUT** `/banner.php?id={banner_id}`

Updates an existing banner.

**Request Body:**
```json
{
  "image_url": "string",
  "link_url": "string",
  "sort_order": "number",
  "status": "number"
}
```

#### Delete Banner

**DELETE** `/banner.php?id={banner_id}`

Deletes a banner.

**Response:**
```json
{
  "success": true
}
```

## Gemini Chat API

### Endpoint: `/gemini_chat.php`

#### Send Chat Message

**POST** `/gemini_chat.php`

Sends a message to the Gemini AI chat service for product assistance and recommendations.

**Request Body:**
```json
{
  "message": "string"
}
```

**Response:**
```json
{
  // Gemini API response format
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "string"
          }
        ]
      }
    }
  ]
}
```

**Special Response (Brand Redirect):**
```json
{
  "redirectBrand": "string"
}
```

**Features:**
- Product comparison: Automatically detects product codes (e.g., RB3025) and provides comparisons
- Price range filtering: Understands price queries in USD
- Brand recognition: Recognizes 40+ eyewear brands
- Product recommendations: Provides personalized suggestions
- Smart search redirection: Redirects to product listings when appropriate

**Examples:**
```javascript
// General product inquiry
fetch('backend/api/gemini_chat.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    message: 'What are the best Ray-Ban sunglasses for sports?'
  })
});

// Product comparison
fetch('backend/api/gemini_chat.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    message: 'Compare RB3025 vs RB2132'
  })
});

// Price range query
fetch('backend/api/gemini_chat.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    message: 'Show me Oakley glasses between $100 and $300'
  })
});
```

## Error Handling

All APIs use standard HTTP status codes:

- **200**: Success
- **400**: Bad Request (missing or invalid parameters)
- **401**: Unauthorized (authentication failed)
- **404**: Not Found (resource doesn't exist)
- **405**: Method Not Allowed
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Database Configuration

### Connection Settings
- **Host**: localhost
- **Database**: persol
- **Username**: root
- **Password**: (empty)
- **Charset**: utf8mb4
- **PDO Options**: 
  - Error mode: Exception
  - Fetch mode: Associative array
  - Emulate prepares: false

### Database File Location
- SQL schema: `/database/persol.sql`
- CSV import data: `/database/converted-file.csv`

### Key Tables
- `users`: User accounts and profiles
- `products`: Product catalog
- `categories`: Product categories
- `cart`: Shopping cart items
- `orders`: Order records
- `order_items`: Order line items
- `delivery_info`: Shipping information
- `transaction_info`: Payment information
- `banner`: Homepage banners

## Security Features

1. **Password Hashing**: SHA-256 encryption
2. **SQL Injection Protection**: Prepared statements with PDO
3. **Input Validation**: Required field validation and type checking
4. **CORS Headers**: Proper content-type headers
5. **File Upload Security**: Directory traversal protection
6. **API Key Management**: Secure Gemini API key handling

## Rate Limiting and Performance

- **Pagination**: Default 10 items per page, configurable
- **Search Optimization**: Multi-keyword AND logic
- **Image Handling**: JSON array support for multiple product images
- **Caching**: Browser-side localStorage for user sessions
- **File Organization**: Structured upload directories by product name

## Dependencies

- **PHP**: 7.4+
- **MySQL**: 5.7+
- **PDO**: MySQL driver
- **cURL**: For Gemini API integration
- **JSON**: Built-in PHP support
- **File Upload**: PHP file handling functions

## Configuration Files

- `backend/db/db.php`: Database connection
- `backend/config_gemini.php`: Gemini API configuration (not in git)
- `admin/includes/config.php`: Admin panel configuration