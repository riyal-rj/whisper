
import { createClient } from 'redis';
import { ENV_VARS } from './env.config';

export const redisClient = createClient({
  url: ENV_VARS.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectToRedis = async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
};
