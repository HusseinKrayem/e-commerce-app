const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const { validateRequest } = require('../middleware/validation');

async function productsRoutes(fastify, options) {

    fastify.get('/products', productController.getAllProducts);
    fastify.get('/products/search', productController.searchProducts);
    fastify.get('/products/:id', productController.getProductById);

    fastify.post('/products', {
        preHandler: [authMiddleware, adminAuth, validateRequest('productCreate')]
    }, productController.createProduct);

    fastify.put('/products/:id', {
        preHandler: [authMiddleware, adminAuth, validateRequest('productUpdate')]
    }, productController.updateProduct);

    fastify.delete('/products/:id', {
        preHandler: [authMiddleware, adminAuth]
    }, productController.deleteProduct);
}

module.exports = productsRoutes;