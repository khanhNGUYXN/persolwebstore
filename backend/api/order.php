<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delivery') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO delivery_info (user_id, recipient, address, city, phone, zipcode) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$user_id, $data['recipient'], $data['address'], $data['city'], $data['phone'], $data['zipcode']]);
    $delivery_id = $pdo->lastInsertId();
    echo json_encode(['delivery_id' => $delivery_id]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'transaction') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO transaction_info (user_id, payment_method, content, dates) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$user_id, $data['payment_method'], '']);
    $trans_id = $pdo->lastInsertId();
    echo json_encode(['trans_id' => $trans_id]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $delivery_id = $data['delivery_id'] ?? null;
    $trans_id = $data['trans_id'] ?? null;
    if (!$delivery_id || !$trans_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing delivery or transaction info']);
        exit;
    }
    // Lấy giỏ hàng
    $stmt = $pdo->prepare('SELECT * FROM cart WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $cart = $stmt->fetchAll();
    if (!$cart) {
        http_response_code(400);
        echo json_encode(['error' => 'Cart is empty']);
        exit;
    }
    // Tính tổng tiền
    $total = 0;
    foreach ($cart as $item) {
        $pstmt = $pdo->prepare('SELECT price FROM products WHERE product_id = ?');
        $pstmt->execute([$item['product_id']]);
        $price = $pstmt->fetchColumn();
        $total += $price * $item['quantity'];
    }
    // Tạo đơn hàng
    $stmt = $pdo->prepare('INSERT INTO orders (user_id, order_date, total_amount, status, delivery_id, trans_id) VALUES (?, NOW(), ?, "PENDING", ?, ?)');
    $stmt->execute([$user_id, $total, $delivery_id, $trans_id]);
    $order_id = $pdo->lastInsertId();
    // Thêm sản phẩm vào order_items
    foreach ($cart as $item) {
        $pstmt = $pdo->prepare('SELECT price FROM products WHERE product_id = ?');
        $pstmt->execute([$item['product_id']]);
        $price = $pstmt->fetchColumn();
        $stmt2 = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        $stmt2->execute([$order_id, $item['product_id'], $item['quantity'], $price]);
    }
    // Xóa giỏ hàng
    $stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
    $stmt->execute([$user_id]);
    echo json_encode(['success' => true, 'order_id' => $order_id]);
    exit;
}



if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Chi tiết đơn hàng
        $order_id = $_GET['id'];
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE order_id = ? AND user_id = ?');
        $stmt->execute([$order_id, $user_id]);
        $order = $stmt->fetch();
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            exit;
        }
        $stmt = $pdo->prepare('SELECT oi.*, p.name, p.image_url, p.images FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = ?');
        $stmt->execute([$order_id]);
        $items = $stmt->fetchAll();
        // Ưu tiên images nếu image_url rỗng hoặc không hợp lệ
        foreach ($items as &$item) {
            if ((empty($item['image_url']) || $item['image_url'] === '[]') && !empty($item['images'])) {
                $item['image_url'] = $item['images'];
            }
        }
        echo json_encode(['order' => $order, 'items' => $items]);
        exit;
    } else {
        // Danh sách đơn hàng
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC');
        $stmt->execute([$user_id]);
        echo json_encode(['orders' => $stmt->fetchAll()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 