-- Migration: Make module type flexible for catalog creation
-- Allow modules to be created without requiring the module type to exist first

-- Drop the foreign key constraint
ALTER TABLE catalog_modules DROP CONSTRAINT IF EXISTS catalog_modules_modultyp_fkey;

-- Add comment explaining the change
COMMENT ON COLUMN catalog_modules.modultyp IS 'Type of module - can be null or reference a module type. Flexible to allow creation in any order.';
