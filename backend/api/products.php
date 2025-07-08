<?php
header('Content-Type: application/json');
require_once '../db/db.php';

if (isset($_GET['id'])) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE product_id = ?');
    $stmt->execute([$_GET['id']]);
    $product = $stmt->fetch();
    if ($product) {
        echo json_encode(['product' => $product]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
    }
    exit;
}

$stmt = $pdo->query('SELECT * FROM products');
$products = $stmt->fetchAll();
echo json_encode(['products' => $products]); 