import { getRedisClient, isRedisEnabled } from "../config/redis.js";

const redis = getRedisClient();

export const withCache = async (key, fallbackFn, ttlSeconds = 300) => {
  if (!isRedisEnabled || !redis) {
    return fallbackFn();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Cache read error:", err.message);
  }

  const freshData = await fallbackFn();

  try {
    await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
  } catch (err) {
    console.error("Cache write error:", err.message);
  }

  return freshData;
};

export const invalidateCachePatterns = async (patterns = []) => {
  if (!isRedisEnabled || !redis || !patterns.length) return;

  try {
    for (const pattern of patterns) {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;

        if (keys.length) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    }
  } catch (err) {
    console.error("Cache invalidation error:", err.message);
  }
};

export const cacheKeys = {
  categories: () => "categories:list",
  products: ({ keyword = "", category = "", subcategory = "", page = 1, limit = 8, exclude = "", userId = "anon" }) =>
    `products:list:${userId}:${keyword}:${category}:${subcategory}:${page}:${limit}:${exclude}`,
  productById: ({ id, userId = "anon" }) => `products:detail:${id}:${userId}`,
};
