<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
$offset = ($page - 1) * $limit;

if (isset($_GET['id'])) {
    $ids = explode(',', $_GET['id']);
    $in = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare('SELECT * FROM products WHERE product_id IN (' . $in . ')');
    $stmt->execute($ids);
    $products = $stmt->fetchAll();
    foreach ($products as &$product) {
        if (isset($product['images']) && $product['images']) {
            $product['images'] = json_decode($product['images'], true);
        } else {
            $product['images'] = [];
        }
    }
    // Nếu chỉ có 1 sản phẩm, trả về object thay vì mảng
    if (count($products) === 1) {
        echo json_encode(['product' => $products[0]]);
    } else {
        echo json_encode(['product' => $products]);
    }
    exit;
}

$where = '';
$params = [];

// Xử lý tìm kiếm nâng cao: tách từ khóa, tìm tất cả từ (AND)
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $keywords = preg_split('/\s+/', trim($_GET['search']));
    $whereParts = [];
    foreach ($keywords as $kw) {
        $whereParts[] = 'name LIKE ?';
        $params[] = '%' . $kw . '%';
    }
    $where = 'WHERE ' . implode(' AND ', $whereParts);
}

// Xử lý filter theo category
if (isset($_GET['category_id'])) {
    if ($where) {
        $where .= ' AND category_id = ?';
    } else {
        $where = 'WHERE category_id = ?';
    }
    $params[] = $_GET['category_id'];
}

// Thêm filter theo price_min và price_max
if (isset($_GET['price_min']) && is_numeric($_GET['price_min'])) {
    if ($where) {
        $where .= ' AND price >= ?';
    } else {
        $where = 'WHERE price >= ?';
    }
    $params[] = $_GET['price_min'];
}
if (isset($_GET['price_max']) && is_numeric($_GET['price_max'])) {
    if ($where) {
        $where .= ' AND price <= ?';
    } else {
        $where = 'WHERE price <= ?';
    }
    $params[] = $_GET['price_max'];
}

// Đếm tổng số sản phẩm
if ($where) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM products $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    $stmt = $pdo->prepare("SELECT * FROM products $where ORDER BY product_id DESC LIMIT ? OFFSET ?");
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
} else {
    $stmt = $pdo->query('SELECT COUNT(*) FROM products');
    $total = $stmt->fetchColumn();
    $stmt = $pdo->prepare('SELECT * FROM products ORDER BY product_id DESC LIMIT ? OFFSET ?');
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();
}
$products = $stmt->fetchAll();
foreach ($products as &$product) {
    if (isset($product['images']) && $product['images']) {
        $product['images'] = json_decode($product['images'], true);
    } else {
        $product['images'] = [];
    }
}
$total_pages = ceil($total / $limit);

echo json_encode([
    'success' => true,
    'products' => $products, 
    'total' => $total, 
    'total_pages' => $total_pages,
    'page' => $page, 
    'limit' => $limit
]); 