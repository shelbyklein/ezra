/**
 * Migration Runner
 * Ensures database migrations are properly executed
 */

import knex from '../db';
import path from 'path';

export class MigrationRunner {
  /**
   * Run all pending migrations
   */
  static async runMigrations() {
    try {
      console.log('🔄 Running database migrations...');
      
      // Get current migration status
      const [completed, pending] = await Promise.all([
        knex.migrate.list(),
        knex.migrate.currentVersion()
      ]);
      
      console.log(`📊 Current migration version: ${pending}`);
      console.log(`📊 Completed migrations: ${completed[0].length}`);
      console.log(`📊 Pending migrations: ${completed[1].length}`);
      
      if (completed[1].length > 0) {
        console.log('🚀 Running pending migrations...');
        const results = await knex.migrate.latest({
          directory: path.join(__dirname, '../../../migrations')
        });
        
        if (results[1].length > 0) {
          console.log('✅ Migrations completed:');
          results[1].forEach((migration: string) => {
            console.log(`  - ${migration}`);
          });
        }
      } else {
        console.log('✅ All migrations are up to date');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Migration error:', error);
      
      // Log more details about the error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('no such table')) {
        console.error('🔧 Missing migration table. Creating...');
        try {
          await knex.migrate.latest({
            directory: path.join(__dirname, '../../../migrations')
          });
          console.log('✅ Migration table created and migrations run');
          return true;
        } catch (retryError) {
          console.error('❌ Failed to create migration table:', retryError);
        }
      }
      
      return false;
    }
  }
  
  /**
   * Check if a specific table exists
   */
  static async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await knex.raw(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='${tableName}'
      `);
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Create missing tables manually if migrations fail
   */
  static async createMissingTables() {
    const criticalTables = [
      {
        name: 'attachments',
        sql: `CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL,
          name VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          mime_type VARCHAR(100),
          size INTEGER,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )`
      }
    ];
    
    for (const table of criticalTables) {
      const exists = await MigrationRunner.tableExists(table.name);
      if (!exists) {
        console.log(`🔧 Creating missing table: ${table.name}`);
        try {
          await knex.raw(table.sql);
          console.log(`✅ Created table: ${table.name}`);
        } catch (error) {
          console.error(`❌ Failed to create table ${table.name}:`, error);
        }
      }
    }
  }
}