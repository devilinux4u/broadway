-- Remove product_id column from carts table if it exists
-- This fixes the issue where carts table has product_id which should only be in cart_items

DO $$
BEGIN
    -- Check if the column exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'carts' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE carts DROP COLUMN product_id;
    END IF;
END $$;
