-- persol.sql - Database schema for Persol Webstore

-- Users Table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CUSTOMER') DEFAULT 'CUSTOMER',
    status ENUM
('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products Table
CREATE TABLE products
(
    product_id INT
    UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR
    (255),
    brand VARCHAR
    (100),
    category VARCHAR
    (100),
    price DECIMAL
    (10,2),
    quantity INT,
    image_url TEXT,
    description TEXT,
    detail_file TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Cart Table
    CREATE TABLE cart
    (
        cart_id INT
        UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR
        (36),
    product_id INT UNSIGNED,
    quantity INT,
    FOREIGN KEY
        (user_id) REFERENCES users
        (user_id) ON
        DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES products
        (product_id) ON
        DELETE CASCADE
) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4;

        -- Orders Table
        CREATE TABLE orders
        (
            order_id INT
            UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR
            (36),
    order_date DATETIME,
    total_amount DECIMAL
            (10,2),
    status ENUM
            ('PENDING','SUCCESS','CANCELLED') DEFAULT 'PENDING',
    delivery_id INT UNSIGNED,
    trans_id INT UNSIGNED,
    FOREIGN KEY
            (user_id) REFERENCES users
            (user_id) ON
            DELETE CASCADE
) ENGINE=InnoDB
            DEFAULT CHARSET=utf8mb4;

            -- Order Items Table
            CREATE TABLE order_items
            (
                order_item_id INT
                UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED,
    product_id INT UNSIGNED,
    quantity INT,
    price DECIMAL
                (10,2),
    FOREIGN KEY
                (order_id) REFERENCES orders
                (order_id) ON
                DELETE CASCADE,
    FOREIGN KEY (product_id)
                REFERENCES products
                (product_id) ON
                DELETE CASCADE
) ENGINE=InnoDB
                DEFAULT CHARSET=utf8mb4;

                -- Delivery Info Table
                CREATE TABLE delivery_info
                (
                    delivery_id INT
                    UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR
                    (36),
    recipient VARCHAR
                    (255),
    address VARCHAR
                    (255),
    city VARCHAR
                    (100),
    phone VARCHAR
                    (20),
    zipcode VARCHAR
                    (20),
    FOREIGN KEY
                    (user_id) REFERENCES users
                    (user_id) ON
                    DELETE CASCADE
) ENGINE=InnoDB
                    DEFAULT CHARSET=utf8mb4;

                    -- Transaction Info Table
                    CREATE TABLE transaction_info
                    (
                        trans_id INT
                        UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR
                        (36),
    payment_method VARCHAR
                        (50),
    content TEXT,
    dates DATETIME,
    FOREIGN KEY
                        (user_id) REFERENCES users
                        (user_id) ON
                        DELETE CASCADE
) ENGINE=InnoDB
                        DEFAULT CHARSET=utf8mb4;

                        -- Sample data for products
                        INSERT INTO products
                            (name, brand, category, price, quantity, image_url, description, detail_file)
                        VALUES
                            ('Ray-Ban Aviator Classic', 'Ray-Ban', 'Sunglasses', 3500000, 10, 'https://assets.ray-ban.com/is/image/RayBan/8052896020578__001.png', 'Gọng kim loại, kính phi công cổ điển', 'https://www.ray-ban.com/usa/sunglasses/RB3025-001-58'),
                            ('Oakley Holbrook', 'Oakley', 'Sunglasses', 3200000, 8, 'https://www.oakley.com/en-us/product/W0OO9102?variant=888392105926', 'Phong cách thể thao, gọng nhựa bền', 'https://www.oakley.com/en-us/product/W0OO9102?variant=888392105926'),
                            ('Acuvue Oasys Contact Lenses', 'Acuvue', 'Contact Lens', 900000, 20, 'https://www.acuvue.com/sites/acuvue_us/files/styles/product_image/public/2021-01/ACUVUE-OASYS-2WEEK-6PK-Front.png', 'Kính áp tròng mềm, dùng 2 tuần', 'https://www.acuvue.com/contact-lenses/acuvue-oasys-2-week'); 