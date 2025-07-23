<?php
require_once 'db.php';

try {
    // Thêm các cột mới cho user profile
    $sql = "ALTER TABLE `users` 
            ADD COLUMN `phone` VARCHAR(20) NULL AFTER `password`,
            ADD COLUMN `address` TEXT NULL AFTER `phone`,
            ADD COLUMN `city` VARCHAR(100) NULL AFTER `address`,
            ADD COLUMN `zipcode` VARCHAR(20) NULL AFTER `city`,
            ADD COLUMN `birthdate` DATE NULL AFTER `zipcode`";
    
    $pdo->exec($sql);
    echo "Đã thêm các cột mới cho bảng users thành công!\n";
    
    // Cập nhật dữ liệu mẫu cho user hiện có
    $updateSql = "UPDATE `users` SET 
                  `phone` = '0983302904',
                  `address` = 'P648 D9 Kdt Đặng Xá',
                  `city` = 'Hà Nội',
                  `zipcode` = '100000',
                  `birthdate` = '1990-01-01'
                  WHERE `user_id` = 'u687ccc43959f16.92266972'";
    
    $pdo->exec($updateSql);
    echo "Đã cập nhật dữ liệu mẫu cho user!\n";
    
} catch (PDOException $e) {
    echo "Lỗi: " . $e->getMessage() . "\n";
} 