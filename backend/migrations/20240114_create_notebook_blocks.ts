/**
 * Migration to create notebook_blocks table for block-based storage
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('notebook_blocks');
  
  if (!exists) {
    await knex.schema.createTable('notebook_blocks', (table) => {
      table.increments('id').primary();
      table.integer('page_id').unsigned().notNullable()
        .references('id').inTable('notebook_pages').onDelete('CASCADE');
      table.string('type', 50).notNullable(); // text, code, image, table, etc.
      table.text('content').notNullable(); // JSON content
      table.integer('position').notNullable().defaultTo(0);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['page_id', 'position']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notebook_blocks');
}