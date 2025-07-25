<?php
header('Content-Type: application/json');
require_once '../db/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($data['product_id'] ?? 0);
    $user_id = $data['user_id'] ?? null;
    $username = $data['username'] ?? null;
    $comment = trim($data['comment'] ?? '');
    if (!$product_id || !$comment) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO product_comments (product_id, user_id, username, comment) VALUES (?, ?, ?, ?)');
    $stmt->execute([$product_id, $user_id, $username, $comment]);
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
    $stmt = $pdo->prepare('SELECT comment_id, user_id, username, comment, created_at FROM product_comments WHERE product_id=? AND is_deleted=0 ORDER BY created_at DESC');
    $stmt->execute([$product_id]);
    $comments = $stmt->fetchAll();
    echo json_encode(['comments' => $comments]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
    $comment_id = intval($data['id'] ?? 0);
    if (!$comment_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing comment_id']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE product_comments SET is_deleted=1 WHERE comment_id=?');
    $stmt->execute([$comment_id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 