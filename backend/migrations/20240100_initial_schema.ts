/**
 * Initial database schema migration
 * Creates all core tables if they don't exist
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email', 255).unique().notNullable();
      table.string('username', 255).unique().notNullable();
      table.string('password_hash', 255).notNullable();
      table.string('full_name', 255).nullable();
      table.string('avatar_url', 255).nullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('email');
      table.index('username');
    });
  }
  
  // Create projects table
  if (!(await knex.schema.hasTable('projects'))) {
    await knex.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('description').nullable();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('status', 50).defaultTo('active');
      table.string('color', 7).defaultTo('#10B981');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('user_id');
    });
  }
  
  // Create tasks table
  if (!(await knex.schema.hasTable('tasks'))) {
    await knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('description').nullable();
      table.integer('project_id').unsigned().nullable()
        .references('id').inTable('projects').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('status', 50).defaultTo('pending');
      table.string('priority', 20).defaultTo('medium');
      table.integer('position').defaultTo(0);
      table.datetime('due_date').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('project_id');
      table.index('user_id');
    });
  }
  
  // Create notes table
  if (!(await knex.schema.hasTable('notes'))) {
    await knex.schema.createTable('notes', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('content').nullable();
      table.integer('project_id').unsigned().nullable()
        .references('id').inTable('projects').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('project_id');
      table.index('user_id');
    });
  }
  
  // Create tags table
  if (!(await knex.schema.hasTable('tags'))) {
    await knex.schema.createTable('tags', (table) => {
      table.increments('id').primary();
      table.string('name', 100).unique().notNullable();
      table.string('color', 7).defaultTo('#3B82F6');
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('user_id');
    });
  }
  
  // Create notebooks table
  if (!(await knex.schema.hasTable('notebooks'))) {
    await knex.schema.createTable('notebooks', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('description').nullable();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.integer('project_id').unsigned().nullable()
        .references('id').inTable('projects').onDelete('SET NULL');
      table.boolean('is_starred').defaultTo(false);
      table.string('icon', 255).defaultTo('📔');
      table.string('color', 7).defaultTo('#3B82F6');
      table.integer('position').defaultTo(0);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('user_id');
      table.index('project_id');
    });
  }
  
  // Create knex_migrations tables if they don't exist
  if (!(await knex.schema.hasTable('knex_migrations'))) {
    await knex.schema.createTable('knex_migrations', (table) => {
      table.increments('id').primary();
      table.string('name', 255).nullable();
      table.integer('batch').nullable();
      table.datetime('migration_time').nullable();
    });
  }
  
  if (!(await knex.schema.hasTable('knex_migrations_lock'))) {
    await knex.schema.createTable('knex_migrations_lock', (table) => {
      table.integer('index').unsigned().notNullable().primary();
      table.integer('is_locked').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTableIfExists('notebooks');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('notes');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('users');
}