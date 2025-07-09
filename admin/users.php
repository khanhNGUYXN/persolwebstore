<?php include 'includes/header.php';
?>
<h3>Quản lý người dùng</h3>
<p class="text-muted">Danh sách khách hàng. Có thể khóa/mở tài khoản. Không thể xóa user.</p>
<?php
$stmt = $pdo->query("SELECT * FROM users WHERE role = 'CUSTOMER' ORDER BY user_id DESC");
$users = $stmt->fetchAll();
if(isset($_GET['toggle']) && isset($_GET['id'])) {
  $id = $_GET['id'];
  $user = $pdo->query("SELECT * FROM users WHERE user_id = '".$id."'")->fetch();
  if($user) {
    $newStatus = $user['status']==='ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    $pdo->prepare("UPDATE users SET status=? WHERE user_id=?")->execute([$newStatus, $id]);
    header('Location: users.php'); exit;
  }
}
?>
<table class="table table-bordered table-hover">
  <thead><tr><th>ID</th><th>Username</th><th>Họ tên</th><th>Email</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
  <tbody>
    <?php foreach($users as $u): ?>
    <tr>
      <td><?= $u['user_id'] ?></td>
      <td><?= htmlspecialchars($u['username']) ?></td>
      <td><?= htmlspecialchars($u['fullname']) ?></td>
      <td><?= htmlspecialchars($u['email']) ?></td>
      <td><?= $u['status'] ?></td>
      <td>
        <a href="?toggle=1&id=<?= $u['user_id'] ?>" class="btn btn-sm btn-<?= $u['status']==='ACTIVE'?'danger':'success' ?>">
          <?= $u['status']==='ACTIVE'?'Khóa':'Mở' ?>
        </a>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php include 'includes/footer.php'; ?> 