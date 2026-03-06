/**
 * Simple KIS API request throttle with retry.
 * KIS personal accounts limit ~5 requests/second.
 * This ensures a minimum gap between consecutive API calls
 * and retries on rate-limit errors (EGW00201).
 */

const MIN_INTERVAL_MS = 350; // 350ms between calls ≈ max ~2.8 req/s (safe margin)
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
let lastCallTime = 0;
let queue: Promise<void> = Promise.resolve();

function isRateLimitError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("EGW00201");
}

export function throttleKis<T>(fn: () => Promise<T>): Promise<T> {
  const execute = async (): Promise<T> => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const now = Date.now();
      const elapsed = now - lastCallTime;
      if (elapsed < MIN_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
      }
      lastCallTime = Date.now();

      try {
        return await fn();
      } catch (err) {
        if (isRateLimitError(err) && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    throw new Error("throttleKis: unreachable");
  };

  // Chain onto the queue so calls are serialized
  const result = queue.then(execute, execute);
  queue = result.then(() => {}, () => {});
  return result;
}
