/**
 * Migration to ensure all required tables exist
 * This serves as a safety net for any missing tables
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check and create attachments table if it doesn't exist
  const hasAttachments = await knex.schema.hasTable('attachments');
  if (!hasAttachments) {
    await knex.schema.createTable('attachments', (table) => {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable()
        .references('id').inTable('tasks').onDelete('CASCADE');
      table.string('type', 20).notNullable();
      table.string('name', 255).notNullable();
      table.text('content').notNullable();
      table.string('mime_type', 100).nullable();
      table.integer('size').nullable();
      table.text('metadata').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      table.index(['task_id', 'type']);
    });
  }
  
  // Check and create notes table if it doesn't exist
  const hasNotes = await knex.schema.hasTable('notes');
  if (!hasNotes) {
    await knex.schema.createTable('notes', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('content').nullable();
      table.integer('project_id').nullable()
        .references('id').inTable('projects').onDelete('CASCADE');
      table.integer('user_id').notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }
  
  // Ensure all junction tables exist
  const junctionTables = [
    { name: 'task_tags', task: 'task_id', tag: 'tag_id' },
    { name: 'project_tags', task: 'project_id', tag: 'tag_id' },
    { name: 'notebook_tags', task: 'notebook_id', tag: 'tag_id' }
  ];
  
  for (const junction of junctionTables) {
    const hasTable = await knex.schema.hasTable(junction.name);
    if (!hasTable) {
      await knex.schema.createTable(junction.name, (table) => {
        table.integer(junction.task).notNullable();
        table.integer('tag_id').notNullable();
        table.primary([junction.task, 'tag_id']);
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // This migration is a safety net, so we don't drop tables in down
  // to avoid accidental data loss
}