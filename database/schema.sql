CREATE DATABASE IF NOT EXISTS calendly_clone_assignment;
USE calendly_clone_assignment;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS availability_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  day_of_week TINYINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_availability_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT chk_time_range CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_type_id INT NOT NULL,
  invitee_name VARCHAR(100) NOT NULL,
  invitee_email VARCHAR(150) NOT NULL,
  invitee_notes TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  status ENUM('scheduled', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_event FOREIGN KEY (event_type_id) REFERENCES event_types(id),
  INDEX idx_booking_slot (event_type_id, booking_date, start_time, status)
);

INSERT INTO users (id, name, email, timezone)
VALUES (1, 'Default User', 'admin@example.com', 'Asia/Kolkata')
ON DUPLICATE KEY UPDATE name = VALUES(name), timezone = VALUES(timezone);

INSERT INTO event_types (user_id, name, slug, description, duration_minutes)
VALUES
  (1, '30 Minute Meeting', '30-minute-meeting', 'A quick intro or status call.', 30),
  (1, '60 Minute Consultation', '60-minute-consultation', 'A deeper planning session.', 60)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  duration_minutes = VALUES(duration_minutes);

INSERT INTO availability_rules (user_id, day_of_week, start_time, end_time, timezone)
SELECT 1, days.day_of_week, '09:00:00', '17:00:00', 'Asia/Kolkata'
FROM (
  SELECT 1 AS day_of_week UNION ALL
  SELECT 2 UNION ALL
  SELECT 3 UNION ALL
  SELECT 4 UNION ALL
  SELECT 5
) days
WHERE NOT EXISTS (
  SELECT 1 FROM availability_rules
  WHERE user_id = 1 AND day_of_week = days.day_of_week
);

-- Sample bookings so the meetings page is pre-populated
INSERT INTO bookings (event_type_id, invitee_name, invitee_email, invitee_notes, booking_date, start_time, end_time, timezone, status)
SELECT * FROM (
  SELECT 1 AS event_type_id, 'Alice Johnson' AS invitee_name, 'alice@example.com' AS invitee_email, 'Looking forward to it!' AS invitee_notes,
         CURDATE() + INTERVAL 2 DAY AS booking_date, '10:00:00' AS start_time, '10:30:00' AS end_time, 'Asia/Kolkata' AS timezone, 'scheduled' AS status
  UNION ALL
  SELECT 2, 'Bob Smith', 'bob@example.com', 'Let us discuss the roadmap.', CURDATE() + INTERVAL 3 DAY, '14:00:00', '15:00:00', 'Asia/Kolkata', 'scheduled'
  UNION ALL
  SELECT 1, 'Carol Davis', 'carol@example.com', NULL, CURDATE() - INTERVAL 3 DAY, '11:00:00', '11:30:00', 'Asia/Kolkata', 'scheduled'
) seed
WHERE NOT EXISTS (SELECT 1 FROM bookings LIMIT 1);
