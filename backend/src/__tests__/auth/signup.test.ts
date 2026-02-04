import request from 'supertest';
import { createTestServer } from '../utils/testServer';
import { clearDatabase, createTestUser } from '../utils/testHelpers';
import prisma from '../../utils/prisma';

const app = createTestServer();

describe('POST /api/auth/signup', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('Successful signup', () => {
    it('should create a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.message).toBe('User created successfully');
    });

    it('should create a user without optional name field', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'noname@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('noname@example.com');
      expect(response.body.user.name).toBeNull();
    });

    it('should hash the password before storing', async () => {
      const password = 'mySecretPassword';

      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'secure@example.com',
          password,
        });

      const user = await prisma.user.findUnique({
        where: { email: 'secure@example.com' },
      });

      expect(user).not.toBeNull();
      expect(user!.password).not.toBe(password);
      expect(user!.password.length).toBeGreaterThan(50);
    });

    it('should return a valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'tokentest@example.com',
          password: 'password123',
        });

      const token = response.body.token;
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 when both email and password are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Duplicate user errors', () => {
    it('should return 409 when email already exists', async () => {
      await createTestUser('existing@example.com', 'password123');

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'newpassword456',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists with this email');
    });

    it('should be case-sensitive for email uniqueness', async () => {
      await createTestUser('Test@Example.com', 'password123');

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Database persistence', () => {
    it('should persist user data to the database', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'persist@example.com',
          password: 'password123',
          name: 'Persistent User',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'persist@example.com' },
      });

      expect(user).not.toBeNull();
      expect(user!.name).toBe('Persistent User');
      expect(user!.createdAt).toBeInstanceOf(Date);
      expect(user!.updatedAt).toBeInstanceOf(Date);
    });
  });
});
