-- Add new_arrival flag to products for main-page New Arrivals section
ALTER TABLE products
ADD COLUMN IF NOT EXISTS new_arrival BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(new_arrival);
