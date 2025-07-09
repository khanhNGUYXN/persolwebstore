<?php
$no_auth = true;
require_once 'includes/config.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'ADMIN' LIMIT 1");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    if ($admin && hash('sha256', $password) === $admin['password']) {
        $_SESSION['admin_id'] = $admin['user_id'];
        $_SESSION['admin_name'] = $admin['fullname'];
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Sai email hoặc mật khẩu, hoặc không phải tài khoản admin!';
    }
}
?>
<?php include 'includes/header.php'; ?>
<div class="row justify-content-center">
  <div class="col-md-4">
    <h3 class="mb-3">Đăng nhập Admin</h3>
    <?php if ($error): ?><div class="alert alert-danger"><?= $error ?></div><?php endif; ?>
    <form method="post">
      <div class="mb-3">
        <label>Email</label>
        <input type="email" name="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label>Mật khẩu</label>
        <input type="password" name="password" class="form-control" required>
      </div>
      <button class="btn btn-primary w-100">Đăng nhập</button>
    </form>
  </div>
</div>
<?php include 'includes/footer.php'; ?> 