-- Migration: Add catalog_formulas table
-- This table stores hydraulic calculation formulas

-- Create the formulas catalog table
CREATE TABLE IF NOT EXISTS catalog_formulas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  formula TEXT NOT NULL,
  beschreibung TEXT,
  variablen JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER update_catalog_formulas_updated_at BEFORE UPDATE ON catalog_formulas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE catalog_formulas IS 'Shared catalog of hydraulic calculation formulas';

-- Ensure only one formula can be active at a time
-- Note: This is handled in application logic, but we add an index for performance
CREATE INDEX idx_catalog_formulas_is_active ON catalog_formulas(is_active) WHERE is_active = true;
