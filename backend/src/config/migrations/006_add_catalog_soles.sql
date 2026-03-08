-- Migration: Add catalog_soles table
-- This table stores sole (heat transfer fluid) configurations

-- Create the soles catalog table
CREATE TABLE IF NOT EXISTS catalog_soles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  frostschutzmittel VARCHAR(255),
  notiz TEXT,
  faktor DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER update_catalog_soles_updated_at BEFORE UPDATE ON catalog_soles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE catalog_soles IS 'Shared catalog of heat transfer fluids (Sole) with calculation factors';

-- Insert default soles
INSERT INTO catalog_soles (name, frostschutzmittel, notiz, faktor) VALUES
  ('Wasser', 'Keins', 'Reines Wasser ohne Frostschutz', 1.0),
  ('Glykol 25%', 'Ethylenglykol', '25% Glykol-Wasser-Gemisch, Frostschutz bis -12°C', 1.08),
  ('Glykol 30%', 'Ethylenglykol', '30% Glykol-Wasser-Gemisch, Frostschutz bis -15°C', 1.10),
  ('Glykol 35%', 'Ethylenglykol', '35% Glykol-Wasser-Gemisch, Frostschutz bis -18°C', 1.13)
ON CONFLICT (name) DO NOTHING;
