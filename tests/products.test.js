const request = require('supertest');
const buildTestApp = require('./testApp');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const { generateTestToken } = require('./utils/testHelpers');


describe('Products API', () => {
  let app;
  let userToken;
  let adminToken;
  let testProductId;

  beforeAll(async () => {
    app = buildTestApp();
    await app.ready();

    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123'
    });

    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    userToken = generateTestToken(user._id, 'user');
    adminToken = generateTestToken(admin._id, 'admin');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {

      await Product.create([
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          category: 'electronics',
          stock: 10
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 200,
          category: 'books',
          stock: 5
        }
      ]);
    });

    it('should get all products', async () => {
      const response = await request(app.server)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('totalProducts', 2);
    });

    it('should filter products by category', async () => {
      const response = await request(app.server)
        .get('/api/products?category=electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('electronics');
    });

    it('should paginate products', async () => {
      const response = await request(app.server)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toHaveProperty('hasNextPage', true);
    });
  });

  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const response = await request(app.server)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          description: 'New product description',
          price: 150,
          category: 'electronics',
          stock: 20
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Product');
      testProductId = response.body.data._id;
    });

    it('should reject product creation by non-admin', async () => {
      const response = await request(app.server)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Product',
          description: 'New product description',
          price: 150,
          category: 'electronics',
          stock: 20
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/search', () => {
    beforeEach(async () => {
      await Product.create({
        name: 'MacBook Pro',
        description: 'Apple laptop computer',
        price: 1999,
        category: 'electronics',
        stock: 5
      });
    });

    it('should search products by name', async () => {
      const response = await request(app.server)
        .get('/api/products/search?q=macbook')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toContain('MacBook');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const product = await Product.create({
        name: 'Single Product',
        description: 'Single product test',
        price: 99,
        category: 'test',
        stock: 1
      });

      const response = await request(app.server)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Single Product');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.server)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });
});