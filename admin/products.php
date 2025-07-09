<?php include 'includes/header.php';
?>
<h3>Quản lý sản phẩm</h3>
<p class="text-muted">Thêm, sửa, xóa sản phẩm. Có thể nhập nhiều ảnh (dạng JSON), mô tả, file chi tiết. Nhấn "Thêm sản phẩm" để tạo mới hoặc "Sửa" để chỉnh thông tin sản phẩm.</p>
<?php
// Xử lý thêm/sửa/xóa sản phẩm
if(isset($_GET['delete'])) {
  $id = intval($_GET['delete']);
  $pdo->prepare('DELETE FROM products WHERE product_id=?')->execute([$id]);
  header('Location: products.php'); exit;
}
if(isset($_POST['save'])) {
  $fields = ['name','brand','category','price','image_url','description','detail_file','images'];
  $data = [];
  foreach($fields as $f) $data[$f] = $_POST[$f] ?? '';
  if(isset($_POST['id']) && $_POST['id']) {
    // Sửa
    $sql = "UPDATE products SET name=?, brand=?, category=?, price=?, image_url=?, description=?, detail_file=?, images=? WHERE product_id=?";
    $pdo->prepare($sql)->execute([$data['name'],$data['brand'],$data['category'],$data['price'],$data['image_url'],$data['description'],$data['detail_file'],$data['images'],$_POST['id']]);
  } else {
    // Thêm
    $sql = "INSERT INTO products (name, brand, category, price, image_url, description, detail_file, images) VALUES (?,?,?,?,?,?,?,?)";
    $pdo->prepare($sql)->execute([$data['name'],$data['brand'],$data['category'],$data['price'],$data['image_url'],$data['description'],$data['detail_file'],$data['images']]);
  }
  header('Location: products.php'); exit;
}
// Phân trang
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = 10;
$offset = ($page-1)*$limit;
$total = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
$stmt = $pdo->prepare('SELECT * FROM products ORDER BY product_id DESC LIMIT ? OFFSET ?');
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->bindValue(2, $offset, PDO::PARAM_INT);
$stmt->execute();
$products = $stmt->fetchAll();
// Lấy dữ liệu khi sửa
$edit = null;
if(isset($_GET['edit'])) {
  $stmt = $pdo->prepare('SELECT * FROM products WHERE product_id=?');
  $stmt->execute([$_GET['edit']]);
  $edit = $stmt->fetch();
}
// Lấy danh sách categories để render dropdown
$cat_stmt = $pdo->query('SELECT * FROM categories ORDER BY name');
$categories = $cat_stmt->fetchAll();
function buildCatTree($cats, $parent = null) {
  $tree = [];
  foreach ($cats as $c) {
    if ($c['parent_id'] == $parent) {
      $children = buildCatTree($cats, $c['category_id']);
      if ($children) $c['children'] = $children;
      $tree[] = $c;
    }
  }
  return $tree;
}
$catTree = buildCatTree($categories);
function renderCatOptions($cats, $level = 0, $selected = null) {
  foreach ($cats as $c) {
    echo '<option value="'.$c['category_id'].'"'.($selected==$c['category_id']?' selected':'').'>'.str_repeat('--', $level).' '.$c['name'].'</option>';
    if (!empty($c['children'])) renderCatOptions($c['children'], $level+1, $selected);
  }
}
?>
<a href="?add=1" class="btn btn-success mb-3">Thêm sản phẩm</a>
<?php if(isset($_GET['add']) || $edit): ?>
<form method="post" class="mb-4">
  <input type="hidden" name="id" value="<?= $edit['product_id'] ?? '' ?>">
  <div class="row g-2">
    <div class="col-md-4 mb-2">
      <input class="form-control" name="name" placeholder="Tên sản phẩm" value="<?= $edit['name'] ?? '' ?>" required>
      <small class="form-text text-muted">Nhập tên sản phẩm đầy đủ, ví dụ: Ray-Ban Aviator Classic</small>
    </div>
    <div class="col-md-2 mb-2">
      <input class="form-control" name="brand" placeholder="Thương hiệu" value="<?= $edit['brand'] ?? '' ?>">
      <small class="form-text text-muted">Ví dụ: Ray-Ban, Oakley, Acuvue...</small>
    </div>
    <div class="col-md-2 mb-2">
      <select class="form-select" name="category_id">
        <option value="">-- Chọn danh mục --</option>
        <?php renderCatOptions($catTree, 0, $edit['category_id'] ?? null); ?>
      </select>
      <small class="form-text text-muted">Chọn danh mục sản phẩm</small>
    </div>
    <div class="col-md-2 mb-2">
      <input class="form-control" name="price" type="number" placeholder="Giá" value="<?= $edit['price'] ?? '' ?>">
      <small class="form-text text-muted">Nhập giá sản phẩm (VNĐ)</small>
    </div>
    <div class="col-md-2 mb-2">
      <input class="form-control" name="image_url" placeholder="Ảnh đại diện (URL)" value="<?= $edit['image_url'] ?? '' ?>">
      <small class="form-text text-muted">Dán link ảnh đại diện (URL)</small>
    </div>
    <div class="col-md-12 mb-2">
      <input class="form-control" name="images" placeholder='Mảng ảnh (JSON: ["url1","url2"])' value='<?= htmlspecialchars($edit['images'] ?? '') ?>'>
      <small class="form-text text-muted">Nhập nhiều link ảnh, dạng JSON: <code>[&quot;url1&quot;,&quot;url2&quot;]</code></small>
    </div>
    <div class="col-md-12 mb-2">
      <input class="form-control" name="detail_file" placeholder="File mô tả (URL/PDF)" value="<?= $edit['detail_file'] ?? '' ?>">
      <small class="form-text text-muted">Dán link file mô tả (PDF, Word, hoặc URL ngoài)</small>
    </div>
    <div class="col-md-12 mb-2">
      <textarea class="form-control" name="description" placeholder="Mô tả chi tiết" rows="2"><?= $edit['description'] ?? '' ?></textarea>
      <small class="form-text text-muted">Mô tả chi tiết về sản phẩm</small>
    </div>
  </div>
  <button class="btn btn-primary mt-2" name="save">Lưu</button>
  <a href="products.php" class="btn btn-secondary mt-2">Hủy</a>
</form>
<?php endif; ?>
<table class="table table-bordered table-hover">
  <thead><tr><th>ID</th><th>Tên</th><th>Brand</th><th>Danh mục</th><th>Giá</th><th>Ảnh</th><th>Thao tác</th></tr></thead>
  <tbody>
    <?php foreach($products as $p): ?>
    <tr>
      <td><?= $p['product_id'] ?></td>
      <td><?= htmlspecialchars($p['name']) ?></td>
      <td><?= htmlspecialchars($p['brand']) ?></td>
      <td><?php
        $catName = '';
        foreach($categories as $cat) if($cat['category_id']==$p['category_id']) $catName = $cat['name'];
        echo htmlspecialchars($catName);
      ?></td>
      <td><?= number_format($p['price']) ?> đ</td>
      <td><?php if($p['image_url']): ?><img src="<?= $p['image_url'] ?>" width="60"><?php endif; ?></td>
      <td>
        <a href="?edit=<?= $p['product_id'] ?>" class="btn btn-sm btn-warning">Sửa</a>
        <a href="?delete=<?= $p['product_id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('Xóa sản phẩm này?')">Xóa</a>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<nav><ul class="pagination">
<?php
$totalPages = ceil($total/$limit);
$cur = $page;
$show = 2; // số trang lân cận
if ($totalPages > 1) {
  // Nút về đầu và lùi 1 trang
  echo '<li class="page-item'.($cur==1?' disabled':'').'"><a class="page-link" href="?page=1">&laquo;</a></li>';
  echo '<li class="page-item'.($cur==1?' disabled':'').'"><a class="page-link" href="?page='.($cur-1).'">&lt;</a></li>';

  // Trang đầu
  if ($cur > $show+2) {
    echo '<li class="page-item"><a class="page-link" href="?page=1">1</a></li>';
    echo '<li class="page-item disabled"><span class="page-link">...</span></li>';
  }
  // Các trang lân cận
  for($i=max(1,$cur-$show);$i<=min($totalPages,$cur+$show);$i++) {
    echo '<li class="page-item'.($i==$cur?' active':'').'"><a class="page-link" href="?page='.$i.'">'.$i.'</a></li>';
  }
  // Trang cuối
  if ($cur < $totalPages-$show-1) {
    echo '<li class="page-item disabled"><span class="page-link">...</span></li>';
    echo '<li class="page-item"><a class="page-link" href="?page='.$totalPages.'">'.$totalPages.'</a></li>';
  }
  // Nút tới cuối và tới 1 trang
  echo '<li class="page-item'.($cur==$totalPages?' disabled':'').'"><a class="page-link" href="?page='.($cur+1).'">&gt;</a></li>';
  echo '<li class="page-item'.($cur==$totalPages?' disabled':'').'"><a class="page-link" href="?page='.$totalPages.'">&raquo;</a></li>';
}
?>
</ul></nav>
<?php include 'includes/footer.php'; ?> 