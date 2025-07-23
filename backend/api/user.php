<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update_profile') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Cập nhật thông tin cá nhân
    $stmt = $pdo->prepare('UPDATE users SET fullname = ?, phone = ?, address = ?, city = ?, zipcode = ?, birthdate = ? WHERE user_id = ?');
    $stmt->execute([
        $data['fullname'] ?? '',
        $data['phone'] ?? '',
        $data['address'] ?? '',
        $data['city'] ?? '',
        $data['zipcode'] ?? '',
        $data['birthdate'] ?? '',
        $user_id
    ]);
    
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'change_password') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $current_password = $data['current_password'] ?? '';
    $new_password = $data['new_password'] ?? '';
    
    if (!$current_password || !$new_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Vui lòng nhập đầy đủ mật khẩu']);
        exit;
    }
    
    // Kiểm tra mật khẩu hiện tại
    $stmt = $pdo->prepare('SELECT password FROM users WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user || hash('sha256', $current_password) !== $user['password']) {
        http_response_code(400);
        echo json_encode(['error' => 'Mật khẩu hiện tại không đúng']);
        exit;
    }
    
    // Cập nhật mật khẩu mới
    $new_hash = hash('sha256', $new_password);
    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE user_id = ?');
    $stmt->execute([$new_hash, $user_id]);
    
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'profile') {
    // Lấy thông tin profile
    $stmt = $pdo->prepare('SELECT username, fullname, email, phone, address, city, zipcode, birthdate FROM users WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }
    
    echo json_encode(['user' => $user]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 