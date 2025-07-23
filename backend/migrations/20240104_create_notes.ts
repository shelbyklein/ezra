// Migration for notes table (Phase 2)
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notes', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('content').notNullable(); // Markdown content
    table.integer('project_id').unsigned();
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.integer('task_id').unsigned();
    table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.boolean('is_pinned').defaultTo(false);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['project_id']);
    table.index(['task_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notes');
}