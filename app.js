require('dotenv').config();
const fastify = require('fastify');
const connectDB = require('./src/config/database');
const rateLimit = require('@fastify/rate-limit');
const rateLimitConfig = require('./src/config/rateLimit');
const cors = require('@fastify/cors');
const path = require('path');
const fastifyStatic = require('@fastify/static');

const app = fastify({ logger: true });

connectDB();

app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
});

app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/',
});

app.register(rateLimit, rateLimitConfig);
app.register(require('./src/routes/authRoutes'), { prefix: '/api/authMiddleware' });
app.register(require('./src/routes/usersRoutes'), { prefix: '/api' });
app.register(require('./src/routes/productsRoutes'), { prefix: '/api' });
app.register(require('./src/routes/cartRoutes'), { prefix: '/api' });
app.register(require('./src/routes/ordersRoutes'), { prefix: '/api' });

app.setNotFoundHandler((request, reply) => {
    if (request.raw.url.startsWith('/api/')) {
        reply.status(404).send({ error: 'API endpoint not found' });
    } else {
        reply.sendFile('index.html');
    }
});

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server is running on port 3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();