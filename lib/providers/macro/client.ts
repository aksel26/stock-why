import type { MarketDataProvider, MacroData } from "../../domain/schema";
import { getKisToken } from "../kis/auth";
import { mapMacroData, type KospiRaw, type NasdaqRaw, type UsdKrwRaw } from "./mapper";
import { log, logError } from "../../utils/logger";
import { throttleKis } from "../kis/throttle";

function getBaseUrl(): string {
  return process.env.KIS_BASE_URL ?? "https://openapi.koreainvestment.com:9443";
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
      throw new Error(`KIS macro API error [${trId}]: ${res.status} ${text}`);
    }

    return res.json() as Promise<T>;
  });
}

export class MacroClient implements MarketDataProvider<MacroData> {
  async fetch({ code: _code, date }: { code: string; date: string }): Promise<MacroData> {
    const requestId = `macro-${date}`;
    log(requestId, "macro:fetch", { date });

    const dateCompact = date.replace(/-/g, "");

    try {
      const [kospiData, nasdaqData, usdKrwData] = await Promise.all([
        kisGet<{ output: KospiRaw }>(
          requestId,
          "/uapi/domestic-stock/v1/quotations/inquire-index-price",
          {
            FID_COND_MRKT_DIV_CODE: "U",
            FID_INPUT_ISCD: "0001", // KOSPI
          },
          "FHPUP02100000"
        ),
        kisGet<{ output: NasdaqRaw }>(
          requestId,
          "/uapi/overseas-price/v1/quotations/inquire-daily-ovrs-index",
          {
            FID_COND_MRKT_DIV_CODE: "N",
            FID_INPUT_ISCD: "COMP", // NASDAQ Composite
            FID_INPUT_DATE_1: dateCompact,
            FID_INPUT_DATE_2: dateCompact,
            FID_PERIOD_DIV_CODE: "D",
          },
          "FHKST03030100"
        ),
        kisGet<{ output: UsdKrwRaw }>(
          requestId,
          "/uapi/overseas-price/v1/quotations/inquire-daily-ovrs-index",
          {
            FID_COND_MRKT_DIV_CODE: "X",
            FID_INPUT_ISCD: "FX@KRW",
            FID_INPUT_DATE_1: dateCompact,
            FID_INPUT_DATE_2: dateCompact,
            FID_PERIOD_DIV_CODE: "D",
          },
          "FHKST03030100"
        ),
      ]);

      const result = mapMacroData(kospiData.output, nasdaqData.output, usdKrwData.output);
      log(requestId, "macro:success", { kospiChange: result.kospiChange, nasdaqChange: result.nasdaqChange, usdKrwChange: result.usdKrwChange });
      return result;
    } catch (err) {
      logError(requestId, "macro:fetch failed", err);
      throw err;
    }
  }
}
