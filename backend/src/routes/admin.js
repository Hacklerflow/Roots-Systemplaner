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

export default router;
