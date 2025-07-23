<?php
require_once 'db.php';

$csvFile = __DIR__ . '/../../database/converted-file.csv';
$handle = fopen($csvFile, 'r');
if (!$handle) die('Không mở được file CSV');

$header = fgetcsv($handle); // Lấy dòng tiêu đề
$count = 0;
while (($row = fgetcsv($handle)) !== false) {
    $data = array_combine($header, $row);

    // Gán category_id theo tên category
    $category = strtolower(trim($data['category']));
    if ($category === 'sunglasses') $category_id = 4;
    elseif ($category === 'prescription eyeglasses') $category_id = 5;
    else $category_id = null;

    // Xử lý images (nếu có nhiều ảnh)
    $images = $data['image_url'];
    if (strpos($images, '[') === 0) {
        $images = trim($images, '[]');
        $imagesArr = array_map('trim', explode(',', $images));
        $imagesJson = json_encode($imagesArr, JSON_UNESCAPED_SLASHES);
    } else {
        $imagesArr = [$images];
        $imagesJson = json_encode($imagesArr, JSON_UNESCAPED_SLASHES);
    }

    // Thêm vào DB
    $stmt = $pdo->prepare("INSERT INTO products (name, brand, category, price, image_url, description, detail_file, images, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'],
        $data['brand'],
        $data['category'],
        $data['price'],
        $data['image_url'],
        $data['description'],
        $data['detail_file'],
        $imagesJson,
        $category_id
    ]);
    $count++;
}
fclose($handle);
echo "Đã import $count sản phẩm!\n"; 