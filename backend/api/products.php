<?php
header('Content-Type: application/json');
require_once '../db/db.php';

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

if (isset($_GET['category_id'])) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE category_id = ?');
    $stmt->execute([$_GET['category_id']]);
    $products = $stmt->fetchAll();
    foreach ($products as &$product) {
        if (isset($product['images']) && $product['images']) {
            $product['images'] = json_decode($product['images'], true);
        } else {
            $product['images'] = [];
        }
    }
    echo json_encode(['products' => $products]);
    exit;
}

$stmt = $pdo->query('SELECT * FROM products');
$products = $stmt->fetchAll();
foreach ($products as &$product) {
    if (isset($product['images']) && $product['images']) {
        $product['images'] = json_decode($product['images'], true);
    } else {
        $product['images'] = [];
    }
}
echo json_encode(['products' => $products]); 