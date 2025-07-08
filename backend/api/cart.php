<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $stmt = $pdo->prepare('SELECT c.cart_id, c.product_id, c.quantity, p.name, p.price, p.image_url FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.user_id = ?');
        $stmt->execute([$user_id]);
        echo json_encode(['cart' => $stmt->fetchAll()]);
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $product_id = $data['product_id'] ?? null;
        $quantity = $data['quantity'] ?? 1;
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product_id']);
            exit;
        }
        // Check if exists
        $stmt = $pdo->prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$user_id, $product_id]);
        if ($stmt->fetch()) {
            $stmt = $pdo->prepare('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?');
            $stmt->execute([$quantity, $user_id, $product_id]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)');
            $stmt->execute([$user_id, $product_id, $quantity]);
        }
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $product_id = $data['product_id'] ?? null;
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product_id']);
            exit;
        }
        $stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$user_id, $product_id]);
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
} 