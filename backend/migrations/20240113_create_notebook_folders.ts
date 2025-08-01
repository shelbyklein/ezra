/**
 * Migration to create notebook_folders table
 * This table was missing and causing 500 errors
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if table already exists (created by docker-entrypoint.sh)
  const exists = await knex.schema.hasTable('notebook_folders');
  
  if (!exists) {
    await knex.schema.createTable('notebook_folders', (table) => {
      table.increments('id').primary();
      table.integer('notebook_id').unsigned().notNullable()
        .references('id').inTable('notebooks').onDelete('CASCADE');
      table.integer('parent_folder_id').unsigned().nullable()
        .references('id').inTable('notebook_folders').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.string('icon', 50).nullable();
      table.integer('position').notNullable().defaultTo(0);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['notebook_id']);
      table.index(['parent_folder_id']);
      table.index(['notebook_id', 'position']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notebook_folders');
}