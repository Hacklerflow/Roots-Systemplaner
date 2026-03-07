-- Migration: Add missing columns to catalog tables

-- Add kompatible_leitungen to catalog_connections
ALTER TABLE catalog_connections
ADD COLUMN IF NOT EXISTS kompatible_leitungen JSONB DEFAULT '[]';

-- Rename verbindungsart to connection_type in catalog_pipes (to match backend code)
ALTER TABLE catalog_pipes
RENAME COLUMN verbindungsart TO connection_type;

-- Update the foreign key constraint
ALTER TABLE catalog_pipes
DROP CONSTRAINT IF EXISTS catalog_pipes_verbindungsart_fkey;

ALTER TABLE catalog_pipes
ADD CONSTRAINT catalog_pipes_connection_type_fkey
FOREIGN KEY (connection_type) REFERENCES catalog_connections(name);

-- Update the unique constraint
ALTER TABLE catalog_pipes
DROP CONSTRAINT IF EXISTS catalog_pipes_verbindungsart_leitungstyp_dimension_key;

ALTER TABLE catalog_pipes
ADD CONSTRAINT catalog_pipes_connection_type_leitungstyp_dimension_key
UNIQUE (connection_type, leitungstyp, dimension);

-- Update the index
DROP INDEX IF EXISTS idx_catalog_pipes_verbindungsart;
CREATE INDEX idx_catalog_pipes_connection_type ON catalog_pipes(connection_type);
