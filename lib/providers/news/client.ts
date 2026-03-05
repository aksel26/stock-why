import type { MarketDataProvider, NewsData } from "../../domain/schema";
import { mapNaverNews } from "./mapper";
import { log, logError } from "../../utils/logger";

const NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json";

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

export class NaverNewsClient implements MarketDataProvider<NewsData> {
  async fetch({ code, date }: { code: string; date: string }): Promise<NewsData> {
    const requestId = `news-${code}-${date}`;
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not configured");
    }

    // Search by stock code as query — callers may pass stock name instead
    const url = new URL(NAVER_NEWS_URL);
    url.searchParams.set("query", code);
    url.searchParams.set("display", "10");
    url.searchParams.set("sort", "date");

    log(requestId, "naver:news:fetch", { code, date });

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      logError(requestId, "naver:news:fetch failed", { status: res.status, body: text });
      throw new Error(`Naver News API error: ${res.status}`);
    }

    const data = (await res.json()) as NaverNewsResponse;
    return mapNaverNews(data.items ?? []);
  }
}
