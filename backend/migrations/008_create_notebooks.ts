/**
 * Migration to create notebooks and related tables
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create notebooks table
  await knex.schema.createTable('notebooks', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.string('icon', 50).nullable(); // emoji or icon name
    table.integer('position').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id', 'position']);
  });

  // Create notebook_folders table
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
    table.index(['notebook_id', 'parent_folder_id']);
    table.index(['notebook_id', 'position']);
  });

  // Create notebook_pages table
  await knex.schema.createTable('notebook_pages', (table) => {
    table.increments('id').primary();
    table.integer('notebook_id').unsigned().notNullable()
      .references('id').inTable('notebooks').onDelete('CASCADE');
    table.integer('folder_id').unsigned().nullable()
      .references('id').inTable('notebook_folders').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable();
    table.text('content').notNullable(); // JSON content
    table.integer('position').notNullable().defaultTo(0);
    table.boolean('is_starred').defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['notebook_id', 'folder_id']);
    table.index(['notebook_id', 'position']);
    table.index(['notebook_id', 'is_starred']);
    table.unique(['notebook_id', 'slug']);
  });

  // Create notebook_blocks table (for future block-based storage)
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

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notebook_blocks');
  await knex.schema.dropTableIfExists('notebook_pages');
  await knex.schema.dropTableIfExists('notebook_folders');
  await knex.schema.dropTableIfExists('notebooks');
}