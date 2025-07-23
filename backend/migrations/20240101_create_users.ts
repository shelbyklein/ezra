// Migration for users table
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('username', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255);
    table.string('avatar_url', 500);
    table.boolean('is_active').defaultTo(true);
    table.string('api_key', 255); // For storing encrypted Anthropic API key
    table.timestamps(true, true); // created_at and updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}