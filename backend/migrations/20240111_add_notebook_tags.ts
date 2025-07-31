/**
 * Migration to add notebook tags support
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create notebook_tags junction table
  await knex.schema.createTable('notebook_tags', (table) => {
    table.increments('id').primary();
    table.integer('notebook_id').unsigned().notNullable()
      .references('id').inTable('notebooks').onDelete('CASCADE');
    table.integer('tag_id').unsigned().notNullable()
      .references('id').inTable('tags').onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    // Ensure a notebook can't have the same tag twice
    table.unique(['notebook_id', 'tag_id']);
    
    // Indexes for performance
    table.index('notebook_id');
    table.index('tag_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notebook_tags');
}