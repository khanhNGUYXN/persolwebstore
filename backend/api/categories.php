<?php
header('Content-Type: application/json');
require_once '../db/db.php';
$stmt = $pdo->query('SELECT category_id, name, parent_id FROM categories ORDER BY name');
$categories = $stmt->fetchAll();
echo json_encode(['categories' => $categories]); 