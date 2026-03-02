/**
 * Import Script for Initial Catalog Data (Version 1.0.0)
 *
 * Imports all catalog data from the frontend into the database:
 * - Module Types
 * - Connections (Verbindungsarten)
 * - Pipes (Leitungen)
 * - Dimensions
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Initial data from frontend v1.0.0

const modultypen = [
  { name: 'Wärmepumpe', kategorie: 'Wärmeerzeugung', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Rückkühler', kategorie: 'Wärmeerzeugung', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Pufferspeicher', kategorie: 'Speicher', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Solarthermie', kategorie: 'Wärmeerzeugung', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Verbraucher', kategorie: 'Verbraucher', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Hydraulische Weiche', kategorie: 'Hydraulik', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Heizkreisverteiler', kategorie: 'Hydraulik', berechnungsart: 'pro_unit', einheit: '' },
  { name: 'Tiefenbohrung', kategorie: 'Wärmequelle', berechnungsart: 'pro_einheit', einheit: 'lm' },
];

const verbindungsarten = [
  // Hydraulische Verbindungsarten
  { name: 'DN25 Flanschverbindung', kuerzel: 'FL25', typ: 'hydraulic' },
  { name: 'DN32 Flanschverbindung', kuerzel: 'FL32', typ: 'hydraulic' },
  { name: 'DN50 Flanschverbindung', kuerzel: 'FL50', typ: 'hydraulic' },
  { name: 'DN65 Flanschverbindung', kuerzel: 'FL65', typ: 'hydraulic' },
  { name: 'DN80 Flanschverbindung', kuerzel: 'FL80', typ: 'hydraulic' },
  { name: 'DN50 Schraubverbindung', kuerzel: 'SR50', typ: 'hydraulic' },
  { name: 'DN25 Gewindeverbindung (AG/IG)', kuerzel: 'GW25', typ: 'hydraulic' },

  // Elektrische Verbindungsarten
  { name: '230V Steckverbindung', kuerzel: '230V', typ: 'electric' },
  { name: '400V Starkstrom Stecker', kuerzel: '400V', typ: 'electric' },
  { name: '230V Klemmenverbindung', kuerzel: 'K230V', typ: 'electric' },
  { name: '400V Klemmenverbindung', kuerzel: 'K400V', typ: 'electric' },

  // Steuerungs-Verbindungsarten
  { name: 'Modbus Klemmenverbindung', kuerzel: 'MODBUS', typ: 'control' },
  { name: 'CAN-Bus Steckverbindung', kuerzel: 'CAN', typ: 'control' },
  { name: 'RS485 Klemmenverbindung', kuerzel: 'RS485', typ: 'control' },
];

const leitungen = [
  // Hydraulische Leitungen
  { verbindungsart: 'DN25 Flanschverbindung', leitungstyp: 'Kupfer', dimension: 'DN25', preis_pro_meter: 12.50 },
  { verbindungsart: 'DN32 Flanschverbindung', leitungstyp: 'Kupfer', dimension: 'DN32', preis_pro_meter: 14.80 },
  { verbindungsart: 'DN50 Flanschverbindung', leitungstyp: 'Stahl verzinkt', dimension: 'DN50', preis_pro_meter: 18.50 },
  { verbindungsart: 'DN65 Flanschverbindung', leitungstyp: 'Stahl verzinkt', dimension: 'DN65', preis_pro_meter: 24.90 },
  { verbindungsart: 'DN80 Flanschverbindung', leitungstyp: 'Stahl verzinkt', dimension: 'DN80', preis_pro_meter: 32.00 },
  { verbindungsart: 'DN50 Schraubverbindung', leitungstyp: 'Stahl verzinkt', dimension: 'DN50', preis_pro_meter: 18.50 },
  { verbindungsart: 'DN25 Gewindeverbindung (AG/IG)', leitungstyp: 'Kupfer', dimension: 'DN25', preis_pro_meter: 12.50 },

  // Elektrische Leitungen
  { verbindungsart: '230V Steckverbindung', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 3x1.5mm²', preis_pro_meter: 2.50 },
  { verbindungsart: '230V Steckverbindung', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 3x2.5mm²', preis_pro_meter: 3.80 },
  { verbindungsart: '230V Klemmenverbindung', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 3x1.5mm²', preis_pro_meter: 2.50 },
  { verbindungsart: '230V Klemmenverbindung', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 3x2.5mm²', preis_pro_meter: 3.80 },
  { verbindungsart: '400V Starkstrom Stecker', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 5x2.5mm²', preis_pro_meter: 5.20 },
  { verbindungsart: '400V Starkstrom Stecker', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 5x4mm²', preis_pro_meter: 7.90 },
  { verbindungsart: '400V Klemmenverbindung', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 5x2.5mm²', preis_pro_meter: 5.20 },
  { verbindungsart: '400V Klemmenverbindung', leitungstyp: 'Kupfer (PVC)', dimension: 'NYM 5x4mm²', preis_pro_meter: 7.90 },

  // Steuerungsleitungen
  { verbindungsart: 'Modbus Klemmenverbindung', leitungstyp: 'Kupfer geschirmt', dimension: 'Modbus (2x2x0.8)', preis_pro_meter: 4.50 },
  { verbindungsart: 'CAN-Bus Steckverbindung', leitungstyp: 'Kupfer geschirmt', dimension: 'CAN-Bus (2x2x0.8)', preis_pro_meter: 3.20 },
  { verbindungsart: 'RS485 Klemmenverbindung', leitungstyp: 'Kupfer geschirmt', dimension: 'Modbus (2x2x0.8)', preis_pro_meter: 4.50 },
  { verbindungsart: 'RS485 Klemmenverbindung', leitungstyp: 'Kupfer geschirmt', dimension: 'CAN-Bus (2x2x0.8)', preis_pro_meter: 3.20 },
];

const dimensionen = [
  // Hydraulische Dimensionen
  { name: 'DN25', value: 'hydraulic' },
  { name: 'DN32', value: 'hydraulic' },
  { name: 'DN50', value: 'hydraulic' },
  { name: 'DN65', value: 'hydraulic' },
  { name: 'DN80', value: 'hydraulic' },

  // Elektrische Dimensionen
  { name: 'NYM 3x1.5mm²', value: 'electric' },
  { name: 'NYM 3x2.5mm²', value: 'electric' },
  { name: 'NYM 5x2.5mm²', value: 'electric' },
  { name: 'NYM 5x4mm²', value: 'electric' },

  // Steuerungs-Dimensionen
  { name: 'Modbus (2x2x0.8)', value: 'control' },
  { name: 'CAN-Bus (2x2x0.8)', value: 'control' },
];

async function importData() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting import of initial catalog data...\n');

    await client.query('BEGIN');

    // 1. Import Module Types
    console.log('📦 Importing Module Types...');
    for (const type of modultypen) {
      await client.query(
        `INSERT INTO catalog_module_types (name, kategorie, berechnungsart, einheit)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING`,
        [type.name, type.kategorie, type.berechnungsart, type.einheit]
      );
    }
    console.log(`✅ Imported ${modultypen.length} module types\n`);

    // 2. Import Connections (Verbindungsarten)
    console.log('🔌 Importing Connection Types...');
    for (const verb of verbindungsarten) {
      await client.query(
        `INSERT INTO catalog_connections (name, kuerzel, typ)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [verb.name, verb.kuerzel, verb.typ]
      );
    }
    console.log(`✅ Imported ${verbindungsarten.length} connection types\n`);

    // 3. Import Dimensions
    console.log('📏 Importing Dimensions...');
    for (const dim of dimensionen) {
      await client.query(
        `INSERT INTO catalog_dimensions (name, value)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [dim.name, dim.value]
      );
    }
    console.log(`✅ Imported ${dimensionen.length} dimensions\n`);

    // 4. Import Pipes (Leitungen)
    console.log('🔧 Importing Pipe Types...');
    for (const pipe of leitungen) {
      await client.query(
        `INSERT INTO catalog_pipes (verbindungsart, leitungstyp, dimension, preis_pro_meter)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (verbindungsart, leitungstyp, dimension) DO NOTHING`,
        [pipe.verbindungsart, pipe.leitungstyp, pipe.dimension, pipe.preis_pro_meter]
      );
    }
    console.log(`✅ Imported ${leitungen.length} pipe types\n`);

    await client.query('COMMIT');

    console.log('🎉 Import completed successfully!\n');

    // Print summary
    const summaryQueries = [
      { name: 'Module Types', query: 'SELECT COUNT(*) FROM catalog_module_types' },
      { name: 'Connections', query: 'SELECT COUNT(*) FROM catalog_connections' },
      { name: 'Dimensions', query: 'SELECT COUNT(*) FROM catalog_dimensions' },
      { name: 'Pipes', query: 'SELECT COUNT(*) FROM catalog_pipes' },
    ];

    console.log('📊 Database Summary:');
    console.log('==================');
    for (const { name, query } of summaryQueries) {
      const result = await client.query(query);
      console.log(`${name}: ${result.rows[0].count}`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run import
importData()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
