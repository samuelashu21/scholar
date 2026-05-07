import Redis from "ioredis";

let redis = null;

const getRedisClient = () => {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("REDIS_URL not set — caching disabled");
    return null;
  }

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redis.on("connect", () => console.log("Redis connected"));
  redis.on("error", (err) => console.error("Redis error:", err.message));

  return redis;
};

/**
 * Get a cached value. Returns null on miss or if Redis unavailable.
 */
export const cacheGet = async (key) => {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * Set a cached value with a TTL in seconds.
 */
export const cacheSet = async (key, value, ttlSeconds) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // swallow — cache is best-effort
  }
};

/**
 * Delete one or more keys (supports glob patterns via SCAN + DEL).
 */
export const cacheDel = async (...keys) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(...keys);
  } catch {
    // swallow
  }
};

/**
 * Invalidate all keys matching a pattern (e.g. "products:*").
 */
export const cacheInvalidatePattern = async (pattern) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // swallow
  }
};

export default getRedisClient;
