-- Lösche alle Katalog-Datensätze
-- ACHTUNG: Dies löscht ALLE Daten in den Katalog-Tabellen!

BEGIN;

-- Lösche in der richtigen Reihenfolge (wegen Foreign Keys)
DELETE FROM catalog_modules;
DELETE FROM catalog_connections;
DELETE FROM catalog_pipes;
DELETE FROM catalog_dimensions;
DELETE FROM catalog_module_types;
DELETE FROM catalog_formulas;

-- Optional: Auch catalog_sets leeren
DELETE FROM catalog_sets;

COMMIT;

-- Zeige Anzahl verbleibender Datensätze
SELECT 'catalog_modules' as table_name, COUNT(*) as count FROM catalog_modules
UNION ALL
SELECT 'catalog_connections', COUNT(*) FROM catalog_connections
UNION ALL
SELECT 'catalog_pipes', COUNT(*) FROM catalog_pipes
UNION ALL
SELECT 'catalog_dimensions', COUNT(*) FROM catalog_dimensions
UNION ALL
SELECT 'catalog_module_types', COUNT(*) FROM catalog_module_types
UNION ALL
SELECT 'catalog_formulas', COUNT(*) FROM catalog_formulas
UNION ALL
SELECT 'catalog_sets', COUNT(*) FROM catalog_sets;
