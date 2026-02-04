import request from 'supertest';
import { createTestServer } from '../utils/testServer';
import { clearDatabase, createTestUser } from '../utils/testHelpers';
import prisma from '../../utils/prisma';

const app = createTestServer();

describe('POST /api/auth/signin', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('Successful signin', () => {
    it('should sign in with valid credentials', async () => {
      await createTestUser('user@example.com', 'password123', 'Test User');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('user@example.com');
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.message).toBe('Signed in successfully');
    });

    it('should return a valid JWT token', async () => {
      await createTestUser('tokenuser@example.com', 'password123');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'tokenuser@example.com',
          password: 'password123',
        });

      const token = response.body.token;
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should sign in user without name', async () => {
      await createTestUser('noname@example.com', 'password123');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'noname@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBeNull();
    });
  });

  describe('Validation errors', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 when both email and password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Authentication errors', () => {
    it('should return 401 when user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 401 when password is incorrect', async () => {
      await createTestUser('user@example.com', 'correctpassword');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should be case-sensitive for email', async () => {
      await createTestUser('User@Example.com', 'password123');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('Password security', () => {
    it('should not reveal whether email exists in error message', async () => {
      await createTestUser('exists@example.com', 'password123');

      const nonExistentResponse = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      const wrongPasswordResponse = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'exists@example.com',
          password: 'wrongpassword',
        });

      expect(nonExistentResponse.body.error).toBe(wrongPasswordResponse.body.error);
    });

    it('should verify password using bcrypt comparison', async () => {
      await createTestUser('secure@example.com', 'mySecurePassword123');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'secure@example.com',
          password: 'mySecurePassword123',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Token generation', () => {
    it('should generate different tokens for different signin attempts', async () => {
      await createTestUser('tokentest@example.com', 'password123');

      const response1 = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'tokentest@example.com',
          password: 'password123',
        });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response2 = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'tokentest@example.com',
          password: 'password123',
        });

      expect(response1.body.token).not.toBe(response2.body.token);
    });
  });

  describe('Response format', () => {
    it('should return user data without sensitive information', async () => {
      await createTestUser('privacy@example.com', 'password123', 'Privacy User');

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'privacy@example.com',
          password: 'password123',
        });

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('updatedAt');
    });
  });
});
