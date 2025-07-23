// Migration for projects table
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('projects', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('color', 7).defaultTo('#3182CE'); // Hex color for UI
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.boolean('is_archived').defaultTo(false);
    table.integer('position').defaultTo(0); // For ordering projects
    table.timestamps(true, true);
    
    // Index for performance
    table.index(['user_id', 'is_archived']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('projects');
}