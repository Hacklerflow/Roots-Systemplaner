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
      ORDER BY connection_type, leitungstyp, dimension
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
 * POST /api/catalogs/dimensions
 * Add a new dimension
 */
router.post('/dimensions', async (req, res) => {
  try {
    const { name, value } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(`
      INSERT INTO catalog_dimensions (name, value)
      VALUES ($1, $2)
      RETURNING *
    `, [name, value || name]);

    res.status(201).json({
      message: 'Dimension created',
      dimension: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Dimension with this name already exists' });
    }
    console.error('Create dimension error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/catalogs/dimensions/:id
 * Update a dimension
 */
router.put('/dimensions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (value !== undefined) {
      fields.push(`value = $${paramCount++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_dimensions
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dimension not found' });
    }

    res.json({
      message: 'Dimension updated',
      dimension: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Dimension with this name already exists' });
    }
    console.error('Update dimension error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/dimensions/:id
 * Delete a dimension
 */
router.delete('/dimensions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM catalog_dimensions
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dimension not found' });
    }

    res.json({
      message: 'Dimension deleted',
      dimension: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete dimension that is being used' });
    }
    console.error('Delete dimension error:', error);
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
 * PUT /api/catalogs/module-types/:id
 * Update a module type
 */
router.put('/module-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, kategorie, berechnungsart, einheit } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (kategorie !== undefined) {
      fields.push(`kategorie = $${paramCount++}`);
      values.push(kategorie);
    }
    if (berechnungsart !== undefined) {
      fields.push(`berechnungsart = $${paramCount++}`);
      values.push(berechnungsart);
    }
    if (einheit !== undefined) {
      fields.push(`einheit = $${paramCount++}`);
      values.push(einheit);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_module_types
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module type not found' });
    }

    res.json({
      message: 'Module type updated',
      moduleType: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Module type with this name already exists' });
    }
    console.error('Update module type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/module-types/:id
 * Delete a module type
 */
router.delete('/module-types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM catalog_module_types
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Module type not found' });
    }

    res.json({
      message: 'Module type deleted',
      moduleType: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete module type that is being used' });
    }
    console.error('Delete module type error:', error);
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

    // Sanitize values: empty strings and undefined should become NULL
    const sanitizeValue = (val) => (val === '' || val === undefined) ? null : val;

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
      sanitizeValue(modultyp),
      sanitizeValue(hersteller),
      sanitizeValue(abmessungen),
      sanitizeValue(gewicht_kg),
      sanitizeValue(leistung_kw),
      sanitizeValue(volumen_l),
      sanitizeValue(preis),
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
    res.status(500).json({ error: 'Internal server error: ' + error.message });
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

    // Only preis_pro_meter is required, others can be null for flexible creation
    if (preis_pro_meter === undefined || preis_pro_meter === null) {
      return res.status(400).json({ error: 'preis_pro_meter is required' });
    }

    const result = await query(`
      INSERT INTO catalog_pipes (connection_type, leitungstyp, dimension, preis_pro_meter)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [connection_type || null, leitungstyp || null, dimension || null, preis_pro_meter]);

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
    res.status(500).json({ error: 'Internal server error: ' + error.message });
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

/**
 * GET /api/catalogs/formulas
 * Get all formulas
 */
router.get('/formulas', async (req, res) => {
  try {
    console.log('📋 GET /formulas - Fetching formulas...');
    const result = await query(`
      SELECT * FROM catalog_formulas
      ORDER BY is_active DESC, name
    `);

    console.log(`📋 GET /formulas - Found ${result.rows.length} formulas`);
    res.json({ formulas: result.rows });
  } catch (error) {
    console.error('❌ Get formulas error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/formulas
 * Add a new formula
 */
router.post('/formulas', async (req, res) => {
  try {
    const { name, formula, beschreibung, variablen, is_active } = req.body;

    if (!name || !formula) {
      return res.status(400).json({ error: 'Name and formula are required' });
    }

    // If setting this formula as active, deactivate all others
    if (is_active) {
      await query('UPDATE catalog_formulas SET is_active = false WHERE is_active = true');
    }

    const result = await query(`
      INSERT INTO catalog_formulas (name, formula, beschreibung, variablen, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, formula, beschreibung || null, JSON.stringify(variablen || []), is_active || false]);

    res.status(201).json({
      message: 'Formula created',
      formula: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Only one formula can be active at a time' });
    }
    console.error('Create formula error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/catalogs/formulas/:id
 * Update a formula
 */
router.put('/formulas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, formula, beschreibung, variablen, is_active } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (formula !== undefined) {
      fields.push(`formula = $${paramCount++}`);
      values.push(formula);
    }
    if (beschreibung !== undefined) {
      fields.push(`beschreibung = $${paramCount++}`);
      values.push(beschreibung);
    }
    if (variablen !== undefined) {
      fields.push(`variablen = $${paramCount++}`);
      values.push(JSON.stringify(variablen));
    }
    if (is_active !== undefined) {
      // If setting this formula as active, deactivate all others first
      if (is_active) {
        await query('UPDATE catalog_formulas SET is_active = false WHERE is_active = true AND id != $1', [id]);
      }
      fields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_formulas
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Formula not found' });
    }

    res.json({
      message: 'Formula updated',
      formula: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Only one formula can be active at a time' });
    }
    console.error('Update formula error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/formulas/:id
 * Delete a formula
 */
router.delete('/formulas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM catalog_formulas
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Formula not found' });
    }

    res.json({
      message: 'Formula deleted',
      formula: result.rows[0],
    });
  } catch (error) {
    console.error('Delete formula error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/catalogs/pumps
 * Get all pumps
 */
router.get('/pumps', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM catalog_pumps
      ORDER BY hersteller, name
    `);

    res.json({ pumps: result.rows });
  } catch (error) {
    console.error('Get pumps error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/pumps
 * Add a new pump
 */
router.post('/pumps', async (req, res) => {
  try {
    const {
      name,
      hersteller,
      modell,
      foerdermenge_m3h,
      foerderhoehe_m,
      leistung_kw,
      spannung,
      anschlussgroesse,
      preis,
      notizen,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(`
      INSERT INTO catalog_pumps (
        name, hersteller, modell, foerdermenge_m3h,
        foerderhoehe_m, leistung_kw, spannung, anschlussgroesse,
        preis, notizen
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name,
      hersteller || null,
      modell || null,
      foerdermenge_m3h || null,
      foerderhoehe_m || null,
      leistung_kw || null,
      spannung || null,
      anschlussgroesse || null,
      preis || null,
      notizen || null,
    ]);

    res.status(201).json({
      message: 'Pump created',
      pump: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Pump with this name/model already exists' });
    }
    console.error('Create pump error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/catalogs/pumps/:id
 * Update a pump
 */
router.put('/pumps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'hersteller', 'modell', 'foerdermenge_m3h',
      'foerderhoehe_m', 'leistung_kw', 'spannung', 'anschlussgroesse',
      'preis', 'notizen',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(updates[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE catalog_pumps
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pump not found' });
    }

    res.json({
      message: 'Pump updated',
      pump: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Pump with this name/model already exists' });
    }
    console.error('Update pump error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/pumps/:id
 * Delete a pump
 */
router.delete('/pumps/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM catalog_pumps
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pump not found' });
    }

    res.json({
      message: 'Pump deleted',
      pump: result.rows[0],
    });
  } catch (error) {
    console.error('Delete pump error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/catalogs/soles
 * Get all soles (heat transfer fluids)
 */
router.get('/soles', async (req, res) => {
  try {
    console.log('📋 GET /soles - Fetching soles...');
    const result = await query(`
      SELECT * FROM catalog_soles
      ORDER BY name
    `);

    res.json({ soles: result.rows });
  } catch (error) {
    console.error('Get soles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/catalogs/soles
 * Create a new sole
 */
router.post('/soles', async (req, res) => {
  try {
    const { name, frostschutzmittel, notiz, faktor } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (faktor === undefined || faktor === null) {
      return res.status(400).json({ error: 'Faktor is required' });
    }
    if (isNaN(parseFloat(faktor))) {
      return res.status(400).json({ error: 'Faktor must be a number' });
    }

    console.log('➕ POST /soles - Creating new sole:', { name, frostschutzmittel, notiz, faktor });

    const result = await query(`
      INSERT INTO catalog_soles (name, frostschutzmittel, notiz, faktor)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, frostschutzmittel || null, notiz || null, parseFloat(faktor)]);

    res.status(201).json({
      message: 'Sole created',
      sole: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Sole with this name already exists' });
    }
    console.error('Create sole error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/catalogs/soles/:id
 * Update a sole
 */
router.put('/soles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, frostschutzmittel, notiz, faktor } = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (frostschutzmittel !== undefined) {
      fields.push(`frostschutzmittel = $${paramCount++}`);
      values.push(frostschutzmittel || null);
    }
    if (notiz !== undefined) {
      fields.push(`notiz = $${paramCount++}`);
      values.push(notiz || null);
    }
    if (faktor !== undefined) {
      if (isNaN(parseFloat(faktor))) {
        return res.status(400).json({ error: 'Faktor must be a number' });
      }
      fields.push(`faktor = $${paramCount++}`);
      values.push(parseFloat(faktor));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    console.log('✏️ PUT /soles/:id - Updating sole:', { id, fields: req.body });

    const result = await query(`
      UPDATE catalog_soles
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sole not found' });
    }

    res.json({
      message: 'Sole updated',
      sole: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Sole with this name already exists' });
    }
    console.error('Update sole error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/catalogs/soles/:id
 * Delete a sole
 */
router.delete('/soles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /soles/:id - Deleting sole:', id);

    const result = await query(`
      DELETE FROM catalog_soles
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sole not found' });
    }

    res.json({
      message: 'Sole deleted',
      sole: result.rows[0],
    });
  } catch (error) {
    console.error('Delete sole error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
