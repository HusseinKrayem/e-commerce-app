const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validation');

async function cartRoutes(fastify, options) {

    // fastify.addHook('onRequest', authMiddleware);

    fastify.get('/cart', {
        preHandler: authMiddleware
    }, cartController.getCart);

    fastify.post('/cart/items', {
        preHandler: [authMiddleware, validateRequest('cartAddItem')]
    }, cartController.addToCart);

    fastify.put('/cart/items/:itemId', {
        preHandler: [authMiddleware, validateRequest('cartUpdateItem')]
    }, cartController.updateCartItem);

    fastify.delete('/cart/items/:itemId', {
        preHandler: authMiddleware
    }, cartController.removeFromCart);

    fastify.delete('/cart', {
        preHandler: authMiddleware
    }, cartController.clearCart);
}

module.exports = cartRoutes;