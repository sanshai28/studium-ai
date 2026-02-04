import request from 'supertest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createTestServer } from '../utils/testServer';
import prisma from '../../utils/prisma';
import { clearDatabase, createTestUser } from '../utils/testHelpers';

// Mock the email service to prevent actual emails from being sent during tests
jest.mock('../../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  verifyEmailConfig: jest.fn().mockResolvedValue(true),
}));

const app = createTestServer();

describe('Password Reset Flow', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/request-password-reset', () => {
    it('should accept email and return success message', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.message).toBe(
        'If an account with that email exists, a password reset link has been sent'
      );
    });

    it('should generate and store reset token in database', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({ email: user.email })
        .expect(200);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.resetToken).toBeTruthy();
      expect(updatedUser?.resetToken).toHaveLength(64); // 32 bytes as hex = 64 chars
      expect(updatedUser?.resetTokenExpiry).toBeInstanceOf(Date);
      expect(updatedUser?.resetTokenExpiry!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should set token expiry to 15 minutes in the future', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      const beforeRequest = Date.now();
      await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({ email: user.email })
        .expect(200);
      const afterRequest = Date.now();

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      const expiryTime = updatedUser?.resetTokenExpiry!.getTime();
      const expectedMin = beforeRequest + 15 * 60 * 1000 - 1000; // 15 min - 1 sec tolerance
      const expectedMax = afterRequest + 15 * 60 * 1000 + 1000; // 15 min + 1 sec tolerance

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMin);
      expect(expiryTime).toBeLessThanOrEqual(expectedMax);
    });

    it('should return same success message for non-existent email (prevent enumeration)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toBe(
        'If an account with that email exists, a password reset link has been sent'
      );
    });

    it('should return error if email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should overwrite previous reset token if requested again', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      // First request
      await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({ email: user.email })
        .expect(200);

      const firstToken = (await prisma.user.findUnique({ where: { id: user.id } }))?.resetToken;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second request
      await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({ email: user.email })
        .expect(200);

      const secondToken = (await prisma.user.findUnique({ where: { id: user.id } }))?.resetToken;

      expect(secondToken).toBeTruthy();
      expect(secondToken).not.toBe(firstToken);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUser('test@example.com', 'oldpassword123');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(200);

      expect(response.body.message).toBe('Password has been reset successfully');

      // Verify password was actually changed
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      const isNewPasswordValid = await bcrypt.compare('newpassword123', updatedUser!.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should clear reset token after successful password reset', async () => {
      const user = await createTestUser('test@example.com', 'oldpassword123');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(200);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.resetToken).toBeNull();
      expect(updatedUser?.resetTokenExpiry).toBeNull();
    });

    it('should reject expired token', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() - 1000); // Expired 1 second ago

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });

    it('should reject if token is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject if new password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'some-token',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject password shorter than 6 characters', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '12345', // Only 5 characters
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should hash the new password with bcrypt', async () => {
      const user = await createTestUser('test@example.com', 'oldpassword123');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(200);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      // Password should be hashed
      expect(updatedUser!.password).not.toBe('newpassword123');
      expect(updatedUser!.password.length).toBeGreaterThan(50);

      // Should be able to verify with bcrypt
      const isValid = await bcrypt.compare('newpassword123', updatedUser!.password);
      expect(isValid).toBe(true);
    });

    it('should not allow reusing the same token twice', async () => {
      const user = await createTestUser('test@example.com', 'oldpassword123');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      // First use - should succeed
      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(200);

      // Second use - should fail
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'anotherpassword123',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });
  });

  describe('Password Reset Integration', () => {
    it('should allow user to sign in with new password after reset', async () => {
      const user = await createTestUser('test@example.com', 'oldpassword123');

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      // Reset password
      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        })
        .expect(200);

      // Try signing in with old password - should fail
      await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: user.email,
          password: 'oldpassword123',
        })
        .expect(401);

      // Try signing in with new password - should succeed
      const signinResponse = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: user.email,
          password: 'newpassword123',
        })
        .expect(200);

      expect(signinResponse.body.message).toBe('Signed in successfully');
      expect(signinResponse.body.token).toBeTruthy();
    });
  });
});
