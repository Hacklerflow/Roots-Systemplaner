-- Migration: Add Set-based Catalog System
-- Version: 1.0
-- Date: 2026-03-06
-- Description: Introduces catalog sets for user-specific catalog management

-- ============================================================================
-- Step 1: Add catalog_formulas table (missing from original schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalog_formulas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  formula TEXT NOT NULL,
  beschreibung TEXT,
  variablen JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop and recreate trigger to be idempotent
DROP TRIGGER IF EXISTS update_catalog_formulas_updated_at ON catalog_formulas;
CREATE TRIGGER update_catalog_formulas_updated_at
BEFORE UPDATE ON catalog_formulas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Step 2: Create catalog_sets table
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalog_sets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- JSONB data for complete catalog snapshots
  data JSONB NOT NULL DEFAULT '{
    "module_types": [],
    "modules": [],
    "connections": [],
    "pipes": [],
    "dimensions": [],
    "formulas": []
  }'::jsonb,

  version VARCHAR(20) DEFAULT '1.0'
);

-- Only one default set allowed
CREATE UNIQUE INDEX idx_catalog_sets_single_default
  ON catalog_sets(is_default)
  WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_catalog_sets_created_by ON catalog_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_catalog_sets_data_gin ON catalog_sets USING gin(data);

DROP TRIGGER IF EXISTS update_catalog_sets_updated_at ON catalog_sets;
CREATE TRIGGER update_catalog_sets_updated_at
BEFORE UPDATE ON catalog_sets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Step 3: Create user_active_sets table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_active_sets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  set_id INTEGER REFERENCES catalog_sets(id) ON DELETE SET NULL,
  activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_active_sets_set_id ON user_active_sets(set_id);

DROP TRIGGER IF EXISTS update_user_active_sets_updated_at ON user_active_sets;
CREATE TRIGGER update_user_active_sets_updated_at
BEFORE UPDATE ON user_active_sets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Step 4: Create BASIC Set from existing catalog data
-- ============================================================================

INSERT INTO catalog_sets (name, description, is_default, data, version)
SELECT
  'BASIC',
  'Standard-Katalog mit allen Grundmodulen, Verbindungsarten und Leitungen',
  true,
  jsonb_build_object(
    'module_types', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', name,
          'kategorie', kategorie,
          'berechnungsart', berechnungsart,
          'einheit', einheit
        )
      ) FROM catalog_module_types
    ), '[]'::jsonb),

    'modules', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'modultyp', modultyp,
          'hersteller', hersteller,
          'abmessungen', abmessungen,
          'gewicht_kg', gewicht_kg,
          'leistung_kw', leistung_kw,
          'volumen_l', volumen_l,
          'preis', preis,
          'eingaenge', eingaenge,
          'ausgaenge', ausgaenge
        )
      ) FROM catalog_modules
    ), '[]'::jsonb),

    'connections', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'kuerzel', kuerzel,
          'typ', typ
        )
      ) FROM catalog_connections
    ), '[]'::jsonb),

    'pipes', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'verbindungsart', verbindungsart,
          'leitungstyp', leitungstyp,
          'dimension', dimension,
          'preis_pro_meter', preis_pro_meter
        )
      ) FROM catalog_pipes
    ), '[]'::jsonb),

    'dimensions', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'value', value
        )
      ) FROM catalog_dimensions
    ), '[]'::jsonb),

    'formulas', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'formula', formula,
          'beschreibung', beschreibung,
          'variablen', variablen,
          'is_active', is_active
        )
      ) FROM catalog_formulas
    ), '[]'::jsonb)
  ),
  '1.0'
WHERE NOT EXISTS (SELECT 1 FROM catalog_sets WHERE name = 'BASIC');

-- ============================================================================
-- Step 5: Assign BASIC Set to all existing users
-- ============================================================================

INSERT INTO user_active_sets (user_id, set_id)
SELECT u.id, cs.id
FROM users u
CROSS JOIN catalog_sets cs
WHERE cs.is_default = true
  AND NOT EXISTS (
    SELECT 1 FROM user_active_sets WHERE user_id = u.id
  );

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE catalog_sets IS 'Catalog set definitions (templates) with complete catalog snapshots in JSONB format';
COMMENT ON TABLE user_active_sets IS 'Maps users to their currently active catalog set';
COMMENT ON TABLE catalog_formulas IS 'Formula definitions for hydraulic and thermal calculations';
COMMENT ON COLUMN catalog_sets.data IS 'Complete snapshot of all catalog data (module_types, modules, connections, pipes, dimensions, formulas)';
COMMENT ON COLUMN catalog_sets.is_default IS 'Only one set can be marked as default (BASIC set)';
