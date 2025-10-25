const Joi = require('joi');

const validationSchemas = {
  userRegister: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').default('user')
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email()
  }),

  productCreate: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    stock: Joi.number().min(0).required(),
    availability: Joi.boolean().default(true),
    image: Joi.string().uri().allow(''),
    tags: Joi.array().items(Joi.string())
  }),

  productUpdate: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().min(10),
    price: Joi.number().min(0),
    category: Joi.string(),
    stock: Joi.number().min(0),
    availability: Joi.boolean(),
    image: Joi.string().uri().allow(''),
    tags: Joi.array().items(Joi.string())
  }),

  cartAddItem: Joi.object({
    productId: Joi.string().hex().length(24).required(), // MongoDB ObjectId
    quantity: Joi.number().min(1).default(1)
  }),

  cartUpdateItem: Joi.object({
    quantity: Joi.number().min(1).required()
  }),

  orderCreate: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().valid('credit_card', 'paypal', 'cash_on_delivery').required()
  }),

  orderStatusUpdate: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required()
  })
};

module.exports = { validationSchemas };