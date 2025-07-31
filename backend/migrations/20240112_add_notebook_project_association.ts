/**
 * Migration to add project association to notebooks
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notebooks', (table) => {
    table.integer('project_id').unsigned().nullable()
      .references('id').inTable('projects').onDelete('SET NULL');
    
    // Add index for performance
    table.index('project_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notebooks', (table) => {
    table.dropIndex('project_id');
    table.dropColumn('project_id');
  });
}