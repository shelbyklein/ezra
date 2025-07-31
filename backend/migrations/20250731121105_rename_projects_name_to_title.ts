import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('projects', (table) => {
    table.renameColumn('name', 'title');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('projects', (table) => {
    table.renameColumn('title', 'name');
  });
}