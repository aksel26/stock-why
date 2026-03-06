import type { MarketDataProvider, PriceData, SupplyData, ShortData, CreditData } from "../../domain/schema";
import { getKisToken } from "./auth";
import {
  mapKisPrice,
  mapKisSupply,
  mapKisShort,
  mapKisCredit,
  mapKisDailyPrices,
  mapKisTrendPrice,
  mapKisTrendSupply,
  type KisPriceRaw,
  type KisSupplyRaw,
  type KisShortRaw,
  type KisCreditRaw,
  type KisDailyPriceRaw,
  type KisTrendPriceRaw,
  type KisTrendSupplyRaw,
} from "./mapper";
import { KIS_MAX_ITEMS_PER_CALL } from "../../config";
import { log, logError } from "../../utils/logger";
import { formatDateCompact } from "../../utils/date";
import { throttleKis } from "./throttle";

function getBaseUrl(): string {
  return process.env.KIS_BASE_URL ?? "https://openapi.koreainvestment.com:9443";
}

function getAccountNo(): string {
  const acct = process.env.KIS_ACCOUNT_NO ?? "";
  const prod = process.env.KIS_ACCOUNT_PRODUCT_CODE ?? "01";
  return `${acct.slice(0, 8)}-${prod}`;
}

async function kisGet<T>(
  requestId: string,
  path: string,
  params: Record<string, string>,
  trId: string
): Promise<T> {
  const token = await getKisToken(requestId);
  const appKey = process.env.KIS_APP_KEY ?? "";
  const appSecret = process.env.KIS_APP_SECRET ?? "";

  const url = new URL(`${getBaseUrl()}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  return throttleKis(async () => {
    const res = await fetch(url.toString(), {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: appKey,
        appsecret: appSecret,
        tr_id: trId,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`KIS API error [${trId}]: ${res.status} ${text}`);
    }

    const json = await res.json();

    // KIS API returns HTTP 200 with business-level errors in body
    if (json.rt_cd && json.rt_cd !== "0") {
      throw new Error(`KIS API biz error [${trId}]: ${json.msg_cd} ${json.msg1}`);
    }

    return json as T;
  });
}

// ── Price Provider ──

export class KisPriceClient implements MarketDataProvider<PriceData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<PriceData> {
    const requestId = `kis-price-${code}-${date}`;
    log(requestId, "kis:price:fetch", { code, date });

    const dateCompact = date.replace(/-/g, "");
    const data = await kisGet<{ output: KisPriceRaw | KisPriceRaw[] }>(
      requestId,
      "/uapi/domestic-stock/v1/quotations/inquire-daily-price",
      {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_INPUT_ISCD: code,
        FID_INPUT_DATE_1: dateCompact,
        FID_INPUT_DATE_2: dateCompact,
        FID_PERIOD_DIV_CODE: "D",
        FID_ORG_ADJ_PRC: "0",
      },
      "FHKST01010400"
    );

    const result = mapKisPrice(data.output);
    log(requestId, "kis:price:success", { code, close: result.close, changePercent: result.changePercent });
    return result;
  }
}

// ── Supply (수급) Provider ──

export class KisSupplyClient implements MarketDataProvider<SupplyData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<SupplyData> {
    const requestId = `kis-supply-${code}-${date}`;
    log(requestId, "kis:supply:fetch", { code, date });

    const dateCompact = date.replace(/-/g, "");
    const data = await kisGet<{ output: KisSupplyRaw[] }>(
      requestId,
      "/uapi/domestic-stock/v1/quotations/inquire-investor",
      {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_INPUT_ISCD: code,
        FID_INPUT_DATE_1: dateCompact,
        FID_INPUT_DATE_2: dateCompact,
        FID_PERIOD_DIV_CODE: "D",
      },
      "FHKST01010900"
    );

    const result = mapKisSupply(data.output[0]);
    log(requestId, "kis:supply:success", { code, foreignNetBuy: result.foreignNetBuy, institutionNetBuy: result.institutionNetBuy });
    return result;
  }
}

// ── Short Selling Provider ──

export class KisShortClient implements MarketDataProvider<ShortData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<ShortData> {
    const requestId = `kis-short-${code}-${date}`;
    log(requestId, "kis:short:fetch", { code, date });

    const dateCompact = date.replace(/-/g, "");
    const data = await kisGet<{ output: KisShortRaw }>(
      requestId,
      "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
      {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_INPUT_ISCD: code,
        FID_INPUT_DATE_1: dateCompact,
        FID_INPUT_DATE_2: dateCompact,
        FID_PERIOD_DIV_CODE: "D",
        FID_ORG_ADJ_PRC: "0",
      },
      "FHKST03010100"
    );

    const result = mapKisShort(data.output);
    log(requestId, "kis:short:success", { code, shortSellingVolume: result.shortSellingVolume, shortChangeRate: result.shortChangeRate });
    return result;
  }
}

// ── Credit Balance Provider ──

export class KisCreditClient implements MarketDataProvider<CreditData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<CreditData> {
    const requestId = `kis-credit-${code}-${date}`;
    log(requestId, "kis:credit:fetch", { code, date });

    const dateCompact = date.replace(/-/g, "");
    const data = await kisGet<{ output: KisCreditRaw }>(
      requestId,
      "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
      {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_INPUT_ISCD: code,
        FID_INPUT_DATE_1: dateCompact,
        FID_INPUT_DATE_2: dateCompact,
        FID_PERIOD_DIV_CODE: "D",
        FID_ORG_ADJ_PRC: "0",
      },
      "FHKST03010100"
    );

    const result = mapKisCredit(data.output);
    log(requestId, "kis:credit:success", { code, creditBalanceRate: result.creditBalanceRate });
    return result;
  }
}

// ── Daily Prices (for 20-day average volume) ──

export async function fetchDailyPrices(
  code: string,
  fromDate: Date,
  toDate: Date
): Promise<number[]> {
  const requestId = `kis-daily-${code}`;
  log(requestId, "kis:dailyPrices:fetch", { code });

  const data = await kisGet<{ output2: KisDailyPriceRaw[] }>(
    requestId,
    "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
      FID_INPUT_DATE_1: formatDateCompact(fromDate),
      FID_INPUT_DATE_2: formatDateCompact(toDate),
      FID_PERIOD_DIV_CODE: "D",
      FID_ORG_ADJ_PRC: "0",
    },
    "FHKST03010100"
  );

  const result = mapKisDailyPrices(data.output2 ?? []);
  log(requestId, "kis:dailyPrices:success", { code, count: result.length });
  return result;
}

// ── Trend Data: Paginated fetch for period-based time series ──

async function fetchPaginated<T>(
  requestId: string,
  path: string,
  baseParams: Record<string, string>,
  trId: string,
  startDate: Date,
  endDate: Date,
  outputKey: string,
): Promise<T[]> {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const chunks = Math.ceil(totalDays / KIS_MAX_ITEMS_PER_CALL);
  const results: T[] = [];
  let chunkEnd = endDate;

  for (let i = 0; i < chunks; i++) {
    const chunkStart = new Date(chunkEnd.getTime() - KIS_MAX_ITEMS_PER_CALL * 24 * 60 * 60 * 1000);
    const effectiveStart = chunkStart < startDate ? startDate : chunkStart;

    const params = {
      ...baseParams,
      FID_INPUT_DATE_1: formatDateCompact(effectiveStart),
      FID_INPUT_DATE_2: formatDateCompact(chunkEnd),
    };

    const data = await kisGet<Record<string, T[]>>(requestId, path, params, trId);
    const items = data[outputKey] ?? [];
    results.push(...items);

    chunkEnd = new Date(effectiveStart.getTime() - 24 * 60 * 60 * 1000);
    if (chunkEnd < startDate) break;
  }

  return results;
}

export async function fetchTrendPrices(
  code: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; close: number; changePercent: number }[]> {
  const requestId = `kis-trend-price-${code}`;
  log(requestId, "kis:trendPrice:fetch", { code });

  const rawList = await fetchPaginated<KisTrendPriceRaw>(
    requestId,
    "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
      FID_PERIOD_DIV_CODE: "D",
      FID_ORG_ADJ_PRC: "0",
    },
    "FHKST03010100",
    startDate, endDate, "output2",
  );

  const result = mapKisTrendPrice(rawList);
  log(requestId, "kis:trendPrice:success", { code, count: result.length });
  return result;
}

export async function fetchTrendSupply(
  code: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; foreignNetBuy: number; institutionNetBuy: number; individualNetBuy: number }[]> {
  const requestId = `kis-trend-supply-${code}`;
  log(requestId, "kis:trendSupply:fetch", { code });

  const rawList = await fetchPaginated<KisTrendSupplyRaw>(
    requestId,
    "/uapi/domestic-stock/v1/quotations/inquire-investor",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
      FID_PERIOD_DIV_CODE: "D",
    },
    "FHKST01010900",
    startDate, endDate, "output",
  );

  const result = mapKisTrendSupply(rawList);
  log(requestId, "kis:trendSupply:success", { code, count: result.length });
  return result;
}

