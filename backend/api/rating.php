<?php
header('Content-Type: application/json');
require_once '../db/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($data['product_id'] ?? 0);
    $user_id = $data['user_id'] ?? null;
    $rating = intval($data['rating'] ?? 0);
    if (!$product_id || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }
    // Nếu user đã vote thì update, chưa thì insert
    $stmt = $pdo->prepare('SELECT rating_id FROM product_ratings WHERE product_id=? AND user_id=?');
    $stmt->execute([$product_id, $user_id]);
    $exist = $stmt->fetch();
    if ($exist) {
        $stmt = $pdo->prepare('UPDATE product_ratings SET rating=? WHERE rating_id=?');
        $stmt->execute([$rating, $exist['rating_id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO product_ratings (product_id, user_id, rating) VALUES (?, ?, ?)');
        $stmt->execute([$product_id, $user_id, $rating]);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $product_id = intval($_GET['product_id'] ?? 0);
    if (!$product_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product_id']);
        exit;
    }
    // Lấy danh sách vote
    $stmt = $pdo->prepare('SELECT rating, user_id, created_at FROM product_ratings WHERE product_id=?');
    $stmt->execute([$product_id]);
    $ratings = $stmt->fetchAll();
    // Tính điểm trung bình
    $stmt2 = $pdo->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM product_ratings WHERE product_id=?');
    $stmt2->execute([$product_id]);
    $stat = $stmt2->fetch();
    echo json_encode([
        'ratings' => $ratings,
        'avg_rating' => round(floatval($stat['avg_rating']),2),
        'total' => intval($stat['total'])
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 