-- Expenses tracking table
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  category ENUM('rent', 'electricity', 'water', 'gas', 'salary', 'supplies', 'maintenance', 'marketing', 'transportation', 'other') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi', 'other') NULL,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (date),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Insert some sample expense categories for reference
INSERT INTO expenses (date, category, description, amount, payment_method, notes) VALUES
('2024-12-01', 'rent', 'Monthly shop rent', 15000.00, 'upi', 'December 2024'),
('2024-12-01', 'electricity', 'Electricity bill', 3500.00, 'upi', 'November usage'),
('2024-12-01', 'salary', 'Staff salaries', 25000.00, 'cash', 'December payment')
ON DUPLICATE KEY UPDATE date=date;

