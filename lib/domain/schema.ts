import { z } from "zod";

// ── Signal Types ──

export const SignalType = z.enum([
  "foreign_strong_buy",
  "foreign_sell_pressure",
  "short_increase",
  "credit_risk",
  "macro_support",
  "macro_pressure",
  "volatility_flag",
]);
export type SignalType = z.infer<typeof SignalType>;

export const SignalStrength = z.enum(["low", "medium", "high"]);
export type SignalStrength = z.infer<typeof SignalStrength>;

export const AnalysisSignalSchema = z.object({
  type: SignalType,
  strength: SignalStrength,
});
export type AnalysisSignal = z.infer<typeof AnalysisSignalSchema>;

// ── Credit Risk Level ──

export const CreditRiskLevel = z.enum(["normal", "warning"]);
export type CreditRiskLevel = z.infer<typeof CreditRiskLevel>;

// ── Disclosure Type ──

export const DisclosureType = z.enum(["earnings", "buyback", "rights", "other"]);
export type DisclosureType = z.infer<typeof DisclosureType>;

// ── StockDailyContext ──

export const StockDailyContextSchema = z.object({
  stockCode: z.string(),
  stockName: z.string(),
  date: z.string(),

  price: z.object({
    close: z.number(),
    changePercent: z.number(),
  }),

  supply: z.object({
    foreignNetBuy: z.number(),
    institutionNetBuy: z.number(),
    individualNetBuy: z.number(),
    foreignTrendScore: z.number(),
  }),

  short: z.object({
    shortSellingVolume: z.number(),
    shortChangeRate: z.number(),
  }),

  credit: z.object({
    creditBalanceRate: z.number(),
    creditRiskLevel: CreditRiskLevel,
  }),

  macro: z.object({
    kospiChange: z.number(),
    usdKrwChange: z.number(),
    nasdaqChange: z.number(),
  }),

  events: z.object({
    news: z.array(
      z.object({
        title: z.string(),
        url: z.string().optional(),
      })
    ),
    disclosures: z.array(
      z.object({
        type: DisclosureType,
        title: z.string(),
        url: z.string().optional(),
      })
    ),
  }),

  signals: z.array(AnalysisSignalSchema),
});
export type StockDailyContext = z.infer<typeof StockDailyContextSchema>;

// ── AI Analysis Response ──

export const NewsItemSchema = z.object({
  headline: z.string(),
  impact: z.string(),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const AiAnalysisSchema = z.object({
  summary: z.string(),
  supplyAnalysis: z.string(),
  macroAnalysis: z.string(),
  eventAnalysis: z.string().optional(),
  newsItems: z.array(NewsItemSchema).optional(),
  caution: z.string(),
  // 하위 호환 (캐시된 구 스키마)
  analysis: z.string().optional(),
  newsSummary: z.string().optional(),
});
export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

// ── Full API Response ──

export const AnalysisResponseSchema = z.object({
  context: StockDailyContextSchema,
  ai: AiAnalysisSchema.nullable(),
  meta: z.object({
    cache: z.enum(["hit", "miss"]),
    generatedAt: z.string(),
  }),
});
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

// ── Provider Interfaces ──

export interface MarketDataProvider<T> {
  fetch(params: { code: string; date: string }): Promise<T>;
}

// ── Provider Raw Types ──

export interface PriceData {
  close: number;
  changePercent: number;
}

export interface SupplyData {
  foreignNetBuy: number;
  institutionNetBuy: number;
  individualNetBuy: number;
}

export interface ShortData {
  shortSellingVolume: number;
  shortChangeRate: number;
}

export interface CreditData {
  creditBalanceRate: number;
}

export interface MacroData {
  kospiChange: number;
  usdKrwChange: number;
  nasdaqChange: number;
}

export interface NewsHeadline {
  title: string;
  url?: string;
}

export interface NewsData {
  headlines: NewsHeadline[];
}

export interface DisclosureData {
  disclosures: { type: "earnings" | "buyback" | "rights" | "other"; title: string; url?: string }[];
}
