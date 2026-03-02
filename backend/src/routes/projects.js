import express from 'express';
import { query, getClient } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { isValidProjectName, sanitizeString } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/projects
 * Get all projects (visible to all users in the team)
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.tags,
        p.building_name,
        p.building_year,
        p.building_address,
        p.created_at,
        p.updated_at,
        u.name as owner_name,
        u.email as owner_email
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.updated_at DESC
    `);

    res.json({
      projects: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/projects/:id
 * Get a single project with full configuration
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get project with configuration
    const result = await query(`
      SELECT
        p.*,
        u.name as owner_name,
        u.email as owner_email,
        c.nodes,
        c.edges,
        c.building,
        c.viewport
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN configurations c ON p.id = c.project_id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = result.rows[0];

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res) => {
  const client = await getClient();

  try {
    const { name, description, tags, building } = req.body;
    const userId = req.user.id;

    // Validation
    if (!isValidProjectName(name)) {
      return res.status(400).json({ error: 'Valid project name is required' });
    }

    const sanitizedName = sanitizeString(name);
    const sanitizedDescription = sanitizeString(description || '');

    await client.query('BEGIN');

    // Extract building info for quick access
    const buildingName = building?.data?.name || '';
    const buildingYear = building?.data?.baujahr || null;
    const buildingAddress = building?.data?.strasse
      ? `${building.data.strasse} ${building.data.hausnummer || ''}`.trim()
      : '';

    // Insert project
    const projectResult = await client.query(`
      INSERT INTO projects (
        name,
        user_id,
        description,
        tags,
        building_name,
        building_year,
        building_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      sanitizedName,
      userId,
      sanitizedDescription,
      tags || [],
      buildingName,
      buildingYear,
      buildingAddress,
    ]);

    const project = projectResult.rows[0];

    // Insert empty configuration
    await client.query(`
      INSERT INTO configurations (
        project_id,
        nodes,
        edges,
        building,
        viewport
      )
      VALUES ($1, $2, $3, $4, $5)
    `, [
      project.id,
      [],
      [],
      building || {},
      { x: 0, y: 0, zoom: 1 },
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/projects/:id
 * Update a project and its configuration
 */
router.put('/:id', async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const { name, description, tags, nodes, edges, building, viewport } = req.body;

    await client.query('BEGIN');

    // Check if project exists
    const existingProject = await client.query(
      'SELECT id FROM projects WHERE id = $1',
      [id]
    );

    if (existingProject.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project metadata if provided
    if (name || description !== undefined || tags !== undefined || building) {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (name && isValidProjectName(name)) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(sanitizeString(name));
      }

      if (description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        updateValues.push(sanitizeString(description));
      }

      if (tags !== undefined) {
        updateFields.push(`tags = $${paramCount++}`);
        updateValues.push(tags);
      }

      if (building) {
        const buildingName = building.data?.name || '';
        const buildingYear = building.data?.baujahr || null;
        const buildingAddress = building.data?.strasse
          ? `${building.data.strasse} ${building.data.hausnummer || ''}`.trim()
          : '';

        updateFields.push(`building_name = $${paramCount++}`);
        updateValues.push(buildingName);
        updateFields.push(`building_year = $${paramCount++}`);
        updateValues.push(buildingYear);
        updateFields.push(`building_address = $${paramCount++}`);
        updateValues.push(buildingAddress);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await client.query(`
          UPDATE projects
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCount}
        `, updateValues);
      }
    }

    // Update configuration if provided
    if (nodes !== undefined || edges !== undefined || building !== undefined || viewport !== undefined) {
      const configUpdateFields = [];
      const configUpdateValues = [];
      let paramCount = 1;

      if (nodes !== undefined) {
        configUpdateFields.push(`nodes = $${paramCount++}`);
        configUpdateValues.push(JSON.stringify(nodes));
      }

      if (edges !== undefined) {
        configUpdateFields.push(`edges = $${paramCount++}`);
        configUpdateValues.push(JSON.stringify(edges));
      }

      if (building !== undefined) {
        configUpdateFields.push(`building = $${paramCount++}`);
        configUpdateValues.push(JSON.stringify(building));
      }

      if (viewport !== undefined) {
        configUpdateFields.push(`viewport = $${paramCount++}`);
        configUpdateValues.push(JSON.stringify(viewport));
      }

      if (configUpdateFields.length > 0) {
        configUpdateValues.push(id);
        await client.query(`
          UPDATE configurations
          SET ${configUpdateFields.join(', ')}
          WHERE project_id = $${paramCount}
        `, configUpdateValues);
      }
    }

    await client.query('COMMIT');

    // Fetch updated project
    const result = await query(`
      SELECT
        p.*,
        u.name as owner_name,
        c.nodes,
        c.edges,
        c.building,
        c.viewport
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN configurations c ON p.id = c.project_id
      WHERE p.id = $1
    `, [id]);

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/projects/:id/duplicate
 * Duplicate a project
 */
router.post('/:id/duplicate', async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Get original project
    const originalResult = await client.query(`
      SELECT
        p.*,
        c.nodes,
        c.edges,
        c.building,
        c.viewport
      FROM projects p
      LEFT JOIN configurations c ON p.id = c.project_id
      WHERE p.id = $1
    `, [id]);

    if (originalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Project not found' });
    }

    const original = originalResult.rows[0];

    // Create duplicate project
    const projectResult = await client.query(`
      INSERT INTO projects (
        name,
        user_id,
        description,
        tags,
        building_name,
        building_year,
        building_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      `${original.name} (Kopie)`,
      userId,
      original.description,
      original.tags,
      original.building_name,
      original.building_year,
      original.building_address,
    ]);

    const newProject = projectResult.rows[0];

    // Copy configuration
    await client.query(`
      INSERT INTO configurations (
        project_id,
        nodes,
        edges,
        building,
        viewport
      )
      VALUES ($1, $2, $3, $4, $5)
    `, [
      newProject.id,
      original.nodes,
      original.edges,
      original.building,
      original.viewport,
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Project duplicated successfully',
      project: newProject,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Duplicate project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
