-- ============================================
-- REST API MySQL - Схема бази даних
-- ============================================

-- Створення бази даних
CREATE DATABASE IF NOT EXISTS rest_api_db;
USE rest_api_db;

-- ============================================
-- Таблиця користувачів
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('admin', 'moderator', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Таблиця товарів
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_name (name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Початкові дані
-- ============================================

-- Користувачі
INSERT INTO users (name, email, role, status) VALUES
('Олександр', 'alex@example.com', 'admin', 'active'),
('Марія', 'maria@example.com', 'user', 'active'),
('Іван', 'ivan@example.com', 'user', 'inactive'),
('Анна', 'anna@example.com', 'moderator', 'active'),
('Петро', 'petro@example.com', 'user', 'active');

-- Товари
INSERT INTO products (name, price, category, description, stock) VALUES
('Ноутбук ASUS ROG', 45999.00, 'electronics', 'Ігровий ноутбук з RTX 4060', 15),
('Клавіатура Logitech MX', 2499.00, 'electronics', 'Бездротова механічна клавіатура', 45),
('Миша Razer DeathAdder', 1899.00, 'electronics', 'Ігрова миша 16000 DPI', 80),
('Монітор Samsung 27"', 12999.00, 'electronics', '4K UHD монітор', 20),
('Навушники Sony WH-1000XM5', 11999.00, 'electronics', 'ANC навушники', 30);