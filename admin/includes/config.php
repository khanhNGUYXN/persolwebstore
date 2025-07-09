<?php
// Kết nối CSDL cho admin
require_once dirname(__DIR__, 2) . '/backend/db/db.php'; // Đường dẫn tuyệt đối từ admin/includes ra gốc project
if (!isset($pdo)) {
    // Nếu không có $pdo từ db.php, tự tạo lại
    $host = 'localhost';
    $db   = 'persol';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        die("Kết nối CSDL thất bại: " . $e->getMessage());
    }
}
session_start(); 