import Redis from "ioredis";

let redisClient = null;
let isRedisConnected = false;

const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 200, 1000);
    },
    maxRetriesPerRequest: 1,
  });

  client.on("connect", () => {
    isRedisConnected = true;
    console.log("Redis connected");
  });

  client.on("error", (err) => {
    isRedisConnected = false;
    // Silently fail — app continues without cache
  });

  client.on("close", () => {
    isRedisConnected = false;
  });

  return client;
};

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    redisClient.connect().catch(() => {});
  }
  return redisClient;
};

export const isRedisAvailable = () => isRedisConnected;

/**
 * Get a value from Redis cache. Returns null if unavailable.
 */
export const cacheGet = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * Set a value in Redis cache with a TTL (seconds). No-op if unavailable.
 */
export const cacheSet = async (key, value, ttlSeconds) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore
  }
};

/**
 * Delete keys matching a pattern from Redis. No-op if unavailable.
 */
export const cacheDel = async (...keys) => {
  if (!isRedisConnected || keys.length === 0) return;
  try {
    await redisClient.del(...keys);
  } catch {
    // ignore
  }
};

/**
 * Delete all keys matching a glob pattern. No-op if unavailable.
 */
export const cacheDelPattern = async (pattern) => {
  if (!isRedisConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(...keys);
  } catch {
    // ignore
  }
};
