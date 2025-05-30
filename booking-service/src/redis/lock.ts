import Redis from 'ioredis';
import Redlock from 'redlock';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const redlock = new Redlock([redis], {
  retryCount: 3,
  retryDelay: 200, // ms
});

export { redlock };
