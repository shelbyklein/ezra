/**
 * Test setup for backend API tests
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Set test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'test.db';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Create test database directory if it doesn't exist
const testDbDir = path.join(__dirname, '../data');
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console.log = jest.fn();
  global.console.info = jest.fn();
  global.console.warn = jest.fn();
}

// Add custom matchers if needed
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid date`,
    };
  },
});