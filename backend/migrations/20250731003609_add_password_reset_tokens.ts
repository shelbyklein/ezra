import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.string('reset_token', 255).nullable();
    table.timestamp('reset_token_expires').nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('reset_token');
    table.dropColumn('reset_token_expires');
  });
}

