const request = require('supertest');
const buildTestApp = require('./testApp');
const User = require('../src/models/User');
const { generateTestToken } = require('./utils/testHelpers');

describe('Users API', () => {
  let app;
  let userToken;
  let adminToken;
  let testUserId;

  beforeAll(async () => {
    app = buildTestApp();
    await app.ready();


    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    });

    const admin = await User.create({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    userToken = generateTestToken(user._id, 'user');
    adminToken = generateTestToken(admin._id, 'admin');
    testUserId = user._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app.server)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('testuser@example.com');
    });

    it('should reject unauthorized access', async () => {
      await request(app.server)
        .get('/api/users/me')
        .expect(401);
    });
  });

  describe('GET /api/users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app.server)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject non-admin access to all users', async () => {
      const response = await request(app.server)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile', async () => {
      const response = await request(app.server)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
          email: 'updated@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app.server)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });
  });
});