import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "admin" or "user"' });
  }

  // Prevent user from removing their own admin role
  if (parseInt(id) === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'Cannot remove your own admin role' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  // Prevent user from deleting themselves
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============================================
// DATABASE TOOLS
// ============================================

/**
 * DELETE /api/admin/database/clear-catalogs
 * Clear all catalog data
 */
router.delete('/database/clear-catalogs', async (req, res) => {
  try {
    await pool.query('BEGIN');

    // Delete in correct order (respecting foreign keys)
    await pool.query('DELETE FROM catalog_modules');
    await pool.query('DELETE FROM catalog_pipes');
    await pool.query('DELETE FROM catalog_sets');
    await pool.query('DELETE FROM catalog_module_types');
    await pool.query('DELETE FROM catalog_connections');
    await pool.query('DELETE FROM catalog_dimensions');
    await pool.query('DELETE FROM catalog_formulas');

    await pool.query('COMMIT');

    res.json({ message: 'All catalog data cleared successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error clearing catalog data:', error);
    res.status(500).json({ error: 'Failed to clear catalog data' });
  }
});

/**
 * POST /api/admin/database/initialize-defaults
 * Initialize default catalog data
 */
router.post('/database/initialize-defaults', async (req, res) => {
  try {
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
      ON CONFLICT (name) DO NOTHING
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
      ON CONFLICT (name) DO NOTHING
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
      ON CONFLICT (name) DO NOTHING
    `);

    res.json({ message: 'Default catalog data initialized successfully' });
  } catch (error) {
    console.error('Error initializing default data:', error);
    res.status(500).json({ error: 'Failed to initialize default data' });
  }
});

/**
 * GET /api/admin/database/stats
 * Get database statistics
 */
router.get('/database/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM catalog_modules) as modules,
        (SELECT COUNT(*) FROM catalog_connections) as connections,
        (SELECT COUNT(*) FROM catalog_pipes) as pipes,
        (SELECT COUNT(*) FROM catalog_dimensions) as dimensions,
        (SELECT COUNT(*) FROM catalog_module_types) as module_types,
        (SELECT COUNT(*) FROM catalog_formulas) as formulas,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM projects) as projects
    `);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ error: 'Failed to fetch database stats' });
  }
});

// ============================================
// SYSTEM SETTINGS
// ============================================

/**
 * GET /api/admin/settings
 * Get system settings
 */
router.get('/settings', async (req, res) => {
  try {
    // For now, return default settings
    // In the future, store these in a settings table
    const settings = {
      appName: 'Roots Configurator',
      appVersion: '1.0.0',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/admin/settings
 * Update system settings
 */
router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body;

    // TODO: Store settings in database
    // For now, just return success

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============================================
// DEFAULT CATALOG SET MANAGEMENT
// ============================================

/**
 * POST /api/admin/default-catalog/save-current
 * Save current catalog state as default
 */
router.post('/default-catalog/save-current', async (req, res) => {
  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch all current catalog data
      const [moduleTypes, modules, connections, pipes, dimensions, formulas, pumps] = await Promise.all([
        client.query('SELECT * FROM catalog_module_types ORDER BY id'),
        client.query('SELECT * FROM catalog_modules ORDER BY id'),
        client.query('SELECT * FROM catalog_connections ORDER BY id'),
        client.query('SELECT * FROM catalog_pipes ORDER BY id'),
        client.query('SELECT * FROM catalog_dimensions ORDER BY id'),
        client.query('SELECT * FROM catalog_formulas ORDER BY id'),
        client.query('SELECT * FROM catalog_pumps ORDER BY id'),
      ]);

      // Update default config with current data
      await client.query(`
        UPDATE default_catalog_config
        SET
          module_types = $1,
          modules = $2,
          connections = $3,
          pipes = $4,
          dimensions = $5,
          formulas = $6,
          pumps = $7,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $8
        WHERE config_type = 'default'
      `, [
        JSON.stringify(moduleTypes.rows),
        JSON.stringify(modules.rows),
        JSON.stringify(connections.rows),
        JSON.stringify(pipes.rows),
        JSON.stringify(dimensions.rows),
        JSON.stringify(formulas.rows),
        JSON.stringify(pumps.rows),
        req.user.id,
      ]);

      await client.query('COMMIT');

      res.json({
        message: 'Default catalog set saved successfully',
        counts: {
          module_types: moduleTypes.rows.length,
          modules: modules.rows.length,
          connections: connections.rows.length,
          pipes: pipes.rows.length,
          dimensions: dimensions.rows.length,
          formulas: formulas.rows.length,
          pumps: pumps.rows.length,
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving default catalog:', error);
    res.status(500).json({ error: 'Failed to save default catalog' });
  }
});

/**
 * POST /api/admin/default-catalog/load
 * Load default catalog set into current catalogs
 */
router.post('/default-catalog/load', async (req, res) => {
  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get default config
      const configResult = await client.query(`
        SELECT * FROM default_catalog_config
        WHERE config_type = 'default' AND is_active = true
      `);

      if (configResult.rows.length === 0) {
        throw new Error('No default catalog configuration found');
      }

      const config = configResult.rows[0];

      // Clear existing catalogs
      await client.query('DELETE FROM catalog_pipes');
      await client.query('DELETE FROM catalog_connections');
      await client.query('DELETE FROM catalog_modules');
      await client.query('DELETE FROM catalog_module_types');
      await client.query('DELETE FROM catalog_dimensions');
      await client.query('DELETE FROM catalog_formulas');
      await client.query('DELETE FROM catalog_pumps');

      let counts = {
        module_types: 0,
        modules: 0,
        connections: 0,
        pipes: 0,
        dimensions: 0,
        formulas: 0,
        pumps: 0,
      };

      // Insert module types
      if (config.module_types && config.module_types.length > 0) {
        for (const mt of config.module_types) {
          await client.query(`
            INSERT INTO catalog_module_types (name, kategorie, berechnungsart, einheit)
            VALUES ($1, $2, $3, $4)
          `, [mt.name, mt.kategorie, mt.berechnungsart, mt.einheit]);
          counts.module_types++;
        }
      }

      // Insert connections
      if (config.connections && config.connections.length > 0) {
        for (const conn of config.connections) {
          await client.query(`
            INSERT INTO catalog_connections (name, kuerzel, typ, kompatible_leitungen)
            VALUES ($1, $2, $3, $4)
          `, [conn.name, conn.kuerzel, conn.typ, conn.kompatible_leitungen || '[]']);
          counts.connections++;
        }
      }

      // Insert modules
      if (config.modules && config.modules.length > 0) {
        for (const mod of config.modules) {
          await client.query(`
            INSERT INTO catalog_modules (name, modultyp, hersteller, abmessungen, gewicht_kg, leistung_kw, volumen_l, preis, eingaenge, ausgaenge)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [mod.name, mod.modultyp, mod.hersteller, mod.abmessungen, mod.gewicht_kg, mod.leistung_kw, mod.volumen_l, mod.preis, mod.eingaenge || '[]', mod.ausgaenge || '[]']);
          counts.modules++;
        }
      }

      // Insert pipes
      if (config.pipes && config.pipes.length > 0) {
        for (const pipe of config.pipes) {
          await client.query(`
            INSERT INTO catalog_pipes (connection_type, leitungstyp, dimension, preis_pro_meter)
            VALUES ($1, $2, $3, $4)
          `, [pipe.connection_type, pipe.leitungstyp, pipe.dimension, pipe.preis_pro_meter]);
          counts.pipes++;
        }
      }

      // Insert dimensions
      if (config.dimensions && config.dimensions.length > 0) {
        for (const dim of config.dimensions) {
          await client.query(`
            INSERT INTO catalog_dimensions (name, value)
            VALUES ($1, $2)
          `, [dim.name, dim.value]);
          counts.dimensions++;
        }
      }

      // Insert formulas
      if (config.formulas && config.formulas.length > 0) {
        for (const formula of config.formulas) {
          await client.query(`
            INSERT INTO catalog_formulas (name, formula, beschreibung, variablen, is_active)
            VALUES ($1, $2, $3, $4, $5)
          `, [formula.name, formula.formula, formula.beschreibung, formula.variablen || '[]', formula.is_active || false]);
          counts.formulas++;
        }
      }

      // Insert pumps
      if (config.pumps && config.pumps.length > 0) {
        for (const pump of config.pumps) {
          await client.query(`
            INSERT INTO catalog_pumps (name, hersteller, modell, foerdermenge_m3h, foerderhoehe_m, leistung_kw, spannung, anschlussgroesse, preis, notizen)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [pump.name, pump.hersteller, pump.modell, pump.foerdermenge_m3h, pump.foerderhoehe_m, pump.leistung_kw, pump.spannung, pump.anschlussgroesse, pump.preis, pump.notizen]);
          counts.pumps++;
        }
      }

      await client.query('COMMIT');

      res.json({
        message: 'Default catalog loaded successfully',
        counts
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error loading default catalog:', error);
    res.status(500).json({ error: 'Failed to load default catalog: ' + error.message });
  }
});

/**
 * GET /api/admin/default-catalog
 * Get current default catalog configuration
 */
router.get('/default-catalog', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        config_type,
        jsonb_array_length(module_types) as module_types_count,
        jsonb_array_length(modules) as modules_count,
        jsonb_array_length(connections) as connections_count,
        jsonb_array_length(pipes) as pipes_count,
        jsonb_array_length(dimensions) as dimensions_count,
        jsonb_array_length(formulas) as formulas_count,
        jsonb_array_length(pumps) as pumps_count,
        updated_at,
        updated_by,
        is_active
      FROM default_catalog_config
      WHERE config_type = 'default'
    `);

    if (result.rows.length === 0) {
      return res.json({
        exists: false,
        counts: {
          module_types: 0,
          modules: 0,
          connections: 0,
          pipes: 0,
          dimensions: 0,
          formulas: 0,
          pumps: 0,
        }
      });
    }

    const config = result.rows[0];

    res.json({
      exists: true,
      counts: {
        module_types: config.module_types_count || 0,
        modules: config.modules_count || 0,
        connections: config.connections_count || 0,
        pipes: config.pipes_count || 0,
        dimensions: config.dimensions_count || 0,
        formulas: config.formulas_count || 0,
        pumps: config.pumps_count || 0,
      },
      updated_at: config.updated_at,
      is_active: config.is_active,
    });
  } catch (error) {
    console.error('Error fetching default catalog:', error);
    res.status(500).json({ error: 'Failed to fetch default catalog' });
  }
});

export default router;
