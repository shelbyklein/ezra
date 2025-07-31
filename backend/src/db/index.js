"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Database connection setup
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../../knexfile"));
const environment = process.env.NODE_ENV || 'development';
// Override database connection if DATABASE_URL is provided
const dbConfig = { ...knexfile_1.default[environment] };
if (process.env.DATABASE_URL) {
    if (dbConfig.connection && typeof dbConfig.connection === 'object') {
        dbConfig.connection = {
            filename: process.env.DATABASE_URL
        };
    }
}
const db = (0, knex_1.default)(dbConfig);
exports.default = db;
