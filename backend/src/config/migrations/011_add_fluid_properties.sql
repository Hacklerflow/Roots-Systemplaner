-- Migration 011: Add fluid properties for advanced pressure drop calculations
-- Adds density, dynamic viscosity, specific heat capacity, and temperature to catalog_soles

-- Add new columns for fluid properties
ALTER TABLE catalog_soles
  ADD COLUMN IF NOT EXISTS dichte_kg_m3 DECIMAL(10,2) DEFAULT 1000.0,
  ADD COLUMN IF NOT EXISTS dyn_viskositaet_pas DECIMAL(12,8),
  ADD COLUMN IF NOT EXISTS waermekapazitaet_j_kgk DECIMAL(10,2) DEFAULT 4180.0,
  ADD COLUMN IF NOT EXISTS waermeleitfaehigkeit_w_mk DECIMAL(10,4),
  ADD COLUMN IF NOT EXISTS temperatur_c DECIMAL(5,1) DEFAULT 20.0;

-- Update existing fluids with standard water properties at 20°C
UPDATE catalog_soles SET
  dichte_kg_m3 = 998.2,
  dyn_viskositaet_pas = 0.001002,
  waermekapazitaet_j_kgk = 4182.0,
  waermeleitfaehigkeit_w_mk = 0.598,
  temperatur_c = 20.0
WHERE name ILIKE '%wasser%' OR name = 'Water';

-- Update heating water at 60°C (if exists)
UPDATE catalog_soles SET
  dichte_kg_m3 = 983.2,
  dyn_viskositaet_pas = 0.000467,
  waermekapazitaet_j_kgk = 4185.0,
  waermeleitfaehigkeit_w_mk = 0.651,
  temperatur_c = 60.0
WHERE name ILIKE '%heizungswasser%' OR (name ILIKE '%wasser%' AND name ILIKE '%60%');

-- Update propylene glycol mixtures (if exists)
UPDATE catalog_soles SET
  dichte_kg_m3 = 1020.0,
  dyn_viskositaet_pas = 0.00230,
  waermekapazitaet_j_kgk = 4000.0,
  waermeleitfaehigkeit_w_mk = 0.45,
  temperatur_c = 20.0
WHERE name ILIKE '%glykol%' OR name ILIKE '%glycol%';

-- Add comments for documentation
COMMENT ON COLUMN catalog_soles.dichte_kg_m3 IS 'Density ρ in kg/m³';
COMMENT ON COLUMN catalog_soles.dyn_viskositaet_pas IS 'Dynamic viscosity μ in Pa·s';
COMMENT ON COLUMN catalog_soles.waermekapazitaet_j_kgk IS 'Specific heat capacity cp in J/(kg·K)';
COMMENT ON COLUMN catalog_soles.waermeleitfaehigkeit_w_mk IS 'Thermal conductivity λ in W/(m·K)';
COMMENT ON COLUMN catalog_soles.temperatur_c IS 'Reference temperature in °C';
