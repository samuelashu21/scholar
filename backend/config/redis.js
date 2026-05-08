import Redis from "ioredis";

const isRedisEnabled =
  process.env.REDIS_ENABLED !== "false" &&
  (Boolean(process.env.REDIS_URL) || Boolean(process.env.REDIS_HOST));

let redisClient;

export const getRedisClient = () => {
  if (!isRedisEnabled) return null;

  if (!redisClient) {
    const redisOptions = process.env.REDIS_URL
      ? process.env.REDIS_URL
      : {
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: Number(process.env.REDIS_PORT || 6379),
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        };

    redisClient = new Redis(redisOptions);
    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });
  }

  return redisClient;
};

export const getBullRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  };
};

export { isRedisEnabled };
