/**
 * Migration to add folder_id column to notebook_pages
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('notebook_pages', 'folder_id');
  
  if (!hasColumn) {
    await knex.schema.alterTable('notebook_pages', (table) => {
      table.integer('folder_id').unsigned().nullable()
        .references('id').inTable('notebook_folders').onDelete('SET NULL');
      
      // Add index for folder_id
      table.index(['notebook_id', 'folder_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notebook_pages', (table) => {
    // Drop index first
    table.dropIndex(['notebook_id', 'folder_id']);
    // Drop column
    table.dropColumn('folder_id');
  });
}