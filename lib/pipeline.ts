/**
 * Orchestrates the full analysis pipeline:
 * 1. Cache check
 * 2. Fetch all provider data in parallel
 * 3. Normalize + run rule engine
 * 4. AI analysis (Gemini with fallback)
 * 5. Cache result
 */

import { getCache, setCache } from "./cache/redis";
import { CacheKeys, contextTtl } from "./cache/keys";
import { CACHE_TTL, useMock } from "./config";
import { normalizeContext } from "./domain/normalize";
import { shouldTriggerAI } from "./domain/ruleEngine";
import { generateAnalysis } from "./ai/gemini";
import { generateFallback } from "./ai/fallback";
import { KisPriceClient, KisSupplyClient, KisShortClient, KisCreditClient, fetchDailyPrices } from "./providers/kis/client";
import { DartClient } from "./providers/dart/client";
import { NaverNewsClient } from "./providers/news/client";
import { MacroClient } from "./providers/macro/client";
import {
  MockKisPriceClient, MockKisSupplyClient, MockKisShortClient, MockKisCreditClient,
  MockDartClient, MockNaverNewsClient, MockMacroClient,
  mockFetchDailyPrices, mockGetStockName,
} from "./mocks/providers";
import { log, logError, createRequestId } from "./utils/logger";
import { today, getBusinessDaysAgo } from "./utils/date";
import type { AnalysisResponse, AiAnalysis } from "./domain/schema";

function createProviders() {
  if (useMock()) {
    return {
      price: new MockKisPriceClient(),
      supply: new MockKisSupplyClient(),
      short: new MockKisShortClient(),
      credit: new MockKisCreditClient(),
      dart: new MockDartClient(),
      news: new MockNaverNewsClient(),
      macro: new MockMacroClient(),
    };
  }
  return {
    price: new KisPriceClient(),
    supply: new KisSupplyClient(),
    short: new KisShortClient(),
    credit: new KisCreditClient(),
    dart: new DartClient(),
    news: new NaverNewsClient(),
    macro: new MacroClient(),
  };
}

const providers = createProviders();

export async function runAnalysisPipeline(code: string): Promise<AnalysisResponse> {
  const requestId = createRequestId();
  const date = today();
  const isMock = useMock();

  log(requestId, "pipeline:start", { code, date, mock: isMock });

  // 1. Cache check (skip in mock mode)
  const contextKey = CacheKeys.context(code, date);
  const aiKey = CacheKeys.aiAnalysis(code, date);

  if (!isMock) {
    const cachedContext = await getCache<AnalysisResponse["context"]>(contextKey);
    const cachedAi = await getCache<AiAnalysis>(aiKey);

    if (cachedContext) {
      log(requestId, "pipeline:cache:hit", { code, date });
      return {
        context: cachedContext,
        ai: cachedAi ?? null,
        meta: { cache: "hit", generatedAt: new Date().toISOString() },
      };
    }
  }

  // 2. Fetch all provider data in parallel
  log(requestId, "pipeline:fetch:start", { code, date });

  const [price, supply, short, credit, macro, news, disclosures, avg20Prices] =
    await Promise.all([
      providers.price.fetch({ code, date }),
      providers.supply.fetch({ code, date }),
      providers.short.fetch({ code, date }),
      providers.credit.fetch({ code, date }),
      providers.macro.fetch({ code, date }),
      providers.news.fetch({ code, date }),
      providers.dart.fetch({ code, date }),
      isMock
        ? Promise.resolve(mockFetchDailyPrices(code))
        : fetchDailyPrices(code, getBusinessDaysAgo(20), new Date()).catch(() => [] as number[]),
    ]);

  // Compute 20-day average foreign buy as trend score
  const foreignTrendScore =
    avg20Prices.length > 0
      ? avg20Prices.reduce((a, b) => a + b, 0) / avg20Prices.length
      : supply.foreignNetBuy;

  // 3. Normalize + run rule engine
  const stockName = isMock ? mockGetStockName(code) : code;
  const context = normalizeContext({
    code,
    name: stockName,
    date,
    price,
    supply: { ...supply, foreignTrendScore },
    short,
    credit,
    macro,
    news,
    disclosures,
  });

  // 4. AI analysis (use fallback in mock mode)
  let ai: AiAnalysis | null = null;
  if (shouldTriggerAI(context.signals, context.price.changePercent)) {
    if (isMock) {
      ai = generateFallback(context);
    } else {
      try {
        ai = await generateAnalysis(requestId, context);
        await setCache(aiKey, ai, CACHE_TTL.AI_ANALYSIS);
      } catch (err) {
        logError(requestId, "pipeline:ai:failed — using fallback", err);
        ai = generateFallback(context);
      }
    }
  }

  // 5. Cache context result (skip in mock mode)
  if (!isMock) {
    await setCache(contextKey, context, contextTtl());
  }

  log(requestId, "pipeline:done", { code, date, signalCount: context.signals.length });

  return {
    context,
    ai,
    meta: { cache: "miss", generatedAt: new Date().toISOString() },
  };
}
