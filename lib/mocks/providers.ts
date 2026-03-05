import type {
  PriceData,
  SupplyData,
  ShortData,
  CreditData,
  MacroData,
  NewsData,
  DisclosureData,
  MarketDataProvider,
} from "../domain/schema";
import {
  mockInquirePrice,
  mockInquireInvestor,
  mockDailyShortSale,
  mockDailyCreditBalance,
  mockMacroData,
  mockNewsTitle,
  mockDailyItemChartPrice,
  mockStockMaster,
} from "./kis-mock-data";

function getDefault<T>(map: Record<string, T>, code: string): T {
  const keys = Object.keys(map);
  return map[code] ?? map[keys[0]];
}

export class MockKisPriceClient implements MarketDataProvider<PriceData> {
  async fetch({ code }: { code: string; date: string }): Promise<PriceData> {
    const raw = getDefault(mockInquirePrice, code);
    return {
      close: Number(raw.output.stck_prpr),
      changePercent: Number(raw.output.prdy_ctrt),
    };
  }
}

export class MockKisSupplyClient implements MarketDataProvider<SupplyData> {
  async fetch({ code }: { code: string; date: string }): Promise<SupplyData> {
    const raw = getDefault(mockInquireInvestor, code);
    const latest = raw.output[0];
    return {
      foreignNetBuy: Number(latest.frgn_ntby_qty),
      institutionNetBuy: Number(latest.orgn_ntby_qty),
      individualNetBuy: Number(latest.prsn_ntby_qty),
    };
  }
}

export class MockKisShortClient implements MarketDataProvider<ShortData> {
  async fetch({ code }: { code: string; date: string }): Promise<ShortData> {
    const raw = getDefault(mockDailyShortSale, code);
    const days = raw.output2;
    const todayVol = Number(days[0].ssts_cntg_qty);
    const prevVol = days.length > 1 ? Number(days[1].ssts_cntg_qty) : todayVol;
    const changeRate = prevVol !== 0 ? ((todayVol - prevVol) / prevVol) * 100 : 0;
    return {
      shortSellingVolume: todayVol,
      shortChangeRate: changeRate,
    };
  }
}

export class MockKisCreditClient implements MarketDataProvider<CreditData> {
  async fetch({ code }: { code: string; date: string }): Promise<CreditData> {
    const raw = getDefault(mockDailyCreditBalance, code);
    const latest = raw.output[0];
    return {
      creditBalanceRate: Number(latest.ldng_rmnd_rate),
    };
  }
}

export class MockDartClient implements MarketDataProvider<DisclosureData> {
  async fetch(): Promise<DisclosureData> {
    return {
      disclosures: [
        { type: "earnings", title: "2025년 4분기 실적 발표 (잠정)" },
        { type: "buyback", title: "자기주식 취득 결정" },
      ],
    };
  }
}

export class MockNaverNewsClient implements MarketDataProvider<NewsData> {
  async fetch({ code }: { code: string; date: string }): Promise<NewsData> {
    const raw = getDefault(mockNewsTitle, code);
    return {
      headlines: raw.output.map((item) => item.news_titl),
    };
  }
}

export class MockMacroClient implements MarketDataProvider<MacroData> {
  async fetch(): Promise<MacroData> {
    return {
      kospiChange: Number(mockMacroData.kospi.prdy_ctrt),
      usdKrwChange: Number(mockMacroData.usd_krw.prdy_ctrt),
      nasdaqChange: Number(mockMacroData.nasdaq.prdy_ctrt),
    };
  }
}

export function mockFetchDailyPrices(code: string): number[] {
  const raw = getDefault(mockDailyItemChartPrice, code);
  return raw.output2.map((d) => Number(d.stck_clpr));
}

export function mockGetStockName(code: string): string {
  const found = mockStockMaster.find((s) => s.code === code);
  return found?.name ?? code;
}
