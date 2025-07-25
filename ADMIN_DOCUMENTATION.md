# PERSOL Webstore - Admin Panel Documentation

## Overview

The PERSOL Webstore Admin Panel provides a comprehensive management interface for administrators to handle products, users, orders, banners, and system analytics. Built with PHP and Bootstrap, it offers a clean, intuitive interface for all administrative tasks.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Admin Authentication](#admin-authentication)
3. [Dashboard](#dashboard)
4. [Product Management](#product-management)
5. [User Management](#user-management)
6. [Order Management](#order-management)
7. [Banner Management](#banner-management)
8. [Category Management](#category-management)
9. [File Upload System](#file-upload-system)
10. [Security Features](#security-features)
11. [Database Operations](#database-operations)

## Architecture Overview

### File Structure
```
admin/
├── includes/
│   ├── header.php         # Common header and navigation
│   ├── footer.php         # Common footer
│   ├── config.php         # Database configuration
│   └── auth.php           # Authentication check
├── dashboard.php          # Main dashboard with statistics
├── products.php           # Product CRUD operations
├── users.php             # User management
├── orders.php            # Order management
├── banner.php            # Banner management
├── categories.php        # Category management
├── comments.php          # Comment management
└── login.php             # Admin login form
```

### Technology Stack
- **PHP 7.4+**: Server-side scripting
- **MySQL**: Database management
- **PDO**: Database abstraction layer
- **Bootstrap 5**: Frontend framework
- **jQuery**: JavaScript library
- **Session Management**: PHP sessions

### Access Control
- Session-based authentication
- Role-based permissions (ADMIN role required)
- CSRF protection on forms
- Input validation and sanitization

## Admin Authentication

### Login System

#### Login Form (`login.php`)
```php
<?php
session_start();
require_once 'includes/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND role = "ADMIN"');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if ($admin && hash('sha256', $password) === $admin['password']) {
        $_SESSION['admin_id'] = $admin['user_id'];
        $_SESSION['admin_username'] = $admin['username'];
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Invalid admin credentials';
    }
}
?>

<!-- HTML Login Form -->
<form method="POST" class="admin-login-form">
    <div class="mb-3">
        <label>Username</label>
        <input type="text" name="username" class="form-control" required>
    </div>
    <div class="mb-3">
        <label>Password</label>
        <input type="password" name="password" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
</form>
```

#### Authentication Check (`includes/auth.php`)
```php
<?php
if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

// Verify admin role from database
$stmt = $pdo->prepare('SELECT role FROM users WHERE user_id = ?');
$stmt->execute([$_SESSION['admin_id']]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'ADMIN') {
    session_destroy();
    header('Location: login.php');
    exit;
}
?>
```

#### Usage in Admin Pages
```php
<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';
// Admin content here
?>
```

## Dashboard

### Overview Statistics (`dashboard.php`)

The dashboard provides comprehensive system statistics and overview information.

#### Key Metrics
```php
<?php
// Total counts
$stmt = $pdo->query("SELECT COUNT(*) FROM products");
$total_products = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'");
$total_users = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM orders");
$total_orders = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status = 'SUCCESS'");
$total_revenue = $stmt->fetchColumn();

// Order statistics by status
$stmt = $pdo->query("SELECT status, COUNT(*) as cnt FROM orders GROUP BY status");
$order_stats = $stmt->fetchAll();

// Monthly revenue (last 12 months)
$monthly = $pdo->query("
    SELECT DATE_FORMAT(order_date, '%Y-%m') as ym, 
           SUM(total_amount) as revenue, 
           COUNT(*) as orders 
    FROM orders 
    WHERE status='SUCCESS' 
    GROUP BY ym 
    ORDER BY ym DESC 
    LIMIT 12
")->fetchAll();

// Top selling products
$top_products = $pdo->query("
    SELECT p.name, SUM(oi.quantity) as qty 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.product_id 
    JOIN orders o ON oi.order_id = o.order_id 
    WHERE o.status = 'SUCCESS' 
    GROUP BY oi.product_id 
    ORDER BY qty DESC 
    LIMIT 5
")->fetchAll();
?>
```

#### Dashboard Display
```php
<!-- Statistics Cards -->
<div class="row g-3">
    <div class="col-md-3">
        <div class="card card-body text-center bg-light">
            Products<br><b><?= $total_products ?></b>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card card-body text-center bg-light">
            Users<br><b><?= $total_users ?></b>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card card-body text-center bg-light">
            Orders<br><b><?= $total_orders ?></b>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card card-body text-center bg-light">
            Revenue<br><b><?= number_format($total_revenue) ?> đ</b>
        </div>
    </div>
</div>

<!-- Order Status Breakdown -->
<h5 class="mt-4">Orders by Status</h5>
<ul>
<?php foreach($order_stats as $row): ?>
    <li><?= $row['status'] ?>: <b><?= $row['cnt'] ?></b></li>
<?php endforeach; ?>
</ul>

<!-- Monthly Revenue Chart Data -->
<div class="card card-body bg-light">
    <h6>Monthly Revenue (Last 12 Months)</h6>
    <ul class="mb-0">
        <?php foreach(array_reverse($monthly) as $m): ?>
            <li><?= $m['ym'] ?>: <b><?= number_format($m['revenue']) ?> đ</b> (<?= $m['orders'] ?> orders)</li>
        <?php endforeach; ?>
    </ul>
</div>
```

## Product Management

### Product CRUD Operations (`products.php`)

#### Add/Edit Product Form
```php
<?php
// Handle form submission
if (isset($_POST['save'])) {
    $fields = ['name', 'brand', 'price', 'image_url', 'description', 'detail_file', 'images'];
    $data = [];
    foreach ($fields as $f) {
        $data[$f] = $_POST[$f] ?? '';
    }
    $category_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : null;

    // Handle multiple image uploads
    $uploadedImages = [];
    if (!empty($_FILES['product_images']['name'][0])) {
        $productName = preg_replace('/[^a-zA-Z0-9-_]/', '_', $_POST['name']);
        $targetDir = __DIR__ . '/../uploads/products/' . $productName . '/';
        
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        foreach ($_FILES['product_images']['tmp_name'] as $idx => $tmpName) {
            if ($_FILES['product_images']['error'][$idx] === 0) {
                $ext = pathinfo($_FILES['product_images']['name'][$idx], PATHINFO_EXTENSION);
                $fileName = uniqid('img_') . '.' . $ext;
                $targetFile = $targetDir . $fileName;
                
                if (move_uploaded_file($tmpName, $targetFile)) {
                    $webPath = 'uploads/products/' . $productName . '/' . $fileName;
                    $uploadedImages[] = $webPath;
                }
            }
        }
    }

    // Merge uploaded images with existing images
    $imagesArr = [];
    if (!empty($data['images'])) {
        $arr = @json_decode($data['images'], true);
        if (is_array($arr)) $imagesArr = $arr;
    }
    $imagesArr = array_merge($imagesArr, $uploadedImages);
    $data['images'] = json_encode($imagesArr, JSON_UNESCAPED_SLASHES);

    if (isset($_POST['id']) && $_POST['id']) {
        // Update existing product
        $sql = "UPDATE products SET name=?, brand=?, price=?, image_url=?, description=?, detail_file=?, images=?, category_id=? WHERE product_id=?";
        $pdo->prepare($sql)->execute([
            $data['name'], $data['brand'], $data['price'], $data['image_url'],
            $data['description'], $data['detail_file'], $data['images'],
            $category_id, $_POST['id']
        ]);
    } else {
        // Create new product
        $sql = "INSERT INTO products (product_id, name, brand, price, image_url, description, detail_file, images, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $product_id = uniqid('prod_');
        $pdo->prepare($sql)->execute([
            $product_id, $data['name'], $data['brand'], $data['price'], $data['image_url'],
            $data['description'], $data['detail_file'], $data['images'], $category_id
        ]);
    }
    
    header('Location: products.php');
    exit;
}

// Handle product deletion
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $pdo->prepare('DELETE FROM products WHERE product_id=?')->execute([$id]);
    header('Location: products.php');
    exit;
}
?>
```

#### Product Listing Table
```php
<!-- Products Table -->
<table class="table table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php
        $stmt = $pdo->query("
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            ORDER BY p.product_id DESC
        ");
        while ($row = $stmt->fetch()):
        ?>
        <tr>
            <td><?= htmlspecialchars($row['product_id']) ?></td>
            <td>
                <?php if ($row['image_url']): ?>
                    <img src="../<?= htmlspecialchars($row['image_url']) ?>" 
                         alt="Product Image" style="width: 50px; height: 50px; object-fit: cover;">
                <?php endif; ?>
            </td>
            <td><?= htmlspecialchars($row['name']) ?></td>
            <td><?= htmlspecialchars($row['brand']) ?></td>
            <td>$<?= number_format($row['price'], 2) ?></td>
            <td><?= htmlspecialchars($row['category_name'] ?? 'N/A') ?></td>
            <td>
                <a href="?edit=<?= $row['product_id'] ?>" class="btn btn-sm btn-primary">Edit</a>
                <a href="?delete=<?= $row['product_id'] ?>" class="btn btn-sm btn-danger" 
                   onclick="return confirm('Delete this product?')">Delete</a>
            </td>
        </tr>
        <?php endwhile; ?>
    </tbody>
</table>
```

#### Product Form
```php
<!-- Product Form -->
<form method="POST" enctype="multipart/form-data" class="row g-3">
    <?php if (isset($edit_product)): ?>
        <input type="hidden" name="id" value="<?= $edit_product['product_id'] ?>">
    <?php endif; ?>
    
    <div class="col-md-6">
        <label>Product Name</label>
        <input type="text" name="name" class="form-control" 
               value="<?= htmlspecialchars($edit_product['name'] ?? '') ?>" required>
    </div>
    
    <div class="col-md-6">
        <label>Brand</label>
        <input type="text" name="brand" class="form-control" 
               value="<?= htmlspecialchars($edit_product['brand'] ?? '') ?>" required>
    </div>
    
    <div class="col-md-6">
        <label>Price ($)</label>
        <input type="number" step="0.01" name="price" class="form-control" 
               value="<?= htmlspecialchars($edit_product['price'] ?? '') ?>" required>
    </div>
    
    <div class="col-md-6">
        <label>Category</label>
        <select name="category_id" class="form-control">
            <option value="">Select Category</option>
            <?php
            $categories = $pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll();
            foreach ($categories as $cat):
            ?>
                <option value="<?= $cat['category_id'] ?>" 
                        <?= ($edit_product['category_id'] ?? '') == $cat['category_id'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars($cat['name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>
    
    <div class="col-12">
        <label>Description</label>
        <textarea name="description" class="form-control" rows="3"><?= htmlspecialchars($edit_product['description'] ?? '') ?></textarea>
    </div>
    
    <div class="col-md-6">
        <label>Main Image URL</label>
        <input type="url" name="image_url" class="form-control" 
               value="<?= htmlspecialchars($edit_product['image_url'] ?? '') ?>">
    </div>
    
    <div class="col-md-6">
        <label>Detail File URL</label>
        <input type="url" name="detail_file" class="form-control" 
               value="<?= htmlspecialchars($edit_product['detail_file'] ?? '') ?>">
    </div>
    
    <div class="col-md-6">
        <label>Additional Images (JSON)</label>
        <textarea name="images" class="form-control" rows="2"><?= htmlspecialchars($edit_product['images'] ?? '') ?></textarea>
        <small class="text-muted">JSON array of image URLs</small>
    </div>
    
    <div class="col-md-6">
        <label>Upload Product Images</label>
        <input type="file" name="product_images[]" class="form-control" multiple accept="image/*">
        <small class="text-muted">Select multiple images to upload</small>
    </div>
    
    <div class="col-12">
        <button type="submit" name="save" class="btn btn-success">
            <?= isset($edit_product) ? 'Update Product' : 'Add Product' ?>
        </button>
        <a href="products.php" class="btn btn-secondary">Cancel</a>
    </div>
</form>
```

## User Management

### User Operations (`users.php`)

#### User Listing and Management
```php
<?php
// Handle user status toggle (lock/unlock)
if (isset($_GET['toggle']) && isset($_GET['status'])) {
    $user_id = $_GET['toggle'];
    $new_status = $_GET['status'] === 'active' ? 'locked' : 'active';
    
    $stmt = $pdo->prepare('UPDATE users SET status = ? WHERE user_id = ?');
    $stmt->execute([$new_status, $user_id]);
    
    header('Location: users.php');
    exit;
}

// Get all users with pagination
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

$stmt = $pdo->prepare("
    SELECT user_id, username, fullname, email, role, status, 
           DATE_FORMAT(created_at, '%Y-%m-%d') as created_date,
           (SELECT COUNT(*) FROM orders WHERE user_id = users.user_id) as order_count
    FROM users 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
");
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->bindValue(2, $offset, PDO::PARAM_INT);
$stmt->execute();
$users = $stmt->fetchAll();

// Get total count for pagination
$total_stmt = $pdo->query("SELECT COUNT(*) FROM users");
$total_users = $total_stmt->fetchColumn();
$total_pages = ceil($total_users / $limit);
?>

<!-- Users Table -->
<table class="table table-striped">
    <thead>
        <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Orders</th>
            <th>Joined</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($users as $user): ?>
        <tr>
            <td><?= htmlspecialchars($user['username']) ?></td>
            <td><?= htmlspecialchars($user['fullname']) ?></td>
            <td><?= htmlspecialchars($user['email']) ?></td>
            <td>
                <span class="badge bg-<?= $user['role'] === 'ADMIN' ? 'danger' : 'primary' ?>">
                    <?= $user['role'] ?>
                </span>
            </td>
            <td>
                <span class="badge bg-<?= $user['status'] === 'active' ? 'success' : 'warning' ?>">
                    <?= ucfirst($user['status'] ?? 'active') ?>
                </span>
            </td>
            <td><?= $user['order_count'] ?></td>
            <td><?= $user['created_date'] ?></td>
            <td>
                <?php if ($user['role'] !== 'ADMIN'): ?>
                    <a href="?toggle=<?= $user['user_id'] ?>&status=<?= $user['status'] ?? 'active' ?>" 
                       class="btn btn-sm btn-<?= ($user['status'] ?? 'active') === 'active' ? 'warning' : 'success' ?>">
                        <?= ($user['status'] ?? 'active') === 'active' ? 'Lock' : 'Unlock' ?>
                    </a>
                <?php endif; ?>
                <a href="?view=<?= $user['user_id'] ?>" class="btn btn-sm btn-info">View</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<!-- Pagination -->
<?php if ($total_pages > 1): ?>
<nav>
    <ul class="pagination">
        <?php for ($i = 1; $i <= $total_pages; $i++): ?>
        <li class="page-item <?= $i === $page ? 'active' : '' ?>">
            <a class="page-link" href="?page=<?= $i ?>"><?= $i ?></a>
        </li>
        <?php endfor; ?>
    </ul>
</nav>
<?php endif; ?>
```

#### User Detail View
```php
<?php
if (isset($_GET['view'])) {
    $user_id = $_GET['view'];
    
    // Get user details
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user_detail = $stmt->fetch();
    
    // Get user's orders
    $stmt = $pdo->prepare("
        SELECT order_id, order_date, total_amount, status 
        FROM orders 
        WHERE user_id = ? 
        ORDER BY order_date DESC 
        LIMIT 10
    ");
    $stmt->execute([$user_id]);
    $user_orders = $stmt->fetchAll();
    
    if ($user_detail):
?>
<!-- User Detail Modal or Section -->
<div class="card">
    <div class="card-header">
        <h5>User Details: <?= htmlspecialchars($user_detail['username']) ?></h5>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-6">
                <p><strong>Full Name:</strong> <?= htmlspecialchars($user_detail['fullname']) ?></p>
                <p><strong>Email:</strong> <?= htmlspecialchars($user_detail['email']) ?></p>
                <p><strong>Phone:</strong> <?= htmlspecialchars($user_detail['phone'] ?? 'N/A') ?></p>
                <p><strong>Role:</strong> <?= htmlspecialchars($user_detail['role']) ?></p>
                <p><strong>Status:</strong> <?= htmlspecialchars($user_detail['status'] ?? 'active') ?></p>
            </div>
            <div class="col-md-6">
                <p><strong>Address:</strong> <?= htmlspecialchars($user_detail['address'] ?? 'N/A') ?></p>
                <p><strong>City:</strong> <?= htmlspecialchars($user_detail['city'] ?? 'N/A') ?></p>
                <p><strong>Zipcode:</strong> <?= htmlspecialchars($user_detail['zipcode'] ?? 'N/A') ?></p>
                <p><strong>Birthdate:</strong> <?= htmlspecialchars($user_detail['birthdate'] ?? 'N/A') ?></p>
            </div>
        </div>
        
        <h6 class="mt-4">Recent Orders</h6>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($user_orders as $order): ?>
                <tr>
                    <td><?= htmlspecialchars($order['order_id']) ?></td>
                    <td><?= htmlspecialchars($order['order_date']) ?></td>
                    <td>$<?= number_format($order['total_amount'], 2) ?></td>
                    <td>
                        <span class="badge bg-<?= $order['status'] === 'SUCCESS' ? 'success' : 'warning' ?>">
                            <?= htmlspecialchars($order['status']) ?>
                        </span>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<?php endif; } ?>
```

## Order Management

### Order Operations (`orders.php`)

#### Order Listing
```php
<?php
// Handle order status update
if (isset($_POST['update_status'])) {
    $order_id = $_POST['order_id'];
    $new_status = $_POST['status'];
    
    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE order_id = ?');
    $stmt->execute([$new_status, $order_id]);
    
    header('Location: orders.php');
    exit;
}

// Get orders with user information
$stmt = $pdo->query("
    SELECT o.*, u.username, u.fullname, u.email,
           (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    ORDER BY o.order_date DESC
");
$orders = $stmt->fetchAll();
?>

<!-- Orders Table -->
<table class="table table-striped">
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($orders as $order): ?>
        <tr>
            <td><?= htmlspecialchars($order['order_id']) ?></td>
            <td>
                <?= htmlspecialchars($order['fullname']) ?><br>
                <small class="text-muted"><?= htmlspecialchars($order['email']) ?></small>
            </td>
            <td><?= date('Y-m-d H:i', strtotime($order['order_date'])) ?></td>
            <td><?= $order['item_count'] ?> items</td>
            <td>$<?= number_format($order['total_amount'], 2) ?></td>
            <td>
                <form method="POST" class="d-inline">
                    <input type="hidden" name="order_id" value="<?= $order['order_id'] ?>">
                    <select name="status" class="form-select form-select-sm" 
                            onchange="this.form.submit()">
                        <option value="PENDING" <?= $order['status'] === 'PENDING' ? 'selected' : '' ?>>Pending</option>
                        <option value="PROCESSING" <?= $order['status'] === 'PROCESSING' ? 'selected' : '' ?>>Processing</option>
                        <option value="SHIPPED" <?= $order['status'] === 'SHIPPED' ? 'selected' : '' ?>>Shipped</option>
                        <option value="SUCCESS" <?= $order['status'] === 'SUCCESS' ? 'selected' : '' ?>>Completed</option>
                        <option value="CANCELLED" <?= $order['status'] === 'CANCELLED' ? 'selected' : '' ?>>Cancelled</option>
                    </select>
                    <input type="hidden" name="update_status" value="1">
                </form>
            </td>
            <td>
                <a href="?view=<?= $order['order_id'] ?>" class="btn btn-sm btn-info">View</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>
```

#### Order Detail View
```php
<?php
if (isset($_GET['view'])) {
    $order_id = $_GET['view'];
    
    // Get order details
    $stmt = $pdo->prepare("
        SELECT o.*, u.username, u.fullname, u.email, u.phone,
               d.recipient, d.address, d.city, d.phone as delivery_phone, d.zipcode,
               t.payment_method, t.content as transaction_content
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        LEFT JOIN delivery_info d ON o.delivery_id = d.id
        LEFT JOIN transaction_info t ON o.trans_id = t.id
        WHERE o.order_id = ?
    ");
    $stmt->execute([$order_id]);
    $order_detail = $stmt->fetch();
    
    // Get order items
    $stmt = $pdo->prepare("
        SELECT oi.*, p.name, p.brand, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$order_id]);
    $order_items = $stmt->fetchAll();
    
    if ($order_detail):
?>
<!-- Order Detail View -->
<div class="card">
    <div class="card-header">
        <h5>Order #<?= htmlspecialchars($order_detail['order_id']) ?></h5>
        <span class="badge bg-<?= $order_detail['status'] === 'SUCCESS' ? 'success' : 'warning' ?>">
            <?= htmlspecialchars($order_detail['status']) ?>
        </span>
    </div>
    <div class="card-body">
        <div class="row">
            <!-- Customer Information -->
            <div class="col-md-4">
                <h6>Customer Information</h6>
                <p><strong>Name:</strong> <?= htmlspecialchars($order_detail['fullname']) ?></p>
                <p><strong>Email:</strong> <?= htmlspecialchars($order_detail['email']) ?></p>
                <p><strong>Phone:</strong> <?= htmlspecialchars($order_detail['phone'] ?? 'N/A') ?></p>
            </div>
            
            <!-- Delivery Information -->
            <div class="col-md-4">
                <h6>Delivery Information</h6>
                <p><strong>Recipient:</strong> <?= htmlspecialchars($order_detail['recipient'] ?? 'N/A') ?></p>
                <p><strong>Address:</strong> <?= htmlspecialchars($order_detail['address'] ?? 'N/A') ?></p>
                <p><strong>City:</strong> <?= htmlspecialchars($order_detail['city'] ?? 'N/A') ?></p>
                <p><strong>Phone:</strong> <?= htmlspecialchars($order_detail['delivery_phone'] ?? 'N/A') ?></p>
                <p><strong>Zipcode:</strong> <?= htmlspecialchars($order_detail['zipcode'] ?? 'N/A') ?></p>
            </div>
            
            <!-- Order Information -->
            <div class="col-md-4">
                <h6>Order Information</h6>
                <p><strong>Date:</strong> <?= date('Y-m-d H:i', strtotime($order_detail['order_date'])) ?></p>
                <p><strong>Payment:</strong> <?= htmlspecialchars($order_detail['payment_method'] ?? 'N/A') ?></p>
                <p><strong>Total:</strong> $<?= number_format($order_detail['total_amount'], 2) ?></p>
            </div>
        </div>
        
        <!-- Order Items -->
        <h6 class="mt-4">Order Items</h6>
        <table class="table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($order_items as $item): ?>
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <?php if ($item['image_url']): ?>
                                <img src="../<?= htmlspecialchars($item['image_url']) ?>" 
                                     alt="Product" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;">
                            <?php endif; ?>
                            <div>
                                <div><?= htmlspecialchars($item['name']) ?></div>
                                <small class="text-muted"><?= htmlspecialchars($item['brand']) ?></small>
                            </div>
                        </div>
                    </td>
                    <td><?= $item['quantity'] ?></td>
                    <td>$<?= number_format($item['price'], 2) ?></td>
                    <td>$<?= number_format($item['price'] * $item['quantity'], 2) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr class="table-dark">
                    <th colspan="3">Total</th>
                    <th>$<?= number_format($order_detail['total_amount'], 2) ?></th>
                </tr>
            </tfoot>
        </table>
    </div>
</div>
<?php endif; } ?>
```

## Banner Management

### Banner Operations (`banner.php`)

#### Banner CRUD
```php
<?php
// Handle banner operations
if (isset($_POST['save_banner'])) {
    $image_url = $_POST['image_url'] ?? '';
    $link_url = $_POST['link_url'] ?? '';
    $sort_order = intval($_POST['sort_order'] ?? 0);
    $status = intval($_POST['status'] ?? 1);
    
    // Handle image upload
    if (!empty($_FILES['banner_image']['name'])) {
        $targetDir = __DIR__ . '/../uploads/banner/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        $ext = pathinfo($_FILES['banner_image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid('banner_') . '.' . $ext;
        $targetFile = $targetDir . $fileName;
        
        if (move_uploaded_file($_FILES['banner_image']['tmp_name'], $targetFile)) {
            $image_url = 'uploads/banner/' . $fileName;
        }
    }
    
    if (isset($_POST['banner_id']) && $_POST['banner_id']) {
        // Update banner
        $stmt = $pdo->prepare('UPDATE banner SET image_url=?, link_url=?, sort_order=?, status=? WHERE id=?');
        $stmt->execute([$image_url, $link_url, $sort_order, $status, $_POST['banner_id']]);
    } else {
        // Create banner
        $stmt = $pdo->prepare('INSERT INTO banner (image_url, link_url, sort_order, status) VALUES (?, ?, ?, ?)');
        $stmt->execute([$image_url, $link_url, $sort_order, $status]);
    }
    
    header('Location: banner.php');
    exit;
}

// Handle banner deletion
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $pdo->prepare('DELETE FROM banner WHERE id=?')->execute([$id]);
    header('Location: banner.php');
    exit;
}

// Get all banners
$banners = $pdo->query('SELECT * FROM banner ORDER BY sort_order ASC, id DESC')->fetchAll();
?>

<!-- Banner Form -->
<form method="POST" enctype="multipart/form-data" class="row g-3">
    <?php if (isset($edit_banner)): ?>
        <input type="hidden" name="banner_id" value="<?= $edit_banner['id'] ?>">
    <?php endif; ?>
    
    <div class="col-md-6">
        <label>Image URL</label>
        <input type="url" name="image_url" class="form-control" 
               value="<?= htmlspecialchars($edit_banner['image_url'] ?? '') ?>">
    </div>
    
    <div class="col-md-6">
        <label>Upload Banner Image</label>
        <input type="file" name="banner_image" class="form-control" accept="image/*">
    </div>
    
    <div class="col-md-6">
        <label>Link URL</label>
        <input type="url" name="link_url" class="form-control" 
               value="<?= htmlspecialchars($edit_banner['link_url'] ?? '') ?>">
    </div>
    
    <div class="col-md-3">
        <label>Sort Order</label>
        <input type="number" name="sort_order" class="form-control" 
               value="<?= htmlspecialchars($edit_banner['sort_order'] ?? '0') ?>">
    </div>
    
    <div class="col-md-3">
        <label>Status</label>
        <select name="status" class="form-control">
            <option value="1" <?= ($edit_banner['status'] ?? 1) == 1 ? 'selected' : '' ?>>Active</option>
            <option value="0" <?= ($edit_banner['status'] ?? 1) == 0 ? 'selected' : '' ?>>Inactive</option>
        </select>
    </div>
    
    <div class="col-12">
        <button type="submit" name="save_banner" class="btn btn-success">
            <?= isset($edit_banner) ? 'Update Banner' : 'Add Banner' ?>
        </button>
        <a href="banner.php" class="btn btn-secondary">Cancel</a>
    </div>
</form>

<!-- Banners Table -->
<table class="table table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Link URL</th>
            <th>Sort Order</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($banners as $banner): ?>
        <tr>
            <td><?= $banner['id'] ?></td>
            <td>
                <?php if ($banner['image_url']): ?>
                    <img src="../<?= htmlspecialchars($banner['image_url']) ?>" 
                         alt="Banner" style="width: 100px; height: 50px; object-fit: cover;">
                <?php endif; ?>
            </td>
            <td>
                <?php if ($banner['link_url']): ?>
                    <a href="<?= htmlspecialchars($banner['link_url']) ?>" target="_blank">
                        <?= htmlspecialchars(substr($banner['link_url'], 0, 50)) ?>...
                    </a>
                <?php else: ?>
                    N/A
                <?php endif; ?>
            </td>
            <td><?= $banner['sort_order'] ?></td>
            <td>
                <span class="badge bg-<?= $banner['status'] ? 'success' : 'secondary' ?>">
                    <?= $banner['status'] ? 'Active' : 'Inactive' ?>
                </span>
            </td>
            <td>
                <a href="?edit=<?= $banner['id'] ?>" class="btn btn-sm btn-primary">Edit</a>
                <a href="?delete=<?= $banner['id'] ?>" class="btn btn-sm btn-danger" 
                   onclick="return confirm('Delete this banner?')">Delete</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>
```

## File Upload System

### Image Upload Utilities
```php
<?php
class ImageUploadHandler {
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $maxFileSize = 5 * 1024 * 1024; // 5MB
    
    public function uploadImage($file, $targetDir, $prefix = 'img_') {
        // Validate file
        if (!$this->validateFile($file)) {
            return false;
        }
        
        // Create directory if not exists
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        // Generate unique filename
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid($prefix) . '.' . $ext;
        $targetFile = $targetDir . $fileName;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            return $fileName;
        }
        
        return false;
    }
    
    private function validateFile($file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return false;
        }
        
        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $this->allowedTypes)) {
            return false;
        }
        
        return true;
    }
    
    public function deleteImage($imagePath) {
        if (file_exists($imagePath) && is_file($imagePath)) {
            return unlink($imagePath);
        }
        return false;
    }
}

// Usage example
$uploader = new ImageUploadHandler();
$fileName = $uploader->uploadImage($_FILES['image'], '../uploads/products/', 'product_');
if ($fileName) {
    $imagePath = 'uploads/products/' . $fileName;
    // Save $imagePath to database
}
?>
```

## Security Features

### CSRF Protection
```php
<?php
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Usage in forms
?>
<input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">

<?php
// Validate on form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
        die('CSRF token validation failed');
    }
    // Process form
}
?>
```

### Input Sanitization
```php
<?php
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function sanitizeArray($array) {
    return array_map('sanitizeInput', $array);
}

// Usage
$cleanData = sanitizeArray($_POST);
$safeText = sanitizeInput($_POST['text']);
?>
```

### SQL Injection Prevention
```php
<?php
// Always use prepared statements
$stmt = $pdo->prepare('SELECT * FROM products WHERE name LIKE ?');
$stmt->execute(['%' . $searchTerm . '%']);

// Never use string concatenation for SQL
// BAD: "SELECT * FROM users WHERE id = " . $_GET['id']
// GOOD: Use prepared statements as shown above
?>
```

## Database Operations

### Common Database Patterns
```php
<?php
// Pagination helper
function getPaginatedResults($pdo, $table, $page = 1, $limit = 20, $where = '', $params = []) {
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $countSql = "SELECT COUNT(*) FROM $table" . ($where ? " WHERE $where" : "");
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // Get paginated results
    $sql = "SELECT * FROM $table" . ($where ? " WHERE $where" : "") . " LIMIT ? OFFSET ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $results = $stmt->fetchAll();
    
    return [
        'data' => $results,
        'total' => $total,
        'pages' => ceil($total / $limit),
        'current_page' => $page
    ];
}

// Search helper
function searchTable($pdo, $table, $columns, $searchTerm, $page = 1, $limit = 20) {
    $whereClauses = array_map(function($col) { return "$col LIKE ?"; }, $columns);
    $where = implode(' OR ', $whereClauses);
    $params = array_fill(0, count($columns), '%' . $searchTerm . '%');
    
    return getPaginatedResults($pdo, $table, $page, $limit, $where, $params);
}

// Usage examples
$products = getPaginatedResults($pdo, 'products', 1, 20);
$searchResults = searchTable($pdo, 'products', ['name', 'brand', 'description'], 'Ray-Ban');
?>
```

### Logging System
```php
<?php
function logAdminAction($pdo, $admin_id, $action, $details = '') {
    $stmt = $pdo->prepare('INSERT INTO admin_logs (admin_id, action, details, timestamp) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$admin_id, $action, $details]);
}

// Usage
logAdminAction($pdo, $_SESSION['admin_id'], 'PRODUCT_CREATED', "Created product: " . $product_name);
logAdminAction($pdo, $_SESSION['admin_id'], 'USER_LOCKED', "Locked user: " . $username);
?>
```

## Performance Optimization

### Caching Strategies
```php
<?php
// Simple file-based cache
class SimpleCache {
    private $cacheDir;
    
    public function __construct($cacheDir = '../cache/') {
        $this->cacheDir = $cacheDir;
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0777, true);
        }
    }
    
    public function get($key) {
        $file = $this->cacheDir . md5($key) . '.cache';
        if (file_exists($file) && (time() - filemtime($file)) < 3600) { // 1 hour cache
            return unserialize(file_get_contents($file));
        }
        return null;
    }
    
    public function set($key, $data) {
        $file = $this->cacheDir . md5($key) . '.cache';
        file_put_contents($file, serialize($data));
    }
}

// Usage
$cache = new SimpleCache();
$products = $cache->get('all_products');
if ($products === null) {
    $products = $pdo->query('SELECT * FROM products')->fetchAll();
    $cache->set('all_products', $products);
}
?>
```

This comprehensive admin documentation covers all the major components and functionality of the PERSOL Webstore admin panel, providing administrators with the tools they need to effectively manage the e-commerce platform.