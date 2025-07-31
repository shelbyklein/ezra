// Database connection setup
import knex from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';

// Override database connection if DATABASE_URL is provided
const dbConfig = { ...config[environment] };
if (process.env.DATABASE_URL) {
  if (dbConfig.connection && typeof dbConfig.connection === 'object') {
    dbConfig.connection = {
      filename: process.env.DATABASE_URL
    };
  }
}

const db = knex(dbConfig);

export default db;