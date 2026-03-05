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
    const { name, kuerzel, typ, kompatible_leitungen } = req.body;

    if (!name || !kuerzel || !typ) {
      return res.status(400).json({ error: 'Name, kuerzel, and typ are required' });
    }

    const result = await query(`
      INSERT INTO catalog_connections (name, kuerzel, typ, kompatible_leitungen)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, kuerzel, typ, JSON.stringify(kompatible_leitungen || [])]);

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
    const { connection_type, leitungstyp, dimension, preis_pro_meter } = req.body;

    if (!connection_type || !leitungstyp || !dimension) {
      return res.status(400).json({ error: 'connection_type, leitungstyp, and dimension are required' });
    }

    const result = await query(`
      INSERT INTO catalog_pipes (connection_type, leitungstyp, dimension, preis_pro_meter)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [connection_type, leitungstyp, dimension, preis_pro_meter]);

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
 * PUT /api/catalogs/connections/:id
 * Update a connection type
 */
router.put('/connections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, kuerzel, typ, kompatible_leitungen } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (kuerzel !== undefined) {
      fields.push(`kuerzel = $${paramCount++}`);
      values.push(kuerzel);
    }
    if (typ !== undefined) {
      fields.push(`typ = $${paramCount++}`);
      values.push(typ);
    }
    if (kompatible_leitungen !== undefined) {
      fields.push(`kompatible_leitungen = $${paramCount++}`);
      values.push(JSON.stringify(kompatible_leitungen));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_connections
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection type not found' });
    }

    res.json({
      message: 'Connection type updated',
      connection: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Connection type with this name already exists' });
    }
    console.error('Update connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/connections/:id
 * Delete a connection type
 */
router.delete('/connections/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM catalog_connections
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection type not found' });
    }

    res.json({
      message: 'Connection type deleted',
      connection: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete connection type that is being used' });
    }
    console.error('Delete connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/catalogs/pipes/:id
 * Update a pipe
 */
router.put('/pipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { connection_type, leitungstyp, dimension, preis_pro_meter } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (connection_type !== undefined) {
      fields.push(`connection_type = $${paramCount++}`);
      values.push(connection_type);
    }
    if (leitungstyp !== undefined) {
      fields.push(`leitungstyp = $${paramCount++}`);
      values.push(leitungstyp);
    }
    if (dimension !== undefined) {
      fields.push(`dimension = $${paramCount++}`);
      values.push(dimension);
    }
    if (preis_pro_meter !== undefined) {
      fields.push(`preis_pro_meter = $${paramCount++}`);
      values.push(preis_pro_meter);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_pipes
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pipe not found' });
    }

    res.json({
      message: 'Pipe updated',
      pipe: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Pipe with this combination already exists' });
    }
    console.error('Update pipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/pipes/:id
 * Delete a pipe
 */
router.delete('/pipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM catalog_pipes
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pipe not found' });
    }

    res.json({
      message: 'Pipe deleted',
      pipe: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete pipe that is being used' });
    }
    console.error('Delete pipe error:', error);
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
