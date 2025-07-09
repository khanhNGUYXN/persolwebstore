<?php include 'includes/header.php';
// Thêm/sửa category
if (isset($_POST['save'])) {
  $name = trim($_POST['name'] ?? '');
  $parent_id = $_POST['parent_id'] !== '' ? intval($_POST['parent_id']) : null;
  if (isset($_POST['id']) && $_POST['id']) {
    $stmt = $pdo->prepare('UPDATE categories SET name=?, parent_id=? WHERE category_id=?');
    $stmt->execute([$name, $parent_id, $_POST['id']]);
  } else {
    $stmt = $pdo->prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
    $stmt->execute([$name, $parent_id]);
  }
  header('Location: categories.php'); exit;
}
// Xóa category (xóa luôn nhánh con do ON DELETE CASCADE)
if (isset($_GET['delete'])) {
  $id = intval($_GET['delete']);
  $pdo->prepare('DELETE FROM categories WHERE category_id=?')->execute([$id]);
  header('Location: categories.php'); exit;
}
// Lấy danh sách categories
$stmt = $pdo->query('SELECT * FROM categories ORDER BY name');
$categories = $stmt->fetchAll();
// Đệ quy dựng cây
function buildTree($cats, $parent = null) {
  $tree = [];
  foreach ($cats as $c) {
    if ($c['parent_id'] == $parent) {
      $children = buildTree($cats, $c['category_id']);
      if ($children) $c['children'] = $children;
      $tree[] = $c;
    }
  }
  return $tree;
}
$catTree = buildTree($categories);
// Lấy dữ liệu khi sửa
$edit = null;
if (isset($_GET['edit'])) {
  foreach ($categories as $c) if ($c['category_id'] == $_GET['edit']) $edit = $c;
}
function renderOptions($cats, $level = 0, $selected = null, $exclude = null) {
  foreach ($cats as $c) {
    if ($exclude && $c['category_id'] == $exclude) continue;
    echo '<option value="'.$c['category_id'].'"'.($selected==$c['category_id']?' selected':'').'>'.str_repeat('--', $level).' '.$c['name'].'</option>';
    if (!empty($c['children'])) renderOptions($c['children'], $level+1, $selected, $exclude);
  }
}
function renderTree($cats, $level = 0) {
  foreach ($cats as $c) {
    echo '<tr><td>'.str_repeat('&nbsp;&nbsp;&nbsp;', $level).htmlspecialchars($c['name']).'</td>';
    echo '<td>'.($c['parent_id'] ? $c['parent_id'] : '<b>ROOT</b>').'</td>';
    echo '<td><a href="?edit='.$c['category_id'].'" class="btn btn-sm btn-warning">Sửa</a> ';
    echo '<a href="?delete='.$c['category_id'].'" class="btn btn-sm btn-danger" onclick="return confirm(\'Xóa category này và toàn bộ nhánh con?\')">Xóa</a></td></tr>';
    if (!empty($c['children'])) renderTree($c['children'], $level+1);
  }
}
?>
<h3>Quản lý danh mục (Categories)</h3>
<p class="text-muted">Thêm, sửa, xóa danh mục sản phẩm dạng cây. Nếu xóa nhánh cha sẽ xóa luôn toàn bộ nhánh con.</p>
<a href="?add=1" class="btn btn-success mb-3">Thêm danh mục</a>
<?php if(isset($_GET['add']) || $edit): ?>
<form method="post" class="mb-4">
  <input type="hidden" name="id" value="<?= $edit['category_id'] ?? '' ?>">
  <div class="row g-2">
    <div class="col-md-6 mb-2">
      <input class="form-control" name="name" placeholder="Tên danh mục" value="<?= $edit['name'] ?? '' ?>" required>
      <small class="form-text text-muted">Ví dụ: Kính cận, Kính viễn, Kính loạn...</small>
    </div>
    <div class="col-md-6 mb-2">
      <select class="form-select" name="parent_id">
        <option value="">ROOT (Nhánh chính)</option>
        <?php renderOptions($catTree, 0, $edit['parent_id'] ?? null, $edit['category_id'] ?? null); ?>
      </select>
      <small class="form-text text-muted">Chọn nhánh cha. Nếu là nhánh chính, chọn ROOT.</small>
    </div>
  </div>
  <button class="btn btn-primary mt-2" name="save">Lưu</button>
  <a href="categories.php" class="btn btn-secondary mt-2">Hủy</a>
</form>
<?php endif; ?>
<table class="table table-bordered table-hover">
  <thead><tr><th>Tên danh mục</th><th>Cha</th><th>Thao tác</th></tr></thead>
  <tbody>
    <?php renderTree($catTree); ?>
  </tbody>
</table>
<?php include 'includes/footer.php'; ?> 