import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Create migrations tracking table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found at:', migrationsDir);
      console.log('Creating migrations directory...\n');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✅ Migrations directory created. Place .sql files there and run again.\n');
      process.exit(0);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found in migrations directory\n');
      process.exit(0);
    }

    console.log(`Found ${files.length} migration file(s):\n`);

    for (const file of files) {
      // Check if already executed
      const result = await pool.query(
        'SELECT id, executed_at FROM schema_migrations WHERE migration_name = $1',
        [file]
      );

      if (result.rows.length > 0) {
        const executedAt = new Date(result.rows[0].executed_at).toLocaleString();
        console.log(`⏭️  ${file}`);
        console.log(`   Already executed on ${executedAt}\n`);
        continue;
      }

      console.log(`▶️  Running ${file}...`);

      // Read migration file
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Execute migration in transaction
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [file]
        );
        await pool.query('COMMIT');
        console.log(`✅ Completed ${file}\n`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`❌ Failed to execute ${file}:`);
        console.error(error.message);
        console.error('\nRolling back transaction...\n');
        throw error;
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ All migrations completed successfully!');
    console.log('═══════════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('❌ Migration failed!');
    console.error('═══════════════════════════════════════════');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

// Run migrations
runMigrations();
