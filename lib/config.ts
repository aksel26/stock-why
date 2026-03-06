import { z } from "zod";

export function useMock(): boolean {
  return process.env.USE_MOCK !== "false";
}

const envSchema = z.object({
  // KIS Open API
  KIS_APP_KEY: z.string().min(1),
  KIS_APP_SECRET: z.string().min(1),
  KIS_ACCOUNT_NO: z.string().min(1),
  KIS_ACCOUNT_PRODUCT_CODE: z.string().default("01"),
  KIS_BASE_URL: z.string().url().default("https://openapi.koreainvestment.com:9443"),

  // DART
  DART_API_KEY: z.string().min(1),

  // Naver News
  NAVER_CLIENT_ID: z.string().min(1),
  NAVER_CLIENT_SECRET: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (useMock()) {
    return {} as Env;
  }
  if (_env) return _env;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  _env = parsed.data;
  return _env;
}

// ── Constants ──

export const CACHE_TTL = {
  CONTEXT_MARKET_OPEN: 5 * 60,       // 5분 (장중)
  CONTEXT_MARKET_CLOSED: 60 * 60,       // 1시간 (장외)
  AI_ANALYSIS: 60 * 60,                // 1시간
  AVG20: 24 * 60 * 60,                // 24시간
  KIS_TOKEN: 23 * 60 * 60,            // 23시간
} as const;

export const RULE_THRESHOLDS = {
  FOREIGN_STRONG_MULTIPLIER: 2,
  SHORT_INCREASE_RATE: 15,
  CREDIT_WARNING_RATE: 5,
  CREDIT_HIGH_RATE: 8,
  MACRO_SUPPORT_NASDAQ: 1,
  MACRO_SUPPORT_USD: -0.5,
  MACRO_PRESSURE_NASDAQ: -1,
  MACRO_PRESSURE_USD: 0.5,
  VOLATILITY_THRESHOLD: 3,
} as const;

export const AI_TRIGGER = {
  VOLATILITY_THRESHOLD: 3,
  MIN_HIGH_SIGNALS: 1,
} as const;

export const TREND_PERIODS = {
  "1W": 5,
  "1M": 22,
  "3M": 65,
  "6M": 130,
  "1Y": 250,
} as const;

export const KIS_MAX_ITEMS_PER_CALL = 100;
