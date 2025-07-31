/**
 * Migration to add task attachments support
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create attachments table
  await knex.schema.createTable('attachments', (table) => {
    table.increments('id').primary();
    table.integer('task_id').unsigned().notNullable()
      .references('id').inTable('tasks').onDelete('CASCADE');
    table.string('type', 20).notNullable(); // 'file', 'url', 'note'
    table.string('name', 255).notNullable();
    table.text('content').notNullable(); // URL, file path, or note content
    table.string('mime_type', 100).nullable(); // For files
    table.integer('size').nullable(); // File size in bytes
    table.text('metadata').nullable(); // JSON string for additional data
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Index for faster queries
    table.index(['task_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attachments');
}