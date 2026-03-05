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
    news: z.array(z.string()),
    disclosures: z.array(
      z.object({
        type: DisclosureType,
        title: z.string(),
      })
    ),
  }),

  signals: z.array(AnalysisSignalSchema),
});
export type StockDailyContext = z.infer<typeof StockDailyContextSchema>;

// ── AI Analysis Response ──

export const AiAnalysisSchema = z.object({
  summary: z.string(),
  analysis: z.string(),
  caution: z.string(),
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

export interface NewsData {
  headlines: string[];
}

export interface DisclosureData {
  disclosures: { type: "earnings" | "buyback" | "rights" | "other"; title: string }[];
}
