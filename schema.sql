-- ==========================================================
-- DPMS Enterprise License Controller API Database Schema
-- MySQL 8.0+ / MariaDB 10.5+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `dpms_licenses` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dpms_licenses`;

-- 1. Licenses Table
CREATE TABLE IF NOT EXISTS `licenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `license_key` VARCHAR(128) NOT NULL UNIQUE,
    `key_hash` VARCHAR(64) NOT NULL,
    `encrypted_payload` TEXT NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL DEFAULT 'Valued Customer',
    `customer_email` VARCHAR(255) NULL,
    `tier` VARCHAR(50) NOT NULL DEFAULT 'Enterprise',
    `max_activations` INT NOT NULL DEFAULT 1,
    `current_activations` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'expired', 'revoked', 'suspended') NOT NULL DEFAULT 'active',
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `notes` TEXT NULL,
    INDEX `idx_key_hash` (`key_hash`),
    INDEX `idx_status` (`status`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. License Activations Table (Per-Machine Binding)
CREATE TABLE IF NOT EXISTS `license_activations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `license_id` INT NOT NULL,
    `machine_name` VARCHAR(255) NOT NULL,
    `client_version` VARCHAR(50) NOT NULL DEFAULT '1.0',
    `ip_address` VARCHAR(45) NULL,
    `first_activated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_heartbeat` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_license_machine` (`license_id`, `machine_name`),
    CONSTRAINT `fk_activation_license` FOREIGN KEY (`license_id`) REFERENCES `licenses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Verification Logs Table (Audit & Real-Time Telemetry)
CREATE TABLE IF NOT EXISTS `verification_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `license_key` VARCHAR(128) NULL,
    `is_valid` BOOLEAN NOT NULL DEFAULT 0,
    `status_code` VARCHAR(50) NOT NULL,
    `machine_name` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `client_version` VARCHAR(50) NULL,
    `message` TEXT NULL,
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_log_timestamp` (`timestamp`),
    INDEX `idx_log_is_valid` (`is_valid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
