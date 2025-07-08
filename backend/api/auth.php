<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'register') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit;
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $stmt = $pdo->prepare('INSERT INTO users (user_id, email, password) VALUES (?, ?, ?)');
        $user_id = uniqid('u', true);
        $stmt->execute([$user_id, $email, $hash]);
        echo json_encode(['success' => true, 'user_id' => $user_id]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
    }
    exit;
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password'])) {
        echo json_encode(['success' => true, 'user_id' => $user['user_id'], 'role' => $user['role']]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 