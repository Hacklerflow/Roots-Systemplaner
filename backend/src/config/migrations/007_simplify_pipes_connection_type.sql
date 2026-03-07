-- Migration: Simplify pipes connection_type to store type instead of connection name
-- Change from foreign key to catalog_connections(name) to simple type field

-- Drop the foreign key constraint
ALTER TABLE catalog_pipes DROP CONSTRAINT IF EXISTS catalog_pipes_connection_type_fkey;

-- Update existing data: map connection names to their types
UPDATE catalog_pipes p
SET connection_type = c.typ
FROM catalog_connections c
WHERE p.connection_type = c.name;

-- Add comment explaining the change
COMMENT ON COLUMN catalog_pipes.connection_type IS 'Type of connection: hydraulic, electric, or control';
