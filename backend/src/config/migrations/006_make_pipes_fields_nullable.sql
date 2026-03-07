-- Migration: Make pipe fields nullable for flexible catalog creation
-- Allow users to create pipes without all fields defined

-- Make leitungstyp nullable
ALTER TABLE catalog_pipes ALTER COLUMN leitungstyp DROP NOT NULL;

-- Make dimension nullable
ALTER TABLE catalog_pipes ALTER COLUMN dimension DROP NOT NULL;

COMMENT ON TABLE catalog_pipes IS 'Pipes catalog - connection_type, leitungstyp, and dimension can be null to allow flexible creation order';
