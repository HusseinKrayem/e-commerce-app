const ordersController = require('../controllers/ordersController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const { validateRequest } = require('../middleware/validation');

async function ordersRoutes(fastify, options) {

  // fastify.addHook('onRequest', authMiddleware);

  fastify.post('/orders', {
    preHandler: [authMiddleware, validateRequest('orderCreate')]
  }, ordersController.createOrder);

  fastify.get('/orders', {
    preHandler: authMiddleware
  }, ordersController.getUserOrders);

  fastify.get('/orders/:id', {
    preHandler: authMiddleware
  }, ordersController.getOrderById);

  fastify.get('/admin/orders', {
    preHandler: [authMiddleware, adminAuth]
  }, ordersController.getAllOrders);

  fastify.put('/admin/orders/:id/status', {
    preHandler: [authMiddleware, adminAuth, validateRequest('orderStatusUpdate')]
  }, ordersController.updateOrderStatus);

}

module.exports = ordersRoutes;