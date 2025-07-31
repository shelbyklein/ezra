/**
 * Migration to add project tags support
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create project_tags junction table
  await knex.schema.createTable('project_tags', (table) => {
    table.increments('id').primary();
    table.integer('project_id').unsigned().notNullable()
      .references('id').inTable('projects').onDelete('CASCADE');
    table.integer('tag_id').unsigned().notNullable()
      .references('id').inTable('tags').onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    // Ensure a project can't have the same tag twice
    table.unique(['project_id', 'tag_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('project_tags');
}