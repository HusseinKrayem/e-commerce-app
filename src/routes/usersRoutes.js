const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const { validateRequest } = require('../middleware/validation');

async function userRoutes(fastify, options) {

    // fastify.addHook('onRequest', authMiddleware);

   fastify.get('/users', {
        preHandler: [authMiddleware, adminAuth]
    }, usersController.getAllUsers);

    fastify.get('/users/me', {
        preHandler: authMiddleware
    }, usersController.getCurrentUser);

    fastify.get('/users/:id', {
        preHandler: authMiddleware
    }, usersController.getUserById);

    fastify.put('/users/:id', {
        preHandler: [authMiddleware, validateRequest('userUpdate')]
    }, usersController.updateUser);

    fastify.delete('/users/:id', {
        preHandler: authMiddleware
    }, usersController.deleteUser);

    fastify.post('/admin/users', {
        preHandler: [authMiddleware, adminAuth, validateRequest('userRegister')]
    }, usersController.createAdminUser);
}

module.exports = userRoutes;