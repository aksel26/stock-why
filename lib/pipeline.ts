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
import { useMock } from "./config";
import { normalizeContext } from "./domain/normalize";
import { generateAnalysis } from "./ai/gemini";

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
import { generateMockTrendSeries } from "./mocks/trend";
import { calcTrendKPI } from "./trend/kpi";
import type { TrendDataPoint } from "./trend/schema";
import type { AnalysisResponse, AiAnalysis, MacroData, PriceData, SupplyData, ShortData, CreditData, NewsData, DisclosureData } from "./domain/schema";

function buildTrendSummary(series: TrendDataPoint[]): string | undefined {
  if (series.length === 0) return undefined;

  const recent = series.slice(-5);
  const kpi = calcTrendKPI(recent);

  const table = recent
    .map(
      (d) =>
        `  ${d.date} | 종가 ${d.close.toLocaleString()} | 외국인 ${d.foreignNetBuy > 0 ? "+" : ""}${d.foreignNetBuy.toLocaleString()} | 기관 ${d.institutionNetBuy > 0 ? "+" : ""}${d.institutionNetBuy.toLocaleString()}`
    )
    .join("\n");

  const kpiLines = [
    `  기간수익률: ${kpi.priceReturn > 0 ? "+" : ""}${kpi.priceReturn}%`,
    `  외국인 누적: ${kpi.foreignNetBuyTotal > 0 ? "+" : ""}${kpi.foreignNetBuyTotal.toLocaleString()}주 (연속 ${kpi.foreignConsecutiveDays}일)`,
    `  기관 누적: ${kpi.institutionNetBuyTotal > 0 ? "+" : ""}${kpi.institutionNetBuyTotal.toLocaleString()}주 (연속 ${kpi.institutionConsecutiveDays}일)`,
  ].join("\n");

  return `최근 5일 수급 추세:\n${table}\n\nKPI 요약:\n${kpiLines}`;
}

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

  const [price, supply, short, credit, macro, news, disclosures, dailyResult] =
    await Promise.all([
      providers.price.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:price:fallback", err);
        return { close: 0, changePercent: 0 } satisfies PriceData;
      }),
      providers.supply.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:supply:fallback", err);
        return { foreignNetBuy: 0, institutionNetBuy: 0, individualNetBuy: 0 } satisfies SupplyData;
      }),
      providers.short.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:short:fallback", err);
        return { shortSellingVolume: 0, shortChangeRate: 0 } satisfies ShortData;
      }),
      providers.credit.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:credit:fallback", err);
        return { creditBalanceRate: 0 } satisfies CreditData;
      }),
      providers.macro.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:macro:fallback", err);
        return { kospiChange: 0, usdKrwChange: 0, nasdaqChange: 0 } satisfies MacroData;
      }),
      providers.news.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:news:fallback", err);
        return { headlines: [] } satisfies NewsData;
      }),
      providers.dart.fetch({ code, date }).catch((err) => {
        logError(requestId, "pipeline:dart:fallback", err);
        return { disclosures: [] } satisfies DisclosureData;
      }),
      isMock
        ? Promise.resolve({ prices: mockFetchDailyPrices(code), stockName: mockGetStockName(code) })
        : fetchDailyPrices(code, getBusinessDaysAgo(20), new Date())
            .catch(() => ({ prices: [] as number[], stockName: undefined as string | undefined })),
    ]);

  log(requestId, "pipeline:fetch:done", {
    code, date,
    priceClose: price.close,
    supplyForeignNet: supply.foreignNetBuy,
    newsCount: news.headlines.length,
    disclosureCount: disclosures.disclosures.length,
  });

  const avg20Prices = dailyResult.prices;
  const stockName = dailyResult.stockName || code;

  // Use today's foreign net buy as trend score (avg20Prices contains closing prices, not supply data)
  const foreignTrendScore = supply.foreignNetBuy;
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

  // 4. Build trend summary for AI context
  let trendSeries: TrendDataPoint[] = [];
  try {
    if (isMock) {
      trendSeries = generateMockTrendSeries(7).slice(-5);
    } else {
      const { fetchTrendPrices, fetchTrendSupply } = await import("./providers/kis/client");
      const trendStart = getBusinessDaysAgo(7);
      const trendEnd = new Date();
      const [trendPrices, trendSupply] = await Promise.all([
        fetchTrendPrices(code, trendStart, trendEnd).catch(() => []),
        fetchTrendSupply(code, trendStart, trendEnd).catch(() => []),
      ]);
      const supMap = new Map(trendSupply.map((s: { date: string; foreignNetBuy: number; institutionNetBuy: number; individualNetBuy: number }) => [s.date, s]));
      trendSeries = trendPrices
        .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
        .slice(-5)
        .map((p: { date: string; close: number; changePercent: number }) => {
          const sup = supMap.get(p.date);
          return {
            date: p.date,
            close: p.close,
            changePercent: p.changePercent,
            foreignNetBuy: sup?.foreignNetBuy ?? 0,
            institutionNetBuy: sup?.institutionNetBuy ?? 0,
            individualNetBuy: sup?.individualNetBuy ?? 0,
          };
        });
    }
  } catch (err) {
    logError(requestId, "pipeline:trend:fallback", err);
  }
  const trendSummary = buildTrendSummary(trendSeries);

  // 5. AI analysis (always call Gemini in real mode, skip in mock mode)
  let ai: AiAnalysis | null = null;
  if (isMock) {
    ai = null;
  } else {
    try {
      ai = await generateAnalysis(requestId, context, trendSummary);
      if (ai) await setCache(aiKey, ai, contextTtl());
    } catch (err) {
      logError(requestId, "pipeline:ai:failed", err);
      ai = null;
    }
  }

  // 6. Cache context result (skip in mock mode)
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
