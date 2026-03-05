import type { MarketDataProvider, PriceData, SupplyData, ShortData, CreditData } from "../../domain/schema";
import { getKisToken } from "./auth";
import {
  mapKisPrice,
  mapKisSupply,
  mapKisShort,
  mapKisCredit,
  mapKisDailyPrices,
  type KisPriceRaw,
  type KisSupplyRaw,
  type KisShortRaw,
  type KisCreditRaw,
  type KisDailyPriceRaw,
} from "./mapper";
import { log, logError } from "../../utils/logger";
import { formatDateCompact } from "../../utils/date";

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

  return res.json() as Promise<T>;
}

// ── Price Provider ──

export class KisPriceClient implements MarketDataProvider<PriceData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<PriceData> {
    const requestId = `kis-price-${code}-${date}`;
    log(requestId, "kis:price:fetch", { code, date });

    const dateCompact = date.replace(/-/g, "");
    const data = await kisGet<{ output: KisPriceRaw }>(
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

    return mapKisPrice(data.output);
  }
}

// ── Supply (수급) Provider ──

export class KisSupplyClient implements MarketDataProvider<SupplyData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<SupplyData> {
    const requestId = `kis-supply-${code}-${date}`;
    log(requestId, "kis:supply:fetch", { code, date });

    const dateCompact = date.replace(/-/g, "");
    const data = await kisGet<{ output: KisSupplyRaw }>(
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

    return mapKisSupply(data.output);
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

    return mapKisShort(data.output);
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

    return mapKisCredit(data.output);
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

  return mapKisDailyPrices(data.output2 ?? []);
}
