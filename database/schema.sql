-- ============================================================
-- RepurposeAI - Complete Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS repurpose_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE repurpose_ai;

-- ─── Users Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    email                   VARCHAR(100)    NOT NULL UNIQUE,
    password                VARCHAR(255)    NOT NULL,
    name                    VARCHAR(100)    NOT NULL,
    plan                    ENUM('FREE','PRO') NOT NULL DEFAULT 'FREE',
    stripe_customer_id      VARCHAR(100)    NULL,
    stripe_subscription_id  VARCHAR(100)    NULL,
    daily_usage_count       INT             NOT NULL DEFAULT 0,
    total_generations       INT             NOT NULL DEFAULT 0,
    last_usage_reset        DATETIME        NULL,
    is_active               TINYINT(1)      NOT NULL DEFAULT 1,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email (email),
    INDEX idx_users_plan (plan),
    INDEX idx_users_stripe_customer (stripe_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Generated Content Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS generated_content (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    input_text      TEXT            NOT NULL,
    output_type     ENUM(
                        'LINKEDIN_POST',
                        'TWITTER_THREAD',
                        'INSTAGRAM_CAPTION',
                        'EMAIL_NEWSLETTER',
                        'SHORT_FORM_IDEAS',
                        'YOUTUBE_DESCRIPTION',
                        'FACEBOOK_POST',
                        'BLOG_SUMMARY'
                    ) NOT NULL,
    output_text     LONGTEXT        NOT NULL,
    tokens_used     INT             NULL,
    model_used      VARCHAR(50)     NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_content_user_id (user_id),
    INDEX idx_content_output_type (output_type),
    INDEX idx_content_created_at (created_at),
    CONSTRAINT fk_content_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Useful Views ─────────────────────────────────────────────

CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.email,
    u.name,
    u.plan,
    u.daily_usage_count,
    u.total_generations,
    COUNT(gc.id)            AS saved_generations,
    SUM(gc.tokens_used)     AS total_tokens_used,
    u.created_at
FROM users u
LEFT JOIN generated_content gc ON gc.user_id = u.id
GROUP BY u.id;

CREATE OR REPLACE VIEW daily_generation_stats AS
SELECT
    DATE(created_at)    AS generation_date,
    output_type,
    COUNT(*)            AS count,
    SUM(tokens_used)    AS tokens
FROM generated_content
GROUP BY DATE(created_at), output_type
ORDER BY generation_date DESC;

-- ─── Seed data for testing ────────────────────────────────────
-- Password: Test@1234 (BCrypt encoded)
INSERT INTO users (email, password, name, plan, is_active) VALUES
('admin@repurposeai.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKJsDxrxlbCaTbO',
 'Admin User', 'PRO', 1),
('demo@repurposeai.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKJsDxrxlbCaTbO',
 'Demo User', 'FREE', 1);
