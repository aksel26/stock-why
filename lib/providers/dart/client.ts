import type { MarketDataProvider, DisclosureData } from "../../domain/schema";
import { mapDartDisclosures } from "./mapper";
import { log, logError } from "../../utils/logger";

const DART_BASE_URL = "https://opendart.fss.or.kr/api";

interface DartListItem {
  rcept_no: string;
  corp_cls: string;
  corp_code: string;
  corp_name: string;
  report_nm: string;
  rcept_dt: string;
  flr_nm: string;
  rm: string;
}

interface DartListResponse {
  status: string;
  message: string;
  page_no: number;
  page_count: number;
  total_count: number;
  total_page: number;
  list: DartListItem[];
}

export class DartClient implements MarketDataProvider<DisclosureData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<DisclosureData> {
    const requestId = `dart-${code}-${date}`;
    const apiKey = process.env.DART_API_KEY;
    if (!apiKey) {
      throw new Error("DART_API_KEY not configured");
    }

    // date format: YYYY-MM-DD -> YYYYMMDD
    const compact = date.replace(/-/g, "");

    const url = new URL(`${DART_BASE_URL}/list.json`);
    url.searchParams.set("crtfc_key", apiKey);
    url.searchParams.set("stock_code", code);
    url.searchParams.set("bgn_de", compact);
    url.searchParams.set("end_de", compact);
    url.searchParams.set("page_count", "20");

    log(requestId, "dart:fetch", { code, date });

    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DART API error: ${res.status} ${text}`);
    }

    const data = (await res.json()) as DartListResponse;

    if (data.status !== "000") {
      // status 013 = no data, treat as empty
      if (data.status === "013") {
        return { disclosures: [] };
      }
      logError(requestId, "dart:fetch non-OK status", { status: data.status, message: data.message });
      return { disclosures: [] };
    }

    const result = mapDartDisclosures(data.list ?? []);
    log(requestId, "dart:success", { code, disclosureCount: result.disclosures.length });
    return result;
  }
}
