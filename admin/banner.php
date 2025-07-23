<?php include 'includes/header.php'; ?>
<h3>Quản lý Banner</h3>
<p class="text-muted">Thêm, sửa, xóa banner trang chủ. Banner sẽ hiển thị dạng carousel ở trang chính, có thể click để chuyển link. Có thể upload ảnh từ máy hoặc dán link ảnh.</p>
<?php
// Tạo thư mục upload nếu chưa có
$upload_dir = __DIR__ . '/../uploads/banner/';
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

// Xử lý thêm/sửa/xóa banner
if(isset($_GET['delete'])) {
  $id = intval($_GET['delete']);
  $pdo->prepare('DELETE FROM banner WHERE id=?')->execute([$id]);
  header('Location: banner.php'); exit;
}
if(isset($_POST['save'])) {
  $fields = ['image_url','link_url','sort_order','status'];
  $data = [];
  foreach($fields as $f) $data[$f] = $_POST[$f] ?? '';
  // Xử lý upload file ảnh nếu có
  if(isset($_FILES['upload_image']) && $_FILES['upload_image']['error'] == 0) {
    $ext = strtolower(pathinfo($_FILES['upload_image']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png','webp'];
    if(in_array($ext, $allowed)) {
      $fname = 'banner_' . time() . '_' . rand(1000,9999) . '.' . $ext;
      $target = $upload_dir . $fname;
      if(move_uploaded_file($_FILES['upload_image']['tmp_name'], $target)) {
        $data['image_url'] = 'uploads/banner/' . $fname;
      }
    }
  }
  if(isset($_POST['id']) && $_POST['id']) {
    // Sửa
    $sql = "UPDATE banner SET image_url=?, link_url=?, sort_order=?, status=? WHERE id=?";
    $pdo->prepare($sql)->execute([$data['image_url'],$data['link_url'],$data['sort_order'],$data['status'],$_POST['id']]);
  } else {
    // Thêm
    $sql = "INSERT INTO banner (image_url, link_url, sort_order, status) VALUES (?,?,?,?)";
    $pdo->prepare($sql)->execute([$data['image_url'],$data['link_url'],$data['sort_order'],$data['status']]);
  }
  header('Location: banner.php'); exit;
}
// Lấy danh sách banner
$stmt = $pdo->query('SELECT * FROM banner ORDER BY sort_order ASC, id DESC');
$banners = $stmt->fetchAll();
// Lấy dữ liệu khi sửa
$edit = null;
if(isset($_GET['edit'])) {
  $stmt = $pdo->prepare('SELECT * FROM banner WHERE id=?');
  $stmt->execute([$_GET['edit']]);
  $edit = $stmt->fetch();
}
?>
<a href="?add=1" class="btn btn-success mb-3">Thêm banner</a>
<?php if(isset($_GET['add']) || $edit): ?>
<form method="post" class="mb-4" enctype="multipart/form-data">
  <input type="hidden" name="id" value="<?= $edit['id'] ?? '' ?>">
  <div class="row g-2">
    <div class="col-md-5 mb-2">
      <input class="form-control mb-1" name="image_url" placeholder="Ảnh banner (URL)" value="<?= $edit['image_url'] ?? '' ?>">
      <input class="form-control" type="file" name="upload_image" accept="image/*">
      <small class="form-text text-muted">Dán link ảnh hoặc upload file (jpg, png, webp, jpeg, ưu tiên ảnh ngang lớn)</small>
      <?php if(!empty($edit['image_url'])): ?>
        <img src="../<?= htmlspecialchars($edit['image_url']) ?>" style="max-width:180px;max-height:60px;border-radius:6px;margin-top:4px;">
      <?php endif; ?>
    </div>
    <div class="col-md-4 mb-2">
      <input class="form-control" name="link_url" placeholder="Link khi click (URL)" value="<?= $edit['link_url'] ?? '' ?>">
      <small class="form-text text-muted">Dán link chuyển hướng khi click (có thể bỏ trống)</small>
    </div>
    <div class="col-md-1 mb-2">
      <input class="form-control" name="sort_order" type="number" placeholder="Thứ tự" value="<?= $edit['sort_order'] ?? '0' ?>">
      <small class="form-text text-muted">Thứ tự hiển thị</small>
    </div>
    <div class="col-md-2 mb-2">
      <select class="form-select" name="status">
        <option value="1"<?= (isset($edit['status']) && $edit['status']==0)?'':' selected' ?>>Hiện</option>
        <option value="0"<?= (isset($edit['status']) && $edit['status']==0)?' selected':'' ?>>Ẩn</option>
      </select>
      <small class="form-text text-muted">Trạng thái</small>
    </div>
  </div>
  <button class="btn btn-primary mt-2" name="save">Lưu</button>
  <a href="banner.php" class="btn btn-secondary mt-2">Hủy</a>
</form>
<?php endif; ?>
<table class="table table-bordered table-hover bg-white">
  <thead class="table-light">
    <tr>
      <th>Ảnh</th>
      <th>Link</th>
      <th>Thứ tự</th>
      <th>Trạng thái</th>
      <th style="width:120px">Hành động</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach($banners as $b): ?>
    <tr>
      <td><img src="../<?= htmlspecialchars($b['image_url']) ?>" style="max-width:180px;max-height:60px;border-radius:6px;"></td>
      <td><?= $b['link_url'] ? '<a href="'.htmlspecialchars($b['link_url']).'" target="_blank">'.htmlspecialchars($b['link_url']).'</a>' : '<span class="text-muted">(Không có)</span>' ?></td>
      <td><?= $b['sort_order'] ?></td>
      <td><?= $b['status'] ? '<span class="badge bg-success">Hiện</span>' : '<span class="badge bg-secondary">Ẩn</span>' ?></td>
      <td>
        <a href="?edit=<?= $b['id'] ?>" class="btn btn-sm btn-warning">Sửa</a>
        <a href="?delete=<?= $b['id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('Xóa banner này?')">Xóa</a>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php include 'includes/footer.php'; ?> 