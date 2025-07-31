/**
 * Migration to create chat history tables
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create chat_conversations table
  await knex.schema.createTable('chat_conversations', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).nullable();
    table.timestamp('started_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_message_at').notNullable().defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id', 'last_message_at']);
  });

  // Create chat_messages table
  await knex.schema.createTable('chat_messages', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').unsigned().notNullable()
      .references('id').inTable('chat_conversations').onDelete('CASCADE');
    table.enum('role', ['user', 'assistant']).notNullable();
    table.text('content').notNullable();
    table.json('metadata').nullable(); // Store action results, context flags, etc.
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['conversation_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('chat_messages');
  await knex.schema.dropTableIfExists('chat_conversations');
}