<?php include 'includes/header.php';
?>
<h3>Quản lý đơn hàng</h3>
<p class="text-muted">Xem danh sách, chi tiết đơn hàng và thay đổi trạng thái đơn hàng.</p>
<?php
// Đổi trạng thái đơn hàng
if(isset($_GET['status']) && isset($_GET['id'])) {
  $id = $_GET['id'];
  $status = $_GET['status'];
  $pdo->prepare("UPDATE orders SET status=? WHERE order_id=?")->execute([$status, $id]);
  header('Location: orders.php'); exit;
}
$stmt = $pdo->query("SELECT * FROM orders ORDER BY order_id DESC");
$orders = $stmt->fetchAll();
?>
<table class="table table-bordered table-hover">
  <thead><tr><th>ID</th><th>User</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
  <tbody>
    <?php foreach($orders as $o): ?>
    <tr>
      <td><?= $o['order_id'] ?></td>
      <td><?= $o['user_id'] ?></td>
      <td><?= $o['order_date'] ?></td>
      <td><?= number_format($o['total_amount']) ?> đ</td>
      <td><?= $o['status'] ?></td>
      <td>
        <a href="?view=<?= $o['order_id'] ?>" class="btn btn-sm btn-info">Chi tiết</a>
        <a href="?status=PENDING&id=<?= $o['order_id'] ?>" class="btn btn-sm btn-warning">Pending</a>
        <a href="?status=SUCCESS&id=<?= $o['order_id'] ?>" class="btn btn-sm btn-success">Success</a>
        <a href="?status=CANCELLED&id=<?= $o['order_id'] ?>" class="btn btn-sm btn-danger">Cancel</a>
      </td>
    </tr>
    <?php if(isset($_GET['view']) && $_GET['view']==$o['order_id']):
      $stmt2 = $pdo->prepare("SELECT * FROM order_items WHERE order_id=?");
      $stmt2->execute([$o['order_id']]);
      $items = $stmt2->fetchAll(); ?>
      <tr><td colspan="6">
        <b>Chi tiết đơn hàng:</b>
        <ul>
        <?php foreach($items as $it): ?>
          <li>Sản phẩm: <?= $it['product_id'] ?> | SL: <?= $it['quantity'] ?> | Giá: <?= number_format($it['price']) ?> đ</li>
        <?php endforeach; ?>
        </ul>
      </td></tr>
    <?php endif; ?>
    <?php endforeach; ?>
  </tbody>
</table>
<?php include 'includes/footer.php'; ?> 