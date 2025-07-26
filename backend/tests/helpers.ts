/**
 * Test helper functions
 */

import request from 'supertest';
import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface TestUser {
  id: number;
  email: string;
  username: string;
  password: string;
  token?: string;
}

export const testUsers = {
  alice: {
    email: 'alice@test.com',
    username: 'alice',
    password: 'password123',
  },
  bob: {
    email: 'bob@test.com',
    username: 'bob',
    password: 'password456',
  },
};

/**
 * Create a test user and return with auth token
 */
export async function createTestUser(
  db: Knex,
  userData: Partial<TestUser> = {}
): Promise<TestUser> {
  const user = {
    ...testUsers.alice,
    ...userData,
  };

  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  const [userId] = await db('users').insert({
    email: user.email,
    username: user.username,
    password: hashedPassword,
    created_at: new Date().toISOString(),
  });

  const token = jwt.sign(
    { id: userId, email: user.email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '7d' }
  );

  return {
    id: userId,
    ...user,
    token,
  };
}

/**
 * Clean up test database
 */
export async function cleanupDatabase(db: Knex): Promise<void> {
  // Delete in reverse order of foreign key dependencies
  await db('task_tags').delete();
  await db('project_tags').delete();
  await db('notebook_tags').delete();
  await db('attachments').delete();
  await db('notes').delete();
  await db('tasks').delete();
  await db('pages').delete();
  await db('folders').delete();
  await db('notebooks').delete();
  await db('projects').delete();
  await db('tags').delete();
  await db('users').delete();
}

/**
 * Create authenticated request
 */
export function authRequest(app: any, token: string) {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}