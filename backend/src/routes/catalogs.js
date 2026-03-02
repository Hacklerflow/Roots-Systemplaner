import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/catalogs/module-types
 * Get all module types
 */
router.get('/module-types', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM catalog_module_types
      ORDER BY kategorie, name
    `);

    res.json({ moduleTypes: result.rows });
  } catch (error) {
    console.error('Get module types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/catalogs/modules
 * Get all modules
 */
router.get('/modules', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM catalog_modules
      ORDER BY modultyp, name
    `);

    res.json({ modules: result.rows });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/catalogs/connections
 * Get all connection types
 */
router.get('/connections', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM catalog_connections
      ORDER BY typ, name
    `);

    res.json({ connections: result.rows });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/catalogs/pipes
 * Get all pipes
 */
router.get('/pipes', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM catalog_pipes
      ORDER BY verbindungsart, leitungstyp, dimension
    `);

    res.json({ pipes: result.rows });
  } catch (error) {
    console.error('Get pipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/catalogs/dimensions
 * Get all dimensions
 */
router.get('/dimensions', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM catalog_dimensions
      ORDER BY name
    `);

    res.json({ dimensions: result.rows });
  } catch (error) {
    console.error('Get dimensions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/module-types
 * Add a new module type
 */
router.post('/module-types', async (req, res) => {
  try {
    const { name, kategorie, berechnungsart, einheit } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(`
      INSERT INTO catalog_module_types (name, kategorie, berechnungsart, einheit)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, kategorie, berechnungsart || 'stueck', einheit || 'Stk']);

    res.status(201).json({
      message: 'Module type created',
      moduleType: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Module type with this name already exists' });
    }
    console.error('Create module type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/modules
 * Add a new module
 */
router.post('/modules', async (req, res) => {
  try {
    const {
      name,
      modultyp,
      hersteller,
      abmessungen,
      gewicht_kg,
      leistung_kw,
      volumen_l,
      preis,
      eingaenge,
      ausgaenge,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(`
      INSERT INTO catalog_modules (
        name, modultyp, hersteller, abmessungen,
        gewicht_kg, leistung_kw, volumen_l, preis,
        eingaenge, ausgaenge
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name,
      modultyp,
      hersteller,
      abmessungen,
      gewicht_kg,
      leistung_kw,
      volumen_l,
      preis,
      JSON.stringify(eingaenge || []),
      JSON.stringify(ausgaenge || []),
    ]);

    res.status(201).json({
      message: 'Module created',
      module: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Module with this name already exists' });
    }
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/connections
 * Add a new connection type
 */
router.post('/connections', async (req, res) => {
  try {
    const { name, kuerzel, typ } = req.body;

    if (!name || !kuerzel || !typ) {
      return res.status(400).json({ error: 'Name, kuerzel, and typ are required' });
    }

    const result = await query(`
      INSERT INTO catalog_connections (name, kuerzel, typ)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, kuerzel, typ]);

    res.status(201).json({
      message: 'Connection type created',
      connection: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Connection type with this name already exists' });
    }
    console.error('Create connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/pipes
 * Add a new pipe
 */
router.post('/pipes', async (req, res) => {
  try {
    const { verbindungsart, leitungstyp, dimension, preis_pro_meter } = req.body;

    if (!verbindungsart || !leitungstyp || !dimension) {
      return res.status(400).json({ error: 'Verbindungsart, leitungstyp, and dimension are required' });
    }

    const result = await query(`
      INSERT INTO catalog_pipes (verbindungsart, leitungstyp, dimension, preis_pro_meter)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [verbindungsart, leitungstyp, dimension, preis_pro_meter]);

    res.status(201).json({
      message: 'Pipe created',
      pipe: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Pipe with this combination already exists' });
    }
    console.error('Create pipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/catalogs/modules/:id
 * Update a module
 */
router.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'modultyp', 'hersteller', 'abmessungen',
      'gewicht_kg', 'leistung_kw', 'volumen_l', 'preis',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(updates[field]);
      }
    }

    if (updates.eingaenge !== undefined) {
      fields.push(`eingaenge = $${paramCount++}`);
      values.push(JSON.stringify(updates.eingaenge));
    }

    if (updates.ausgaenge !== undefined) {
      fields.push(`ausgaenge = $${paramCount++}`);
      values.push(JSON.stringify(updates.ausgaenge));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_modules
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({
      message: 'Module updated',
      module: result.rows[0],
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/modules/:id
 * Delete a module
 */
router.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM catalog_modules WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({ message: 'Module deleted' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
