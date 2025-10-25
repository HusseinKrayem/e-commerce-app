const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');

async function authRoutes(fastify, options) {

    fastify.post('/register', {
    preHandler: validateRequest('userRegister')
  }, authController.register);

  fastify.post('/login', {
    preHandler: validateRequest('userLogin')
  }, authController.login);
}

module.exports = authRoutes;