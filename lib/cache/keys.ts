// ── Cache Key Builders ──

export const CacheKeys = {
  context: (code: string, date: string) => `context:${code}:${date}`,
  aiAnalysis: (code: string, date: string) => `ai:${code}:${date}`,
  kisToken: () => `kis:token`,
  avg20: (code: string) => `avg20:${code}`,
  price: (code: string, date: string) => `price:${code}:${date}`,
  supply: (code: string, date: string) => `supply:${code}:${date}`,
  short: (code: string, date: string) => `short:${code}:${date}`,
  credit: (code: string, date: string) => `credit:${code}:${date}`,
  macro: (date: string) => `macro:${date}`,
  news: (code: string, date: string) => `news:${code}:${date}`,
  disclosure: (code: string, date: string) => `disclosure:${code}:${date}`,
} as const;

// ── TTL Helpers ──

import { CACHE_TTL } from "../config";
import { isMarketOpen } from "../utils/date";

export function contextTtl(): number {
  return isMarketOpen() ? CACHE_TTL.CONTEXT_MARKET_OPEN : CACHE_TTL.CONTEXT_MARKET_CLOSED;
}
