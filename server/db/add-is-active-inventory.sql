-- Add is_active column to inventory_items table
ALTER TABLE inventory_items ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER supplier;

-- Add index for better query performance
ALTER TABLE inventory_items ADD INDEX idx_is_active (is_active);

-- Mark all existing items as inactive
UPDATE inventory_items SET is_active = FALSE;

