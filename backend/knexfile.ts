// Database configuration for Knex.js
import type { Knex } from 'knex';
import * as path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'dev.sqlite3')
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts'
    },
    useNullAsDefault: true
  },

  test: {
    client: 'sqlite3',
    connection: ':memory:',
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts'
    }
  }
};

export default config;