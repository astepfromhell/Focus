-- ============================================
-- Focus App 完整数据库初始化脚本
-- 合并 init.sql + 007_create_ai_tables.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS focus_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE focus_app;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  pomodoro_duration INT DEFAULT 25,
  short_break INT DEFAULT 5,
  long_break INT DEFAULT 15,
  auto_start_break BOOLEAN DEFAULT FALSE,
  auto_start_pomodoro BOOLEAN DEFAULT FALSE,
  enable_notifications BOOLEAN DEFAULT TRUE,
  notification_sound BOOLEAN DEFAULT TRUE,
  sound_volume INT DEFAULT 50,
  theme VARCHAR(20) DEFAULT 'light',
  primary_color VARCHAR(7) DEFAULT '#FF6B6B',
  background_image_url VARCHAR(500) DEFAULT NULL,
  font_size VARCHAR(10) DEFAULT 'medium',
  language VARCHAR(10) DEFAULT 'zh-CN',
  data_retention_days INT DEFAULT 365,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

-- 番茄钟会话表
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NULL,
  planned_duration INT NOT NULL,
  actual_duration INT NULL,
  status VARCHAR(20) DEFAULT 'in_progress',
  tag VARCHAR(64) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  interruptions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='番茄钟会话表';

-- 便签表
CREATE TABLE IF NOT EXISTS notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  width INT DEFAULT 200,
  height INT DEFAULT 200,
  z_index INT DEFAULT 0,
  color VARCHAR(7) DEFAULT '#FFEB3B',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  tags VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='便签表';

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  type VARCHAR(10) DEFAULT 'short',
  start_date DATE DEFAULT NULL,
  start_time TIME DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  due_time TIME DEFAULT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  tags VARCHAR(255) DEFAULT NULL,
  remind_at TIMESTAMP NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  parent_task_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, type),
  INDEX idx_user_date (user_id, start_date, end_date),
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_priority (user_id, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#757575',
  type VARCHAR(20) NOT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_user_name_type (user_id, name, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 用户令牌表
CREATE TABLE IF NOT EXISTS user_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL,
  expires_at TIMESTAMP NULL,
  consumed BOOLEAN DEFAULT FALSE,
  metadata TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_token_type (token_hash, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户令牌表';

-- AI 对话会话表
CREATE TABLE IF NOT EXISTS ai_conversations (
  id VARCHAR(50) PRIMARY KEY COMMENT '会话ID，格式: conv_时间戳_随机串',
  user_id INT NOT NULL COMMENT '用户ID',
  title VARCHAR(100) DEFAULT 'AI助手对话' COMMENT '会话标题，取首条消息前20字',
  message_count INT DEFAULT 0 COMMENT '消息数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话会话表';

-- AI 对话消息表
CREATE TABLE IF NOT EXISTS ai_messages (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  conversation_id VARCHAR(50) NOT NULL COMMENT '关联会话ID',
  user_id INT NOT NULL COMMENT '用户ID',
  role ENUM('user', 'assistant') NOT NULL COMMENT '角色：user=用户, assistant=AI',
  content TEXT NOT NULL COMMENT '消息内容',
  intent_type ENUM('chat', 'create', 'summarize') DEFAULT NULL COMMENT '意图类型',
  action_type VARCHAR(30) DEFAULT NULL COMMENT '操作类型',
  action_success BOOLEAN DEFAULT NULL COMMENT '操作是否成功',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话消息表';
