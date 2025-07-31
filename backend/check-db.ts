import db from './src/db';

async function checkDatabase() {
  try {
    // Check if users table has reset token columns
    const userColumns = await db('users').columnInfo();
    console.log('Users table columns:', Object.keys(userColumns));
    
    // Check if password reset columns exist
    if (userColumns.reset_token && userColumns.reset_token_expires) {
      console.log('✅ Password reset columns exist!');
    } else {
      console.log('❌ Password reset columns missing');
    }
    
    // List all tables
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('\nAll tables:', tables.map((t: any) => t.name));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

checkDatabase();