const Redis = require('ioredis');

let redisClient;
let usingRedis = false;
let statusLogged = false;

const logStatus = (message) => {
  if (!statusLogged) {
    console.log(message);
    statusLogged = true;
  }
};

try {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    connectTimeout: 2000,
    lazyConnect: true
  });

  redisClient.ping().then(() => {
    usingRedis = true;
    logStatus('Rate limiting: Redis (100 requests/minute)');
  }).catch(() => {
    logStatus('Rate limiting: Memory Store (100 requests/minute)');
    redisClient = null;
  });

  redisClient.on('error', () => {
    logStatus('Rate limiting: Memory Store (100 requests/minute)');
    redisClient = null;
  });

} catch (error) {
  logStatus('Rate limiting: Memory Store (100 requests/minute)');
  redisClient = null;
}

module.exports = {
  max: 100,
  timeWindow: '1 minute',
  redis: redisClient,
  skipOnError: true,
  keyGenerator: (request) => request.ip
};