/**
 * Health check routes with database validation
 */

import express from 'express';
import db from '../src/db';
import { DatabaseValidator } from '../src/utils/databaseValidator';

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Detailed database health check
router.get('/database', async (req, res) => {
  try {
    // Validate schema
    const validation = await DatabaseValidator.validateSchema();
    
    // Get table counts
    const tables = await db.raw(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      AND name != 'knex_migrations' AND name != 'knex_migrations_lock'
      ORDER BY name
    `);
    
    const tableCounts: Record<string, number> = {};
    for (const table of tables) {
      const count = await db(table.name).count('* as count').first();
      tableCounts[table.name] = count?.count || 0;
    }
    
    // Get migration status
    let migrationStatus = { current: 'unknown', pending: 0 };
    try {
      const [completed, pending] = await Promise.all([
        db.migrate.list(),
        db.migrate.currentVersion()
      ]);
      migrationStatus = {
        current: pending,
        pending: completed[1].length
      };
    } catch (error) {
      // Migration table might not exist
    }
    
    res.json({
      status: validation.valid ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: tables.map(t => t.name),
        tableCounts,
        migrations: migrationStatus
      },
      schema: {
        valid: validation.valid,
        issues: validation.issues,
        missingTables: validation.missingTables,
        missingColumns: validation.missingColumns
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Schema validation endpoint
router.get('/schema', async (req, res) => {
  try {
    const validation = await DatabaseValidator.validateSchema();
    res.json(validation);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to validate schema',
      message: error.message
    });
  }
});

export default router;