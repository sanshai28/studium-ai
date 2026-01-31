import request from 'supertest';
import { createTestServer } from '../utils/testServer';
import {
  clearDatabase,
  createTestUser,
  createTestNotebook,
  generateValidToken,
} from '../utils/testHelpers';
import prisma from '../../utils/prisma';

const app = createTestServer();

describe('Notebook CRUD Operations', () => {
  let user1: any;
  let user2: any;
  let token1: string;
  let token2: string;

  beforeEach(async () => {
    await clearDatabase();
    user1 = await createTestUser('user1@example.com', 'password123', 'User One');
    user2 = await createTestUser('user2@example.com', 'password123', 'User Two');
    token1 = generateValidToken(user1.id);
    token2 = generateValidToken(user2.id);
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('GET /api/notebooks', () => {
    it('should return empty array when user has no notebooks', async () => {
      const response = await request(app)
        .get('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.notebooks).toEqual([]);
    });

    it('should return all notebooks for authenticated user', async () => {
      await createTestNotebook(user1.id, 'Notebook 1', 'Content 1');
      await createTestNotebook(user1.id, 'Notebook 2', 'Content 2');
      await createTestNotebook(user2.id, 'User 2 Notebook', 'User 2 Content');

      const response = await request(app)
        .get('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.notebooks).toHaveLength(2);
      expect(response.body.notebooks[0].title).toBeTruthy();
      expect(response.body.notebooks[0].content).toBeTruthy();
      expect(response.body.notebooks[0]).toHaveProperty('id');
      expect(response.body.notebooks[0]).toHaveProperty('createdAt');
      expect(response.body.notebooks[0]).toHaveProperty('updatedAt');
    });

    it('should return notebooks ordered by updatedAt desc', async () => {
      const notebook1 = await createTestNotebook(user1.id, 'First', 'Content 1');
      await new Promise((resolve) => setTimeout(resolve, 100));
      const notebook2 = await createTestNotebook(user1.id, 'Second', 'Content 2');

      const response = await request(app)
        .get('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.notebooks[0].id).toBe(notebook2.id);
      expect(response.body.notebooks[1].id).toBe(notebook1.id);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app).get('/api/notebooks');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/notebooks')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('GET /api/notebooks/:id', () => {
    it('should return notebook by id for authenticated user', async () => {
      const notebook = await createTestNotebook(
        user1.id,
        'My Notebook',
        'My Content'
      );

      const response = await request(app)
        .get(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.notebook.id).toBe(notebook.id);
      expect(response.body.notebook.title).toBe('My Notebook');
      expect(response.body.notebook.content).toBe('My Content');
      expect(response.body.notebook.userId).toBe(user1.id);
    });

    it('should return 404 for non-existent notebook', async () => {
      const response = await request(app)
        .get('/api/notebooks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Notebook not found');
    });

    it('should return 403 when accessing another user\'s notebook', async () => {
      const notebook = await createTestNotebook(
        user2.id,
        'User 2 Notebook',
        'User 2 Content'
      );

      const response = await request(app)
        .get(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 401 without authentication token', async () => {
      const notebook = await createTestNotebook(user1.id, 'Notebook', 'Content');

      const response = await request(app).get(`/api/notebooks/${notebook.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('POST /api/notebooks', () => {
    it('should create notebook with valid data', async () => {
      const response = await request(app)
        .post('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'New Notebook',
          content: 'New Content',
        });

      expect(response.status).toBe(201);
      expect(response.body.notebook).toHaveProperty('id');
      expect(response.body.notebook.title).toBe('New Notebook');
      expect(response.body.notebook.content).toBe('New Content');
      expect(response.body.notebook.userId).toBe(user1.id);
      expect(response.body.notebook).toHaveProperty('createdAt');
      expect(response.body.notebook).toHaveProperty('updatedAt');
    });

    it('should persist notebook in database', async () => {
      const response = await request(app)
        .post('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Persistent Notebook',
          content: 'Persistent Content',
        });

      const notebookInDb = await prisma.notebook.findUnique({
        where: { id: response.body.notebook.id },
      });

      expect(notebookInDb).toBeTruthy();
      expect(notebookInDb?.title).toBe('Persistent Notebook');
      expect(notebookInDb?.content).toBe('Persistent Content');
      expect(notebookInDb?.userId).toBe(user1.id);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'Content without title',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and content are required');
    });

    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Title without content',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and content are required');
    });

    it('should return 400 when both title and content are missing', async () => {
      const response = await request(app)
        .post('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and content are required');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app).post('/api/notebooks').send({
        title: 'Unauthorized Notebook',
        content: 'Unauthorized Content',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should handle long content', async () => {
      const longContent = 'A'.repeat(10000);
      const response = await request(app)
        .post('/api/notebooks')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Long Content Notebook',
          content: longContent,
        });

      expect(response.status).toBe(201);
      expect(response.body.notebook.content).toBe(longContent);
    });
  });

  describe('PUT /api/notebooks/:id', () => {
    it('should update notebook title and content', async () => {
      const notebook = await createTestNotebook(
        user1.id,
        'Original Title',
        'Original Content'
      );

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content',
        });

      expect(response.status).toBe(200);
      expect(response.body.notebook.id).toBe(notebook.id);
      expect(response.body.notebook.title).toBe('Updated Title');
      expect(response.body.notebook.content).toBe('Updated Content');
    });

    it('should update only title when content not provided', async () => {
      const notebook = await createTestNotebook(
        user1.id,
        'Original Title',
        'Original Content'
      );

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'New Title Only',
        });

      expect(response.status).toBe(200);
      expect(response.body.notebook.title).toBe('New Title Only');
      expect(response.body.notebook.content).toBe('Original Content');
    });

    it('should update only content when title not provided', async () => {
      const notebook = await createTestNotebook(
        user1.id,
        'Original Title',
        'Original Content'
      );

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          content: 'New Content Only',
        });

      expect(response.status).toBe(200);
      expect(response.body.notebook.title).toBe('Original Title');
      expect(response.body.notebook.content).toBe('New Content Only');
    });

    it('should update updatedAt timestamp', async () => {
      const notebook = await createTestNotebook(user1.id, 'Title', 'Content');
      const originalUpdatedAt = notebook.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(200);
      expect(new Date(response.body.notebook.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should return 404 for non-existent notebook', async () => {
      const response = await request(app)
        .put('/api/notebooks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Notebook not found');
    });

    it('should return 403 when updating another user\'s notebook', async () => {
      const notebook = await createTestNotebook(
        user2.id,
        'User 2 Notebook',
        'User 2 Content'
      );

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Hacked Title',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 401 without authentication token', async () => {
      const notebook = await createTestNotebook(user1.id, 'Title', 'Content');

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('DELETE /api/notebooks/:id', () => {
    it('should delete notebook', async () => {
      const notebook = await createTestNotebook(user1.id, 'To Delete', 'Content');

      const response = await request(app)
        .delete(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Notebook deleted successfully');

      const deletedNotebook = await prisma.notebook.findUnique({
        where: { id: notebook.id },
      });
      expect(deletedNotebook).toBeNull();
    });

    it('should return 404 for non-existent notebook', async () => {
      const response = await request(app)
        .delete('/api/notebooks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Notebook not found');
    });

    it('should return 403 when deleting another user\'s notebook', async () => {
      const notebook = await createTestNotebook(
        user2.id,
        'User 2 Notebook',
        'User 2 Content'
      );

      const response = await request(app)
        .delete(`/api/notebooks/${notebook.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');

      const notebookStillExists = await prisma.notebook.findUnique({
        where: { id: notebook.id },
      });
      expect(notebookStillExists).toBeTruthy();
    });

    it('should return 401 without authentication token', async () => {
      const notebook = await createTestNotebook(user1.id, 'Title', 'Content');

      const response = await request(app).delete(`/api/notebooks/${notebook.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('Cascade delete', () => {
    it('should delete notebooks when user is deleted', async () => {
      const notebook1 = await createTestNotebook(user1.id, 'Notebook 1', 'Content 1');
      const notebook2 = await createTestNotebook(user1.id, 'Notebook 2', 'Content 2');

      await prisma.user.delete({ where: { id: user1.id } });

      const deletedNotebook1 = await prisma.notebook.findUnique({
        where: { id: notebook1.id },
      });
      const deletedNotebook2 = await prisma.notebook.findUnique({
        where: { id: notebook2.id },
      });

      expect(deletedNotebook1).toBeNull();
      expect(deletedNotebook2).toBeNull();
    });
  });
});
