# E-commerce Backend API
A feature-rich, production-ready backend API for an e-commerce platform built with Fastify, MongoDB, and Redis.

# API Documentation (Postman)
- Import the collection file: `Ecommerce_Backend_API.postman_collection.json`. You can find it in /docs.
- Base URL: `http://localhost:3000`
- Includes all endpoints for Auth, Users, Products, Orders, and Cart.

# Admin Setup
Create a default admin user for testing:
```bash
node createAdmin.js

# Rate Limiting
- The application is correctly configured for Redis-based rate limiting
- Redis server is not currently running on your local machine
- The rate limiting functionality will fall back to memory store temporarily