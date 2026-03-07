-- Migration: Add catalog_pumps table
-- This table stores pump catalog data

CREATE TABLE IF NOT EXISTS catalog_pumps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hersteller VARCHAR(255),
  modell VARCHAR(255),
  foerdermenge_m3h DECIMAL(10,2),
  foerderhoehe_m DECIMAL(10,2),
  leistung_kw DECIMAL(10,3),
  spannung VARCHAR(50),
  anschlussgroesse VARCHAR(50),
  preis DECIMAL(10,2),
  notizen TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, hersteller, modell)
);

-- Add trigger for updated_at
CREATE TRIGGER update_catalog_pumps_updated_at BEFORE UPDATE ON catalog_pumps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE catalog_pumps IS 'Shared catalog of pumps';

-- Add index
CREATE INDEX idx_catalog_pumps_hersteller ON catalog_pumps(hersteller);
