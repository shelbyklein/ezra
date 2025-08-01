import knex from 'knex';
import config from './knexfile';

async function runMigrations() {
  const env = process.env.NODE_ENV || 'development';
  const knexConfig = config[env];
  
  if (!knexConfig) {
    console.error(`No configuration found for environment: ${env}`);
    process.exit(1);
  }

  const db = knex(knexConfig);
  
  try {
    console.log(`Running migrations for ${env} environment...`);
    
    // Check for pending migrations
    const [completed, pending] = await db.migrate.list();
    
    if (pending.length === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Found ${pending.length} pending migrations:`);
      pending.forEach(migration => console.log(`  - ${migration.file}`));
      
      // Run migrations
      const [batchNo, migrations] = await db.migrate.latest();
      
      if (migrations.length === 0) {
        console.log('Already up to date.');
      } else {
        console.log(`Batch ${batchNo} run: ${migrations.length} migrations`);
        migrations.forEach(migration => console.log(`  ✓ ${migration}`));
      }
    }
    
    // Show current status
    const currentVersion = await db.migrate.currentVersion();
    console.log(`\nCurrent migration version: ${currentVersion}`);
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;