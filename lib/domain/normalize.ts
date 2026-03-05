import { analyzeSignals } from "@/lib/domain/ruleEngine";
import type {
  StockDailyContext,
  PriceData,
  SupplyData,
  ShortData,
  CreditData,
  MacroData,
  NewsData,
  DisclosureData,
} from "@/lib/domain/schema";

export interface NormalizeParams {
  code: string;
  name: string;
  date: string;
  price: PriceData;
  supply: SupplyData & { foreignTrendScore: number };
  short: ShortData;
  credit: CreditData;
  macro: MacroData;
  news: NewsData;
  disclosures: DisclosureData;
}

/**
 * Combines raw provider data into a StockDailyContext,
 * automatically generating signals via ruleEngine.analyzeSignals().
 */
export function normalizeContext(params: NormalizeParams): StockDailyContext {
  const { code, name, date, price, supply, short, credit, macro, news, disclosures } = params;

  const creditRiskLevel =
    credit.creditBalanceRate >= 5 ? "warning" : "normal";

  const context: StockDailyContext = {
    stockCode: code,
    stockName: name,
    date,
    price: {
      close: price.close,
      changePercent: price.changePercent,
    },
    supply: {
      foreignNetBuy: supply.foreignNetBuy,
      institutionNetBuy: supply.institutionNetBuy,
      individualNetBuy: supply.individualNetBuy,
      foreignTrendScore: supply.foreignTrendScore,
    },
    short: {
      shortSellingVolume: short.shortSellingVolume,
      shortChangeRate: short.shortChangeRate,
    },
    credit: {
      creditBalanceRate: credit.creditBalanceRate,
      creditRiskLevel,
    },
    macro: {
      kospiChange: macro.kospiChange,
      usdKrwChange: macro.usdKrwChange,
      nasdaqChange: macro.nasdaqChange,
    },
    events: {
      news: news.headlines,
      disclosures: disclosures.disclosures,
    },
    signals: [],
  };

  context.signals = analyzeSignals(context);

  return context;
}
