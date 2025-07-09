<?php include 'includes/header.php';
?>
<h3>Dashboard</h3>
<p class="text-muted">Chào mừng bạn đến với trang quản trị Persol Webstore. Tại đây bạn có thể quản lý sản phẩm, người dùng, đơn hàng và xem thống kê tổng quan hệ thống.</p>
<?php
$stmt = $pdo->query("SELECT COUNT(*) FROM products"); $total_products = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'"); $total_users = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) FROM orders"); $total_orders = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status = 'SUCCESS'"); $total_revenue = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT status, COUNT(*) as cnt FROM orders GROUP BY status"); $order_stats = $stmt->fetchAll();
?>
<div class="row g-3">
  <div class="col-md-3"><div class="card card-body text-center bg-light">Sản phẩm<br><b><?= $total_products ?></b></div></div>
  <div class="col-md-3"><div class="card card-body text-center bg-light">Người dùng<br><b><?= $total_users ?></b></div></div>
  <div class="col-md-3"><div class="card card-body text-center bg-light">Đơn hàng<br><b><?= $total_orders ?></b></div></div>
  <div class="col-md-3"><div class="card card-body text-center bg-light">Doanh thu<br><b><?= number_format($total_revenue) ?> đ</b></div></div>
</div>
<h5 class="mt-4">Đơn hàng theo trạng thái</h5>
<ul>
<?php foreach($order_stats as $row): ?>
  <li><?= $row['status'] ?>: <b><?= $row['cnt'] ?></b></li>
<?php endforeach; ?>
</ul>
<?php include 'includes/footer.php'; ?> 