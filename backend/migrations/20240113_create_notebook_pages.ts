/**
 * Migration to create notebook_pages table
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notebook_pages', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable();
    table.text('content');
    table.integer('notebook_id').unsigned().notNullable()
      .references('id').inTable('notebooks').onDelete('CASCADE');
    table.boolean('is_starred').defaultTo(false);
    table.integer('position').defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Add indexes for performance
    table.index('notebook_id');
    table.index('slug');
    table.index('is_starred');
    table.unique(['notebook_id', 'slug']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notebook_pages');
}