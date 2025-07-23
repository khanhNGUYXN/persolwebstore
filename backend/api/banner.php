<?php
header('Content-Type: application/json');
require_once '../db/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Lấy danh sách banner hoặc 1 banner
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('SELECT * FROM banner WHERE id = ?');
            $stmt->execute([$_GET['id']]);
            $banner = $stmt->fetch();
            if ($banner) {
                echo json_encode(['banner' => $banner]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Banner not found']);
            }
        } else {
            $stmt = $pdo->query('SELECT * FROM banner WHERE status = 1 ORDER BY sort_order ASC, id DESC');
            $banners = $stmt->fetchAll();
            echo json_encode(['banners' => $banners]);
        }
        break;
    case 'POST':
        // Thêm mới banner
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['image_url'])) {
            http_response_code(400);
            echo json_encode(['error' => 'image_url is required']);
            exit;
        }
        $stmt = $pdo->prepare('INSERT INTO banner (image_url, link_url, sort_order, status) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['image_url'],
            $data['link_url'] ?? null,
            $data['sort_order'] ?? 0,
            $data['status'] ?? 1
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;
    case 'PUT':
        // Sửa banner
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'id is required']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        $params = [];
        foreach (['image_url', 'link_url', 'sort_order', 'status'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        $params[] = $_GET['id'];
        $sql = 'UPDATE banner SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        // Xóa banner
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'id is required']);
            exit;
        }
        $stmt = $pdo->prepare('DELETE FROM banner WHERE id = ?');
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
} 