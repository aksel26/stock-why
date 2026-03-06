import { getCache, setCache } from "../cache/redis";
import { contextTtl } from "../cache/keys";
import { TREND_PERIODS, useMock } from "../config";
import { getBusinessDaysAgo, today } from "../utils/date";
import { log, logError, createRequestId } from "../utils/logger";
import { fetchTrendPrices, fetchTrendSupply } from "../providers/kis/client";
import { generateMockTrendSeries } from "../mocks/trend";
import { calcTrendKPI } from "./kpi";
import type { TrendDataPoint, TrendPeriod, TrendResponse } from "./schema";

function calcStartDate(period: TrendPeriod): Date {
  const days = TREND_PERIODS[period];
  return getBusinessDaysAgo(days);
}

function mergeSeries(
  prices: { date: string; close: number; changePercent: number }[],
  supply: { date: string; foreignNetBuy: number; institutionNetBuy: number; individualNetBuy: number }[],
): TrendDataPoint[] {
  const supplyMap = new Map(supply.map((s) => [s.date, s]));

  return prices
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => {
      const sup = supplyMap.get(p.date);

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

export async function runTrendPipeline(
  code: string,
  period: TrendPeriod,
): Promise<TrendResponse> {
  const requestId = createRequestId();
  const isMock = useMock();
  const date = today();

  log(requestId, "trend:start", { code, period, mock: isMock });

  const cacheKey = `trend:${code}:${period}:${date}`;
  if (!isMock) {
    const cached = await getCache<TrendResponse>(cacheKey);
    if (cached) {
      log(requestId, "trend:cache:hit", { code, period });
      return { ...cached, meta: { ...cached.meta, cache: "hit" } };
    }
  }

  const endDate = new Date();
  const startDate = calcStartDate(period);

  let series: TrendDataPoint[];

  if (isMock) {
    series = generateMockTrendSeries(TREND_PERIODS[period]);
  } else {
    const [prices, supply] = await Promise.all([
      fetchTrendPrices(code, startDate, endDate).catch((err) => {
        logError(requestId, "trend:prices:fallback", err);
        return [] as { date: string; close: number; changePercent: number }[];
      }),
      fetchTrendSupply(code, startDate, endDate).catch((err) => {
        logError(requestId, "trend:supply:fallback", err);
        return [] as { date: string; foreignNetBuy: number; institutionNetBuy: number; individualNetBuy: number }[];
      }),
    ]);

    series = mergeSeries(prices, supply);
  }

  const kpi = calcTrendKPI(series);

  const startDateStr = series.length > 0 ? series[0].date : "";
  const endDateStr = series.length > 0 ? series[series.length - 1].date : "";

  const response: TrendResponse = {
    kpi,
    series,
    meta: { period, startDate: startDateStr, endDate: endDateStr, cache: "miss" },
  };

  if (!isMock) {
    await setCache(cacheKey, response, contextTtl());
  }

  log(requestId, "trend:done", { code, period, seriesCount: series.length });
  return response;
}
