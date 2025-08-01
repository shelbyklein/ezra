/**
 * Database Schema Validator
 * Ensures database schema matches expected structure
 */

import db from '../db';

interface TableSchema {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable?: boolean;
    defaultValue?: any;
  }[];
  indexes?: string[];
}

// Expected database schema
const EXPECTED_SCHEMA: TableSchema[] = [
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'username', type: 'VARCHAR(255)' },
      { name: 'password_hash', type: 'VARCHAR(255)' },
      { name: 'full_name', type: 'VARCHAR(255)', nullable: true },
      { name: 'avatar_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'is_active', type: 'BOOLEAN', defaultValue: 1 },
      { name: 'anthropic_api_key', type: 'VARCHAR(255)', nullable: true },
      { name: 'reset_token', type: 'VARCHAR(255)', nullable: true },
      { name: 'reset_token_expires', type: 'DATETIME', nullable: true },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'projects',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'title', type: 'VARCHAR(255)' },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'status', type: 'VARCHAR(50)', defaultValue: 'active' },
      { name: 'color', type: 'VARCHAR(7)', defaultValue: '#10B981' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'tasks',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'title', type: 'VARCHAR(255)' },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'project_id', type: 'INTEGER', nullable: true },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'status', type: 'VARCHAR(50)', defaultValue: 'pending' },
      { name: 'priority', type: 'VARCHAR(20)', defaultValue: 'medium' },
      { name: 'position', type: 'INTEGER', defaultValue: 0 },
      { name: 'due_date', type: 'DATETIME', nullable: true },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'attachments',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'task_id', type: 'INTEGER' },
      { name: 'type', type: 'VARCHAR(20)' },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'content', type: 'TEXT' },
      { name: 'mime_type', type: 'VARCHAR(100)', nullable: true },
      { name: 'size', type: 'INTEGER', nullable: true },
      { name: 'metadata', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'tags',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'color', type: 'VARCHAR(7)', defaultValue: '#3B82F6' },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'task_tags',
    columns: [
      { name: 'task_id', type: 'INTEGER' },
      { name: 'tag_id', type: 'INTEGER' }
    ]
  },
  {
    name: 'project_tags',
    columns: [
      { name: 'project_id', type: 'INTEGER' },
      { name: 'tag_id', type: 'INTEGER' }
    ]
  },
  {
    name: 'notebooks',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'title', type: 'VARCHAR(255)' },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'project_id', type: 'INTEGER', nullable: true },
      { name: 'is_starred', type: 'BOOLEAN', defaultValue: 0 },
      { name: 'icon', type: 'VARCHAR(255)', defaultValue: '📔' },
      { name: 'color', type: 'VARCHAR(7)', defaultValue: '#3B82F6' },
      { name: 'position', type: 'INTEGER', defaultValue: 0 },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'notebook_pages',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'title', type: 'VARCHAR(255)' },
      { name: 'slug', type: 'VARCHAR(255)' },
      { name: 'content', type: 'TEXT', nullable: true },
      { name: 'notebook_id', type: 'INTEGER' },
      { name: 'folder_id', type: 'INTEGER', nullable: true },
      { name: 'is_starred', type: 'BOOLEAN', defaultValue: 0 },
      { name: 'position', type: 'INTEGER', defaultValue: 0 },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'notebook_folders',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'notebook_id', type: 'INTEGER' },
      { name: 'parent_folder_id', type: 'INTEGER', nullable: true },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'icon', type: 'VARCHAR(50)', nullable: true },
      { name: 'position', type: 'INTEGER', defaultValue: 0 },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'notebook_tags',
    columns: [
      { name: 'notebook_id', type: 'INTEGER' },
      { name: 'tag_id', type: 'INTEGER' }
    ]
  },
  {
    name: 'chat_conversations',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'title', type: 'VARCHAR(255)', nullable: true },
      { name: 'started_at', type: 'DATETIME' },
      { name: 'last_message_at', type: 'DATETIME' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ]
  },
  {
    name: 'chat_messages',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'conversation_id', type: 'INTEGER' },
      { name: 'role', type: 'VARCHAR(50)' },
      { name: 'content', type: 'TEXT' },
      { name: 'metadata', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'DATETIME' }
    ]
  }
];

export class DatabaseValidator {
  /**
   * Validate database schema and return issues
   */
  static async validateSchema(): Promise<{
    valid: boolean;
    issues: string[];
    missingTables: string[];
    missingColumns: { table: string; column: string }[];
  }> {
    const issues: string[] = [];
    const missingTables: string[] = [];
    const missingColumns: { table: string; column: string }[] = [];

    try {
      // Get all existing tables
      const existingTables = await db.raw(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'knex_migrations' AND name != 'knex_migrations_lock'
      `);
      const existingTableNames = existingTables.map((t: any) => t.name);

      // Check each expected table
      for (const expectedTable of EXPECTED_SCHEMA) {
        if (!existingTableNames.includes(expectedTable.name)) {
          missingTables.push(expectedTable.name);
          issues.push(`Missing table: ${expectedTable.name}`);
          continue;
        }

        // Check columns for existing tables
        const tableInfo = await db.raw(`PRAGMA table_info(${expectedTable.name})`);
        const existingColumns = tableInfo.map((col: any) => col.name);

        for (const expectedCol of expectedTable.columns) {
          if (!existingColumns.includes(expectedCol.name)) {
            missingColumns.push({ table: expectedTable.name, column: expectedCol.name });
            issues.push(`Missing column: ${expectedTable.name}.${expectedCol.name}`);
          }
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        missingTables,
        missingColumns
      };
    } catch (error) {
      console.error('Error validating database schema:', error);
      return {
        valid: false,
        issues: [`Database validation error: ${error.message}`],
        missingTables: [],
        missingColumns: []
      };
    }
  }

  /**
   * Log validation results
   */
  static logValidation(result: Awaited<ReturnType<typeof DatabaseValidator.validateSchema>>) {
    if (result.valid) {
      console.log('✅ Database schema validation passed');
    } else {
      console.error('❌ Database schema validation failed:');
      result.issues.forEach(issue => console.error(`  - ${issue}`));
      
      if (result.missingTables.length > 0) {
        console.error('\n🔧 Missing tables:', result.missingTables.join(', '));
      }
      
      if (result.missingColumns.length > 0) {
        console.error('\n🔧 Missing columns:');
        result.missingColumns.forEach(({ table, column }) => {
          console.error(`  - ${table}.${column}`);
        });
      }
    }
  }

  /**
   * Validate on startup and throw if critical issues
   */
  static async validateOnStartup() {
    console.log('🔍 Validating database schema...');
    const result = await DatabaseValidator.validateSchema();
    DatabaseValidator.logValidation(result);

    // Throw error if critical tables are missing
    const criticalTables = ['users', 'projects', 'tasks'];
    const missingCritical = result.missingTables.filter(t => criticalTables.includes(t));
    
    if (missingCritical.length > 0) {
      throw new Error(`Critical tables missing: ${missingCritical.join(', ')}. Please run migrations.`);
    }

    return result;
  }
}