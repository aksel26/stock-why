// Stub required environment variables so lib/config.ts doesn't throw during tests
process.env.KIS_APP_KEY = "test";
process.env.KIS_APP_SECRET = "test";
process.env.KIS_ACCOUNT_NO = "test";
process.env.KIS_ACCOUNT_PRODUCT_CODE = "01";
process.env.KIS_BASE_URL = "https://openapi.koreainvestment.com:9443";
process.env.DART_API_KEY = "test";
process.env.NAVER_CLIENT_ID = "test";
process.env.NAVER_CLIENT_SECRET = "test";
process.env.GEMINI_API_KEY = "test";
process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test";
