<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
$offset = ($page - 1) * $limit;

if (isset($_GET['id'])) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE product_id = ?');
    $stmt->execute([$_GET['id']]);
    $product = $stmt->fetch();
    if ($product) {
        if (isset($product['images']) && $product['images']) {
            $product['images'] = json_decode($product['images'], true);
        } else {
            $product['images'] = [];
        }
        echo json_encode(['product' => $product]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
    }
    exit;
}

$where = '';
$params = [];

// Xử lý tìm kiếm
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $search = '%' . $_GET['search'] . '%';
    $where = 'WHERE product_name LIKE ?';
    $params[] = $search;
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