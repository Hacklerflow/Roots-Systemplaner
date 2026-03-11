-- Migration 012: Add calculation methods table
-- Allows users to select between different pressure drop calculation algorithms

CREATE TABLE IF NOT EXISTS catalog_calculation_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  beschreibung TEXT,
  algorithmus VARCHAR(50) NOT NULL,
  parameter JSONB DEFAULT '{}',
  genauigkeit VARCHAR(50),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert calculation methods
INSERT INTO catalog_calculation_methods (name, beschreibung, algorithmus, genauigkeit, is_active, parameter) VALUES
(
  'Einfache Formel',
  'Standard Template-basierte Druckverlustberechnung mit {{Variablen}}. Verwendet für Abwärtskompatibilität.',
  'formula',
  'Abhängig von Formel',
  false,
  '{}'
),
(
  'Haaland (empfohlen)',
  'Explizite Haaland-Näherung der Colebrook-White Gleichung. Beste Balance zwischen Genauigkeit und Performance.',
  'haaland',
  '±1.4%',
  true,
  '{}'
),
(
  'Colebrook-White (exakt)',
  'Iterative Colebrook-White Gleichung. Höchste Genauigkeit, aber rechenintensiver.',
  'colebrook-white',
  '±0.1%',
  false,
  '{"maxIterations": 100, "tolerance": 1e-6}'
),
(
  'Swamee-Jain',
  'Explizite Swamee-Jain Näherung. Schnell, geringfügig weniger genau als Haaland.',
  'swamee-jain',
  '±2%',
  false,
  '{}'
),
(
  'Churchill',
  'Universelle Churchill Gleichung. Gültig für laminar und turbulent. Gut für Übergangsbereich.',
  'churchill',
  '±2-3%',
  false,
  '{}'
);

-- Create index for fast active method lookup
CREATE INDEX IF NOT EXISTS idx_calculation_methods_active ON catalog_calculation_methods(is_active);

-- Add comment for documentation
COMMENT ON TABLE catalog_calculation_methods IS 'Available pressure drop calculation algorithms';
COMMENT ON COLUMN catalog_calculation_methods.algorithmus IS 'Algorithm identifier: formula, haaland, colebrook-white, swamee-jain, churchill';
COMMENT ON COLUMN catalog_calculation_methods.genauigkeit IS 'Accuracy description (e.g., ±1.4%)';
COMMENT ON COLUMN catalog_calculation_methods.is_active IS 'Only one method should be active at a time';
COMMENT ON COLUMN catalog_calculation_methods.parameter IS 'Algorithm-specific parameters in JSON format';

-- Trigger to ensure only one method is active
CREATE OR REPLACE FUNCTION ensure_single_active_calculation_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE catalog_calculation_methods
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_active_calculation_method ON catalog_calculation_methods;
CREATE TRIGGER trg_single_active_calculation_method
  BEFORE INSERT OR UPDATE ON catalog_calculation_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_calculation_method();
