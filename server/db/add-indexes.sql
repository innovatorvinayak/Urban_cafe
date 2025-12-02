-- Additional performance indexes for faster queries
-- Run this to add performance optimizations

-- Menu items optimization
ALTER TABLE menu_items ADD INDEX idx_category_available (category_id, is_available);
ALTER TABLE menu_items ADD INDEX idx_name (name);

-- Order items optimization  
ALTER TABLE order_items ADD INDEX idx_menu_item_order (menu_item_id, order_id);

-- Orders optimization
ALTER TABLE orders ADD INDEX idx_status_created (status, created_at);
ALTER TABLE orders ADD INDEX idx_payment_status (payment_status);

-- Customers optimization
ALTER TABLE customers ADD INDEX idx_name (name);

-- Inventory optimization
ALTER TABLE inventory_items ADD INDEX idx_category_stock (category, current_stock);

-- Composite indexes for common queries
CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC);
CREATE INDEX idx_order_items_combined ON order_items(order_id, menu_item_id, status);

