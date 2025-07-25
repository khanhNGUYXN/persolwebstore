<?php
header('Content-Type: application/json');
require_once '../config_gemini.php';
require_once '../db/db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['message']) || !$data['message']) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing message']);
    exit;
}

$userQuestion = $data['message'];
$productsToCompare = [];
// Tìm tên/mã sản phẩm dạng "Ray-Ban RBxxxx" hoặc "RBxxxx"
if (preg_match_all('/([A-Za-z0-9\- ]*RB\d{3,}[A-Za-z0-9\- ]*)/i', $userQuestion, $matches)) {
    $productsToCompare = array_map('trim', $matches[1]);
    $productsToCompare = array_filter($productsToCompare, function($v) { return strlen($v) > 3; });
    $productsToCompare = array_unique($productsToCompare);
}

$prompt = $userQuestion;
if (count($productsToCompare) >= 2) {
    // Lấy tối đa 2 sản phẩm đầu tiên
    $productsToCompare = array_slice($productsToCompare, 0, 2);
    $placeholders = implode(',', array_fill(0, count($productsToCompare), '?'));
    $stmt = $pdo->prepare("SELECT name, brand, price, description FROM products WHERE name IN ($placeholders)");
    $stmt->execute($productsToCompare);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($products) === 2) {
        $info = "Thông tin 2 sản phẩm để so sánh:\n";
        foreach ($products as $p) {
            $info .= "Tên: {$p['name']}\nThương hiệu: {$p['brand']}\nGiá: " . number_format($p['price']) . "đ\nMô tả: {$p['description']}\n---\n";
        }
        $prompt = $info . "\nNgười dùng hỏi: $userQuestion\nHãy so sánh 2 sản phẩm trên về giá, tính năng, ưu nhược điểm nếu có.";
    }
}

// Lấy danh sách brand từ DB hoặc hardcode (luôn đặt trước khi dùng)
$brands = ['Ray-Ban', 'Dolce', 'Gucci', 'Tom Ford', 'Versace', 'Prada', 'Burberry', 'Chanel', 'Armani', 'Smith', 'Bebe', 'Dragon', 'Converse', 'DKNY', 'Furla', 'Tory Burch', 'Michael Kors', 'Oakley', 'Vogue', 'Costa', 'Modo', 'Emporio Armani', 'Ralph Lauren', 'Lulu Guinness', 'Zeal', 'Badgley', 'Flexon', 'Chopard', 'Swarovski', 'Guess', 'XXL', 'Easyclip', 'Marc Jacobs', 'Skechers', 'Nike', 'Chesterfield', 'Liz Claiborne', 'Kate Spade', 'Via Spiga'];
// Nhận diện câu hỏi về phân khúc giá USD và brand
$priceMin = null;
$priceMax = null;
$brandFilter = null;
foreach ($brands as $b) {
    if (stripos($userQuestion, $b) !== false) {
        $brandFilter = $b;
        break;
    }
}
// Ưu tiên nhận diện khoảng giá trước
if (preg_match('/(từ|giá từ|trong khoảng|between)?\s*(\d+)[\s\.,]?(usd|đô|dollar|\$)?\s*(đến|to|\-|–|—)\s*(\d+)[\s\.,]?(usd|đô|dollar|\$)?/iu', $userQuestion, $m)) {
    $priceMin = (int)$m[2];
    $priceMax = (int)$m[5];
} elseif (preg_match('/(giá|sản phẩm)?\s*(nhỏ hơn|dưới|ít hơn|<)\s*(\d+)[\s\.,]?(usd|đô|dollar|\$)?/iu', $userQuestion, $m)) {
    $priceMax = (int)$m[3];
} elseif (preg_match('/(giá|sản phẩm)?\s*(lớn hơn|trên|nhiều hơn|>|>=)\s*(\d+)[\s\.,]?(usd|đô|dollar|\$)?/iu', $userQuestion, $m)) {
    $priceMin = (int)$m[3];
}
// Nếu có filter giá và/hoặc brand, trả về danh sách sản phẩm phù hợp (tối đa 10)
if ($priceMin !== null || $priceMax !== null || $brandFilter) {
    $sql = 'SELECT name, brand, price FROM products WHERE 1';
    $params = [];
    if ($brandFilter) {
        $sql .= ' AND brand LIKE ?';
        $params[] = '%' . $brandFilter . '%';
    }
    if ($priceMin !== null) {
        $sql .= ' AND price >= ?';
        $params[] = $priceMin;
    }
    if ($priceMax !== null) {
        $sql .= ' AND price <= ?';
        $params[] = $priceMax;
    }
    $sql .= ' ORDER BY price ASC LIMIT 10';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($products && count($products)) {
        $list = "Danh sách sản phẩm phù hợp:\n";
        foreach ($products as $p) {
            $list .= "Tên: {$p['name']} | Brand: {$p['brand']} | Giá: $" . number_format($p['price'],2) . "\n";
        }
        $prompt = $list . "\nNgười dùng hỏi: $userQuestion\nHãy trả lời dựa trên danh sách trên.";
    } else {
        $prompt = "Không tìm thấy sản phẩm nào phù hợp với phân khúc giá và thương hiệu yêu cầu.\nNgười dùng hỏi: $userQuestion";
    }
}

// Lấy danh sách brand từ DB hoặc hardcode
$brands = ['Ray-Ban', 'Dolce', 'Gucci', 'Tom Ford', 'Versace', 'Prada', 'Burberry', 'Chanel', 'Armani', 'Smith', 'Bebe', 'Dragon', 'Converse', 'DKNY', 'Furla', 'Tory Burch', 'Michael Kors', 'Oakley', 'Vogue', 'Costa', 'Modo', 'Emporio Armani', 'Ralph Lauren', 'Lulu Guinness', 'Zeal', 'Badgley', 'Flexon', 'Chopard', 'Swarovski', 'Guess', 'XXL', 'Easyclip', 'Marc Jacobs', 'Skechers', 'Nike', 'Chesterfield', 'Liz Claiborne', 'Kate Spade', 'Via Spiga'];
$redirectBrand = null;
foreach ($brands as $b) {
    if (stripos($userQuestion, $b) !== false) {
        $redirectBrand = $b;
        break;
    }
}
// Nếu chỉ hỏi về tìm sản phẩm theo brand, trả về redirectBrand
if ($redirectBrand && preg_match('/(tìm|có|liệt kê|show|xem|sản phẩm|kính|glasses).*' . preg_quote($redirectBrand, '/') . '/i', $userQuestion)) {
    echo json_encode(['redirectBrand' => $redirectBrand]);
    exit;
}

$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $prompt]
            ]
        ]
    ]
];

$ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . GEMINI_API_KEY);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
$response = curl_exec($ch);

if ($response === false) {
    $error = curl_error($ch);
    http_response_code(500);
    echo json_encode(['error' => 'Curl error', 'detail' => $error]);
    curl_close($ch);
    exit;
}

$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Nếu mã lỗi không phải 2xx thì trả về cả response để debug
if ($httpcode < 200 || $httpcode >= 300) {
    http_response_code($httpcode);
    echo json_encode(['error' => 'API error', 'status' => $httpcode, 'response' => $response]);
    exit;
}

http_response_code($httpcode);
echo $response; 