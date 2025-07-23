<?php
if (!isset($no_auth)) require_once 'auth.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Admin Panel - Persol Webstore</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <style>
      body { min-height: 100vh; }
      .sidebar {
        min-height: 100vh;
        background: #222;
        color: #fff;
        padding-top: 30px;
      }
      .sidebar .nav-link { color: #fff; margin-bottom: 10px; }
      .sidebar .nav-link.active, .sidebar .nav-link:hover { background: #0d6efd; color: #fff; }
      .sidebar .logout-link { color: #fff; background: #dc3545; }
      .sidebar .logout-link:hover { background: #a71d2a; }
      main#main-content { padding: 32px 24px; background: #f8f9fa; min-height: 100vh; }
    </style>
</head>
<body>
<div class="container-fluid">
  <div class="row">
    <nav class="col-md-2 d-none d-md-block sidebar">
      <div class="position-sticky">
        <h4 class="text-center mb-4">Admin Panel</h4>
        <ul class="nav flex-column">
          <li class="nav-item"><a class="nav-link<?= basename($_SERVER['SCRIPT_NAME'])=='dashboard.php'?' active':'' ?>" href="dashboard.php">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link<?= basename($_SERVER['SCRIPT_NAME'])=='products.php'?' active':'' ?>" href="products.php">Sản phẩm</a></li>
          <li class="nav-item"><a class="nav-link<?= basename($_SERVER['SCRIPT_NAME'])=='categories.php'?' active':'' ?>" href="categories.php">Danh mục</a></li>
          <li class="nav-item"><a class="nav-link<?= basename($_SERVER['SCRIPT_NAME'])=='users.php'?' active':'' ?>" href="users.php">Người dùng</a></li>
          <li class="nav-item"><a class="nav-link<?= basename($_SERVER['SCRIPT_NAME'])=='orders.php'?' active':'' ?>" href="orders.php">Đơn hàng</a></li>
          <li class="nav-item"><a class="nav-link<?= basename($_SERVER['SCRIPT_NAME'])=='banner.php'?' active':'' ?>" href="banner.php">Banner</a></li>
          <li class="nav-item mt-3"><a class="nav-link logout-link" href="logout.php">Đăng xuất</a></li>
        </ul>
      </div>
    </nav>
    <main class="col-md-10 ms-sm-auto" id="main-content"> 