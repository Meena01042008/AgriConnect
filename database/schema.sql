CREATE DATABASE IF NOT EXISTS agriconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agriconnect;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('FARMER','ADMIN') NOT NULL DEFAULT 'FARMER',
  preferred_language VARCHAR(12) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id BIGINT PRIMARY KEY,
  region VARCHAR(120),
  soil_type VARCHAR(80),
  water_availability VARCHAR(40),
  farm_size DECIMAL(10,2),
  farm_size_unit VARCHAR(20) DEFAULT 'acre',
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crops (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  season VARCHAR(80),
  soil_types VARCHAR(255),
  water_need VARCHAR(40),
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS crop_recommendation_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  crop_id BIGINT NOT NULL,
  soil_type VARCHAR(80),
  season VARCHAR(80),
  water_availability VARCHAR(40),
  region VARCHAR(120),
  explanation TEXT,
  CONSTRAINT fk_rule_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fertilizer_guides (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  crop_name VARCHAR(120) NOT NULL,
  soil_context VARCHAR(120),
  guidance TEXT NOT NULL,
  source_name VARCHAR(255),
  updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS market_prices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  crop_name VARCHAR(120) NOT NULL,
  market_name VARCHAR(160) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  source_name VARCHAR(255),
  is_sample BOOLEAN NOT NULL DEFAULT TRUE,
  observed_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_market_crop_date (crop_name, observed_at)
);

CREATE TABLE IF NOT EXISTS farm_expenses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  item_name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  crop_name VARCHAR(120),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_expense_user_date (user_id, expense_date)
);

CREATE TABLE IF NOT EXISTS equipment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  rental_rate DECIMAL(12,2),
  rate_unit VARCHAR(40),
  availability_status ENUM('AVAILABLE','UNAVAILABLE','MAINTENANCE') DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS equipment_bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  equipment_id BIGINT NOT NULL,
  requested_date DATE NOT NULL,
  location VARCHAR(255),
  status ENUM('REQUESTED','APPROVED','REJECTED','CANCELLED') DEFAULT 'REQUESTED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  item_name VARCHAR(160) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crop_activities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  crop_name VARCHAR(120),
  activity_title VARCHAR(180) NOT NULL,
  activity_date DATE NOT NULL,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS farm_financial_summary (
  user_id BIGINT PRIMARY KEY,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_finance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  role ENUM('USER','ASSISTANT') NOT NULL,
  message TEXT NOT NULL,
  language_code VARCHAR(12) DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO crops (name, season, soil_types, water_need, notes) VALUES
('Groundnut','Varies by region','Sandy, loamy, red','Low to medium','Sample record; confirm local suitability'),
('Paddy','Varies by region','Clay, loamy','High','Sample record; water and variety requirements vary'),
('Tomato','Varies by region','Well-drained loamy','Medium','Sample record; check local season and disease risk');

INSERT INTO equipment (name,description,rental_rate,rate_unit,availability_status) VALUES
('Tractor','General field preparation; verify size and attachments locally',NULL,'per day','AVAILABLE'),
('Power tiller','Small-field soil preparation; verify suitability',NULL,'per day','AVAILABLE'),
('Seed drill','Seed placement equipment; confirm crop compatibility',NULL,'per day','AVAILABLE'),
('Knapsack sprayer','For approved label-directed applications only',NULL,'per day','AVAILABLE'),
('Harvester','Availability and crop suitability must be confirmed',NULL,'per day','AVAILABLE');
