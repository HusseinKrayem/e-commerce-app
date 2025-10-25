const buildTestApp = () => {
  const fastify = require('fastify')();
  
  fastify.register(require('../src/routes/authRoutes'), { prefix: '/api/auth' });
  fastify.register(require('../src/routes/usersRoutes'), { prefix: '/api' });
  fastify.register(require('../src/routes/productsRoutes'), { prefix: '/api' });
  fastify.register(require('../src/routes/cartRoutes'), { prefix: '/api' });
  fastify.register(require('../src/routes/ordersRoutes'), { prefix: '/api' });

  
  return fastify;
};

module.exports = buildTestApp;