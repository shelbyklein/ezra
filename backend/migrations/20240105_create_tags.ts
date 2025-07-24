// Migration for tags table
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create tags table
  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.string('name', 50).notNullable();
    table.string('color', 7).notNullable(); // Hex color
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
    
    // Unique constraint: each user can only have one tag with the same name
    table.unique(['user_id', 'name']);
    
    // Index for performance
    table.index('user_id');
  });

  // Create task_tags junction table for many-to-many relationship
  await knex.schema.createTable('task_tags', (table) => {
    table.integer('task_id').unsigned().notNullable();
    table.integer('tag_id').unsigned().notNullable();
    table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table.foreign('tag_id').references('id').inTable('tags').onDelete('CASCADE');
    table.primary(['task_id', 'tag_id']);
    
    // Indexes for performance
    table.index('task_id');
    table.index('tag_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('task_tags');
  await knex.schema.dropTable('tags');
}