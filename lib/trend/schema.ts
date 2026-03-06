import { z } from "zod";

export const TrendPeriod = z.enum(["1W", "1M", "3M", "6M", "1Y"]);
export type TrendPeriod = z.infer<typeof TrendPeriod>;

export const TrendDataPointSchema = z.object({
  date: z.string(),
  close: z.number(),
  changePercent: z.number(),
  foreignNetBuy: z.number(),
  institutionNetBuy: z.number(),
  individualNetBuy: z.number(),
});
export type TrendDataPoint = z.infer<typeof TrendDataPointSchema>;

export const TrendKPISchema = z.object({
  foreignNetBuyTotal: z.number(),
  institutionNetBuyTotal: z.number(),
  individualNetBuyTotal: z.number(),
  foreignConsecutiveDays: z.number(),
  institutionConsecutiveDays: z.number(),
  priceReturn: z.number(),
});
export type TrendKPI = z.infer<typeof TrendKPISchema>;

export const TrendResponseSchema = z.object({
  kpi: TrendKPISchema,
  series: z.array(TrendDataPointSchema),
  meta: z.object({
    period: TrendPeriod,
    startDate: z.string(),
    endDate: z.string(),
    cache: z.enum(["hit", "miss"]),
  }),
});
export type TrendResponse = z.infer<typeof TrendResponseSchema>;
