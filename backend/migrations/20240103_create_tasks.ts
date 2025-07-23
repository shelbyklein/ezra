// Migration for tasks table
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title', 500).notNullable();
    table.text('description');
    table.enum('status', ['todo', 'in_progress', 'done']).defaultTo('todo');
    table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.integer('project_id').unsigned().notNullable();
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.integer('position').defaultTo(0); // For ordering within columns
    table.date('due_date');
    table.json('labels'); // Array of strings
    table.integer('estimated_hours');
    table.integer('actual_hours');
    table.boolean('ai_enhanced').defaultTo(false);
    table.text('ai_suggestions'); // Store AI-generated suggestions
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['project_id', 'status']);
    table.index('due_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tasks');
}