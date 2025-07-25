<?php
// Xử lý xóa bình luận (phải đặt trước khi có HTML output)
require_once '../backend/db/db.php';
$filter_product = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
if (isset($_GET['delete'])) {
  $id = intval($_GET['delete']);
  $pdo->prepare('UPDATE product_comments SET is_deleted=1 WHERE comment_id=?')->execute([$id]);
  header('Location: comments.php'.($filter_product?('?product_id='.$filter_product):'')); exit;
}
?>
<?php include 'includes/header.php'; ?>
<h3>Quản lý bình luận sản phẩm</h3>
<p class="text-muted">Xem, lọc và xóa bình luận của khách hàng cho từng sản phẩm.</p>
<?php
// Lấy danh sách sản phẩm để lọc
$products = $pdo->query('SELECT product_id, name FROM products ORDER BY name')->fetchAll();
// Lấy bình luận
$where = $filter_product ? 'WHERE c.product_id = ?' : '';
$sql = "SELECT c.*, p.name as product_name FROM product_comments c JOIN products p ON c.product_id = p.product_id $where AND c.is_deleted=0 ORDER BY c.created_at DESC LIMIT 100";
$stmt = $pdo->prepare($sql);
if ($filter_product) $stmt->execute([$filter_product]); else $stmt->execute();
$comments = $stmt->fetchAll();
?>
<form method="get" class="mb-3">
  <div class="row g-2 align-items-end">
    <div class="col-md-4">
      <label class="form-label">Lọc theo sản phẩm</label>
      <select name="product_id" class="form-select" onchange="this.form.submit()">
        <option value="">-- Tất cả sản phẩm --</option>
        <?php foreach($products as $prod): ?>
          <option value="<?= $prod['product_id'] ?>"<?= $filter_product==$prod['product_id']?' selected':'' ?>><?= htmlspecialchars($prod['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>
</form>
<table class="table table-bordered table-hover">
  <thead><tr><th>ID</th><th>Sản phẩm</th><th>User</th><th>Bình luận</th><th>Thời gian</th><th>Xóa</th></tr></thead>
  <tbody>
    <?php foreach($comments as $c): ?>
    <tr>
      <td><?= $c['comment_id'] ?></td>
      <td><?= htmlspecialchars($c['product_name']) ?></td>
      <td><?= htmlspecialchars($c['username'] ?: $c['user_id'] ?: 'Ẩn danh') ?></td>
      <td><?= htmlspecialchars($c['comment']) ?></td>
      <td><?= $c['created_at'] ?></td>
      <td><a href="?delete=<?= $c['comment_id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('Xóa bình luận này?')">Xóa</a></td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php include 'includes/footer.php'; ?> 