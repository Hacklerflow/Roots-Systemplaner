import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/sets
 * Get all available catalog sets with active status for current user
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        cs.id,
        cs.name,
        cs.description,
        cs.is_default,
        cs.created_by,
        cs.created_at,
        cs.updated_at,
        cs.version,
        u.name as creator_name,
        CASE
          WHEN uas.user_id = $1 THEN true
          ELSE false
        END as is_active
      FROM catalog_sets cs
      LEFT JOIN users u ON cs.created_by = u.id
      LEFT JOIN user_active_sets uas ON cs.id = uas.set_id AND uas.user_id = $1
      ORDER BY cs.is_default DESC, cs.created_at DESC
    `, [req.user.id]);

    res.json({ sets: result.rows });
  } catch (error) {
    console.error('Get sets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sets/:id
 * Get specific set with full data
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT * FROM catalog_sets WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    res.json({ set: result.rows[0] });
  } catch (error) {
    console.error('Get set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sets
 * Create new set from current global catalogs
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Gather all catalog data from global tables
    const [moduleTypes, modules, connections, pipes, dimensions, formulas] =
      await Promise.all([
        query('SELECT * FROM catalog_module_types ORDER BY kategorie, name'),
        query('SELECT * FROM catalog_modules ORDER BY modultyp, name'),
        query('SELECT * FROM catalog_connections ORDER BY typ, name'),
        query('SELECT * FROM catalog_pipes ORDER BY verbindungsart, leitungstyp'),
        query('SELECT * FROM catalog_dimensions ORDER BY name'),
        query('SELECT * FROM catalog_formulas ORDER BY name'),
      ]);

    const setData = {
      module_types: moduleTypes.rows.map(mt => ({
        name: mt.name,
        kategorie: mt.kategorie,
        berechnungsart: mt.berechnungsart,
        einheit: mt.einheit,
      })),
      modules: modules.rows.map(m => ({
        id: m.id,
        name: m.name,
        modultyp: m.modultyp,
        hersteller: m.hersteller,
        abmessungen: m.abmessungen,
        gewicht_kg: m.gewicht_kg,
        leistung_kw: m.leistung_kw,
        volumen_l: m.volumen_l,
        preis: m.preis,
        eingaenge: m.eingaenge,
        ausgaenge: m.ausgaenge,
      })),
      connections: connections.rows.map(c => ({
        id: c.id,
        name: c.name,
        kuerzel: c.kuerzel,
        typ: c.typ,
      })),
      pipes: pipes.rows.map(p => ({
        id: p.id,
        verbindungsart: p.verbindungsart,
        leitungstyp: p.leitungstyp,
        dimension: p.dimension,
        preis_pro_meter: p.preis_pro_meter,
      })),
      dimensions: dimensions.rows.map(d => ({
        id: d.id,
        name: d.name,
        value: d.value,
      })),
      formulas: formulas.rows.map(f => ({
        id: f.id,
        name: f.name,
        formula: f.formula,
        beschreibung: f.beschreibung,
        variablen: f.variablen,
        is_active: f.is_active,
      })),
    };

    const result = await query(`
      INSERT INTO catalog_sets (name, description, created_by, data)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description || null, req.user.id, JSON.stringify(setData)]);

    res.status(201).json({
      message: 'Set created successfully',
      set: result.rows[0],
    });
  } catch (error) {
    console.error('Create set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sets/:id/activate
 * Activate set for current user
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if set exists
    const setResult = await query('SELECT id FROM catalog_sets WHERE id = $1', [id]);
    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Set as active for user (upsert)
    await query(`
      INSERT INTO user_active_sets (user_id, set_id, activated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET
        set_id = $2,
        activated_at = CURRENT_TIMESTAMP
    `, [req.user.id, id]);

    res.json({ message: 'Set activated successfully' });
  } catch (error) {
    console.error('Activate set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/sets/:id
 * Delete a set (only if not default and user is creator)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership and default status
    const setResult = await query(`
      SELECT id, is_default, created_by
      FROM catalog_sets
      WHERE id = $1
    `, [id]);

    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    const set = setResult.rows[0];

    if (set.is_default) {
      return res.status(403).json({ error: 'Cannot delete default set' });
    }

    if (set.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this set' });
    }

    // Delete set (will set user_active_sets.set_id to NULL via ON DELETE SET NULL)
    await query('DELETE FROM catalog_sets WHERE id = $1', [id]);

    res.json({ message: 'Set deleted successfully' });
  } catch (error) {
    console.error('Delete set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sets/:id/export
 * Export set as JSON file
 */
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM catalog_sets WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    const set = result.rows[0];
    const exportData = {
      version: '1.0',
      type: 'roots-catalog-set',
      exportDate: new Date().toISOString(),
      set: {
        name: set.name,
        description: set.description,
        version: set.version,
        data: set.data,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="CatalogSet_${set.name.replace(/[^a-zA-Z0-9]/g, '_')}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sets/import
 * Import set from JSON file
 */
router.post('/import', async (req, res) => {
  try {
    const { set } = req.body;

    if (!set || !set.name || !set.data) {
      return res.status(400).json({ error: 'Invalid set data' });
    }

    const result = await query(`
      INSERT INTO catalog_sets (name, description, created_by, data, version)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      set.name,
      set.description || null,
      req.user.id,
      JSON.stringify(set.data),
      set.version || '1.0',
    ]);

    res.status(201).json({
      message: 'Set imported successfully',
      set: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A set with this name already exists' });
    }
    console.error('Import set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
