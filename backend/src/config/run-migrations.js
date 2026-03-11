import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
async function runMigrations() {
  console.log('🔧 Running database migrations...');

  try {
    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, etc.)

    console.log(`📁 Found ${files.length} migration files`);

    // Get already executed migrations
    const result = await pool.query('SELECT migration_name FROM schema_migrations');
    const executedMigrations = new Set(result.rows.map(r => r.migration_name));

    // Execute pending migrations
    let executedCount = 0;
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`⚙️  Running migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      try {
        // Execute migration
        await pool.query(migrationSQL);

        // Record migration
        await pool.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [file]
        );

        console.log(`✅ Migration ${file} completed`);
        executedCount++;
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error.message);
        throw error;
      }
    }

    if (executedCount === 0) {
      console.log('✅ No new migrations to run');
    } else {
      console.log(`✅ Successfully executed ${executedCount} migration(s)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
