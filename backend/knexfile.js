"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var config = {
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
        client: 'sqlite3',
        connection: {
            // Use DATABASE_URL if provided, otherwise fall back to default paths
            filename: process.env.DATABASE_URL || (process.env.REPLIT ? '/home/runner/ezra-data/ezra.db' : path.join(__dirname, 'prod.sqlite3'))
        },
        migrations: {
            directory: path.join(__dirname, 'migrations'),
            extension: 'ts'
        },
        seeds: {
            directory: path.join(__dirname, 'seeds'),
            extension: 'ts'
        },
        useNullAsDefault: true,
        // PostgreSQL config for future use
        // client: 'postgresql',
        // connection: {
        //   host: process.env.DB_HOST,
        //   port: parseInt(process.env.DB_PORT || '5432'),
        //   database: process.env.DB_NAME,
        //   user: process.env.DB_USER,
        //   password: process.env.DB_PASSWORD
        // },
        // pool: {
        //   min: 2,
        //   max: 10
        // }
    }
};
exports.default = config;
