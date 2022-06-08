import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = process.env.REDIS_HOST && process.env.REDIS_PORT ? new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT as unknown as number,
    }) : new Redis({
      port: 5002,
      host: "localhost",
    });
  }
  return redisClient;
}