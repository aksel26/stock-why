import { Redis } from "@upstash/redis";
import { logError } from "../utils/logger";
import { useMock } from "../config";

function getRedisClient(): Redis {
  // Lazy initialization — env vars read at call time, not module load
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis env vars not configured");
  }
  return new Redis({ url, token });
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (useMock()) return null;
  try {
    const client = getRedisClient();
    const value = await client.get<T>(key);
    return value ?? null;
  } catch (err) {
    logError("cache", `getCache failed for key=${key}`, err);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (useMock()) return;
  try {
    const client = getRedisClient();
    await client.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    logError("cache", `setCache failed for key=${key}`, err);
  }
}

/**
 * Returns cached value if fresh. If stale (beyond ttl but within staleTtl),
 * returns the value with a flag so the caller can revalidate in background.
 */
export async function getCacheWithStale<T>(
  key: string
): Promise<{ value: T; stale: boolean } | null> {
  if (useMock()) return null;
  try {
    const client = getRedisClient();
    const value = await client.get<T>(key);
    if (value === null || value === undefined) return null;
    // Upstash TTL check: if TTL < 60s consider stale for background revalidation
    const ttl = await client.ttl(key);
    const stale = ttl !== -1 && ttl < 60;
    return { value, stale };
  } catch (err) {
    logError("cache", `getCacheWithStale failed for key=${key}`, err);
    return null;
  }
}
