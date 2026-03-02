import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database with schema
 */
async function initDatabase() {
  console.log('🔧 Initializing database...');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database schema created successfully');

    // Insert default data
    await insertDefaultData();

    console.log('✅ Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Insert default catalog data
 */
async function insertDefaultData() {
  console.log('📦 Inserting default catalog data...');

  // Insert default module types
  await pool.query(`
    INSERT INTO catalog_module_types (name, kategorie, berechnungsart, einheit) VALUES
    ('Wärmepumpe', 'Erzeugung', 'stueck', 'Stk'),
    ('Rückkühler', 'Erzeugung', 'stueck', 'Stk'),
    ('Speicher', 'Speicherung', 'stueck', 'Stk'),
    ('Verteiler', 'Verteilung', 'stueck', 'Stk'),
    ('Erdwärmekollektor', 'Quellsystem', 'pro_einheit', 'm²'),
    ('Erdsonde', 'Quellsystem', 'pro_einheit', 'm'),
    ('Rohrleitung', 'Installation', 'pro_einheit', 'm')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Insert default connection types
  await pool.query(`
    INSERT INTO catalog_connections (name, kuerzel, typ) VALUES
    ('Flansch DN25', 'FDN25', 'hydraulisch'),
    ('Flansch DN32', 'FDN32', 'hydraulisch'),
    ('Flansch DN40', 'FDN40', 'hydraulisch'),
    ('Flansch DN50', 'FDN50', 'hydraulisch'),
    ('Flansch DN65', 'FDN65', 'hydraulisch'),
    ('Flansch DN80', 'FDN80', 'hydraulisch'),
    ('Schweißring GW25', 'GW25', 'hydraulisch'),
    ('230V', '230V', 'elektrisch'),
    ('400V', '400V', 'elektrisch'),
    ('Kälte 230V', 'K230V', 'elektrisch'),
    ('Kälte 400V', 'K400V', 'elektrisch'),
    ('Modbus', 'MBUS', 'steuerung'),
    ('CAN', 'CAN', 'steuerung'),
    ('RS485', 'RS485', 'steuerung')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Insert default dimensions
  await pool.query(`
    INSERT INTO catalog_dimensions (name, value) VALUES
    ('DN25', 'DN25'),
    ('DN32', 'DN32'),
    ('DN40', 'DN40'),
    ('DN50', 'DN50'),
    ('DN65', 'DN65'),
    ('DN80', 'DN80'),
    ('5x2.5mm²', '5x2.5mm²'),
    ('5x4mm²', '5x4mm²')
    ON CONFLICT (name) DO NOTHING;
  `);

  console.log('✅ Default catalog data inserted');
}

// Run initialization
initDatabase();
