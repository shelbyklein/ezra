import knex from 'knex';
import config from './knexfile';

async function runMigrations() {
  const db = knex(config.development);
  
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully!');
    
    const currentVersion = await db.migrate.currentVersion();
    console.log('Current migration version:', currentVersion);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await db.destroy();
  }
}

runMigrations();