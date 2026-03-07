-- Migration: Add support for default catalog set
-- This allows admins to define a default set that gets loaded for all users

-- Create table to store which catalog data is the default
CREATE TABLE IF NOT EXISTS default_catalog_config (
  id SERIAL PRIMARY KEY,
  config_type VARCHAR(50) NOT NULL UNIQUE, -- 'default' for now, can expand later

  -- Default catalog data (stored as JSON snapshots)
  module_types JSONB DEFAULT '[]',
  modules JSONB DEFAULT '[]',
  connections JSONB DEFAULT '[]',
  pipes JSONB DEFAULT '[]',
  dimensions JSONB DEFAULT '[]',
  formulas JSONB DEFAULT '[]',
  pumps JSONB DEFAULT '[]',

  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_default_catalog_config_updated_at BEFORE UPDATE ON default_catalog_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial default entry (empty catalogs)
INSERT INTO default_catalog_config (config_type, is_active)
VALUES ('default', true)
ON CONFLICT (config_type) DO NOTHING;

COMMENT ON TABLE default_catalog_config IS 'Stores default catalog configurations that can be loaded for new users or when catalogs are empty';
