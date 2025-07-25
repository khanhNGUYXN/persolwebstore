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
// Doanh thu theo tháng (12 tháng gần nhất)
$monthly = $pdo->query("SELECT DATE_FORMAT(order_date, '%Y-%m') as ym, SUM(total_amount) as revenue, COUNT(*) as orders FROM orders WHERE status='SUCCESS' GROUP BY ym ORDER BY ym DESC LIMIT 12")->fetchAll();
// Số sản phẩm bán ra (tổng quantity trong order_items của đơn thành công)
$sold = $pdo->query("SELECT SUM(oi.quantity) FROM order_items oi JOIN orders o ON oi.order_id=o.order_id WHERE o.status='SUCCESS'")->fetchColumn();
// Top 5 sản phẩm bán chạy
$top = $pdo->query("SELECT p.name, SUM(oi.quantity) as qty FROM order_items oi JOIN products p ON oi.product_id=p.product_id JOIN orders o ON oi.order_id=o.order_id WHERE o.status='SUCCESS' GROUP BY oi.product_id ORDER BY qty DESC LIMIT 5")->fetchAll();
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
<?php
?>
<div class="row g-3 mt-4">
  <div class="col-md-4">
    <div class="card card-body bg-light">
      <h6>Doanh thu theo tháng (12 tháng gần nhất)</h6>
      <ul class="mb-0">
        <?php foreach(array_reverse($monthly) as $m): ?>
          <li><?= $m['ym'] ?>: <b><?= number_format($m['revenue']) ?> đ</b> (<?= $m['orders'] ?> đơn)</li>
        <?php endforeach; ?>
      </ul>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card card-body bg-light">
      <h6>Tổng sản phẩm đã bán</h6>
      <b><?= number_format($sold) ?></b>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card card-body bg-light">
      <h6>Top 5 sản phẩm bán chạy</h6>
      <ol class="mb-0">
        <?php foreach($top as $t): ?>
          <li><?= htmlspecialchars($t['name']) ?>: <b><?= $t['qty'] ?></b></li>
        <?php endforeach; ?>
      </ol>
    </div>
  </div>
</div>
<?php include 'includes/footer.php'; ?> 