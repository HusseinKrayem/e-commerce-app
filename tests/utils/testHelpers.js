const jwt = require('jsonwebtoken');

const testHelpers = {
  generateTestToken: (userId, role = 'user') => {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only',
      { expiresIn: '1h' }
    );
  },

  testUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  },

  testAdmin: {
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },

  testProduct: {
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    category: 'electronics',
    stock: 10,
    availability: true
  }
};

module.exports = testHelpers;