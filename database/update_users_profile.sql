-- Thêm các cột mới cho user profile
ALTER TABLE `users` 
ADD COLUMN `phone` VARCHAR(20) NULL AFTER `password`,
ADD COLUMN `address` TEXT NULL AFTER `phone`,
ADD COLUMN `city` VARCHAR(100) NULL AFTER `address`,
ADD COLUMN `zipcode` VARCHAR(20) NULL AFTER `city`,
ADD COLUMN `birthdate` DATE NULL AFTER `zipcode`;

-- Cập nhật dữ liệu mẫu cho các user hiện có (tùy chọn)
UPDATE `users` SET 
  `phone` = '0983302904',
  `address` = 'P648 D9 Kdt Đặng Xá',
  `city` = 'Hà Nội',
  `zipcode` = '100000',
  `birthdate` = '1990-01-01'
WHERE `user_id` = 'u687ccc43959f16.92266972'; 