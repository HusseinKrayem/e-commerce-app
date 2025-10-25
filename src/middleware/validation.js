const { validationSchemas } = require('../utils/validationSchemas');

const validateRequest = (schemaName) => {
  return async (request, reply) => {
    try {
      const schema = validationSchemas[schemaName];
      if (!schema) {
        return reply.status(500).send({
          success: false,
          message: 'Validation schema not found'
        });
      }

      const { error, value } = schema.validate(request.body);
      
      if (error) {
        return reply.status(400).send({
          success: false,
          message: 'Validation error',
          error: error.details[0].message
        });
      }

      request.body = value;
      
    } catch (error) {
      console.error('Validation middleware error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error during validation'
      });
    }
  };
};

module.exports = { validateRequest };