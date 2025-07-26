/**
 * Authentication API integration tests
 */

import request from 'supertest';
import express from 'express';
import knex from '../src/db';
import { cleanupDatabase, testUsers } from './helpers';

// Import the app setup
let app: express.Application;

describe('Authentication API', () => {
  beforeAll(async () => {
    // Run migrations
    await knex.migrate.latest();
    
    // Import app after migrations
    const appModule = await import('../src/index');
    app = appModule.app;
  });

  beforeEach(async () => {
    await cleanupDatabase(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUsers.alice.email,
          username: testUsers.alice.username,
          password: testUsers.alice.password,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: testUsers.alice.email,
        username: testUsers.alice.username,
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUsers.alice.email,
          // missing username and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: testUsers.alice.username,
          password: testUsers.alice.password,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.alice);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUsers.alice,
          username: 'different-username',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already exists/i);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUsers.alice.email,
          username: testUsers.alice.username,
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.alice);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.alice.email,
          password: testUsers.alice.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: testUsers.alice.email,
        username: testUsers.alice.username,
      });
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.alice.email,
          password: 'wrong-password',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid credentials/i);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid credentials/i);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.alice.email,
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});