import { getCache, setCache } from "../../cache/redis";
import { CacheKeys } from "../../cache/keys";
import { CACHE_TTL } from "../../config";
import { log, logError } from "../../utils/logger";

interface KisTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface KisToken {
  accessToken: string;
  expiresAt: number;
}

// In-memory token cache + singleton promise to prevent concurrent token requests
let memoryToken: KisToken | null = null;
let tokenPromise: Promise<KisToken> | null = null;

async function fetchNewToken(requestId: string): Promise<KisToken> {
  const appKey = process.env.KIS_APP_KEY;
  const appSecret = process.env.KIS_APP_SECRET;
  const baseUrl = process.env.KIS_BASE_URL ?? "https://openapi.koreainvestment.com:9443";

  if (!appKey || !appSecret) {
    throw new Error("KIS_APP_KEY or KIS_APP_SECRET not configured");
  }

  const url = `${baseUrl}/oauth2/tokenP`;
  const body = {
    grant_type: "client_credentials",
    appkey: appKey,
    appsecret: appSecret,
  };

  log(requestId, "kis:auth:fetchToken");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KIS token request failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as KisTokenResponse;
  const expiresAt = Date.now() + data.expires_in * 1000;

  return { accessToken: data.access_token, expiresAt };
}

export async function getKisToken(requestId: string): Promise<string> {
  // 1. Check in-memory cache first (works without Redis)
  if (memoryToken && memoryToken.expiresAt > Date.now() + 60_000) {
    return memoryToken.accessToken;
  }

  // 2. Check Redis cache
  const cached = await getCache<KisToken>(CacheKeys.kisToken());
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    memoryToken = cached;
    return cached.accessToken;
  }

  // 3. Fetch new token (singleton promise prevents concurrent requests)
  if (tokenPromise) {
    const token = await tokenPromise;
    return token.accessToken;
  }

  try {
    tokenPromise = fetchNewToken(requestId);
    const token = await tokenPromise;
    memoryToken = token;
    await setCache(CacheKeys.kisToken(), token, CACHE_TTL.KIS_TOKEN);
    return token.accessToken;
  } catch (err) {
    logError(requestId, "kis:auth:getKisToken failed", err);
    throw err;
  } finally {
    tokenPromise = null;
  }
}
