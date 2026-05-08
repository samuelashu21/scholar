import Redis from "ioredis";

let redisClient = null;

const createRedisClient = () => {
  if (!process.env.REDIS_URL) return null;
  return new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
  });
};

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  if (!redisClient) return null;

  if (redisClient.status === "wait") {
    await redisClient.connect();
  }

  return redisClient;
};

export const closeRedisClient = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
