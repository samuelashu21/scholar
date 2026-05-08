import { getRedisClient } from "../config/redis.js";

export const getCachedValue = async (key) => {
  const client = await getRedisClient();
  if (!client) return null;
  const value = await client.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const setCachedValue = async (key, value, ttlSeconds) => {
  const client = await getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

export const deleteCacheByPattern = async (pattern) => {
  const client = await getRedisClient();
  if (!client) return;

  let cursor = "0";
  do {
    const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    if (keys.length) {
      await client.del(...keys);
    }
  } while (cursor !== "0");
};
