<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'register') {
    $username = $data['username'] ?? '';
    $fullname = $data['fullname'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $repassword = $data['repassword'] ?? '';
    if (!$username || !$fullname || !$email || !$password || !$repassword) {
        http_response_code(400);
        echo json_encode(['error' => 'Vui lòng nhập đầy đủ thông tin']);
        exit;
    }
    if ($password !== $repassword) {
        http_response_code(400);
        echo json_encode(['error' => 'Mật khẩu nhập lại không khớp']);
        exit;
    }
    // Kiểm tra trùng username/email
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$username, $email]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Username hoặc email đã tồn tại']);
        exit;
    }
    $hash = hash('sha256', $password);
    try {
        $stmt = $pdo->prepare('INSERT INTO users (user_id, username, fullname, email, password) VALUES (?, ?, ?, ?, ?)');
        $user_id = uniqid('u', true);
        $stmt->execute([$user_id, $username, $fullname, $email, $hash]);
        echo json_encode(['success' => true, 'user_id' => $user_id]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Đăng ký thất bại']);
    }
    exit;
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $login = $data['login'] ?? '';
    $password = $data['password'] ?? '';
    if (!$login || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Vui lòng nhập username/email và mật khẩu']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();
    if ($user && hash('sha256', $password) === $user['password']) {
        echo json_encode([
            'success' => true,
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'fullname' => $user['fullname'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Sai thông tin đăng nhập']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 