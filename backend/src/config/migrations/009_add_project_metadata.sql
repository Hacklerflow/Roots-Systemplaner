-- Add project metadata fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS beheizte_flaeche DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS anzahl_wohnungen INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS anzahl_stockwerke INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS eigentuemer VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS odoo_kontakt_link TEXT;

-- Add comments
COMMENT ON COLUMN projects.beheizte_flaeche IS 'Heated area in square meters';
COMMENT ON COLUMN projects.anzahl_wohnungen IS 'Number of apartments';
COMMENT ON COLUMN projects.anzahl_stockwerke IS 'Number of floors';
COMMENT ON COLUMN projects.eigentuemer IS 'Owner name';
COMMENT ON COLUMN projects.odoo_kontakt_link IS 'Link to Odoo contact';
