-- Migration 010: Add pipe physics properties for advanced pressure drop calculations
-- Adds inner diameter, roughness, and material to catalog_pipes

-- Add new columns for physical properties
ALTER TABLE catalog_pipes
  ADD COLUMN IF NOT EXISTS innendurchmesser_mm DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS wandrauhigkeit_mm DECIMAL(10,6) DEFAULT 0.001,
  ADD COLUMN IF NOT EXISTS material VARCHAR(100);

-- Update existing Geberit Mapress Therm pipes with real data
-- Source: Geberit technical documentation
UPDATE catalog_pipes SET
  innendurchmesser_mm = CASE dimension
    WHEN 'DN15' THEN 14.5
    WHEN 'DN20' THEN 18.0
    WHEN 'DN25' THEN 22.9
    WHEN 'DN32' THEN 29.5
    WHEN 'DN40' THEN 37.3
    WHEN 'DN50' THEN 48.0
    WHEN 'DN65' THEN 61.5
    WHEN 'DN80' THEN 77.0
    ELSE NULL
  END,
  wandrauhigkeit_mm = 0.001, -- Press-Stahl verzinkt: ~1 μm
  material = 'Press-Stahl verzinkt'
WHERE leitungstyp = 'Geberit Mapress Therm';

-- Add comment for documentation
COMMENT ON COLUMN catalog_pipes.innendurchmesser_mm IS 'Inner diameter in mm for pressure drop calculation';
COMMENT ON COLUMN catalog_pipes.wandrauhigkeit_mm IS 'Absolute wall roughness in mm (k in Darcy-Weisbach)';
COMMENT ON COLUMN catalog_pipes.material IS 'Pipe material (e.g., Press-Stahl verzinkt, Kupfer, PE-Xa)';
