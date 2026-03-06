import { describe, it, expect } from "vitest";
import { calcTrendKPI } from "@/lib/trend/kpi";
import type { TrendDataPoint } from "@/lib/trend/schema";

function point(overrides: Partial<TrendDataPoint> & { date: string }): TrendDataPoint {
  return {
    close: 50000, changePercent: 0,
    foreignNetBuy: 0, institutionNetBuy: 0,
    individualNetBuy: 0,
    ...overrides,
  };
}

describe("calcTrendKPI", () => {
  it("순매수 합계를 올바르게 계산한다", () => {
    const series: TrendDataPoint[] = [
      point({ date: "2026-03-01", foreignNetBuy: 1000, institutionNetBuy: 500, individualNetBuy: -300 }),
      point({ date: "2026-03-02", foreignNetBuy: -200, institutionNetBuy: 300, individualNetBuy: 200 }),
      point({ date: "2026-03-03", foreignNetBuy: 500, institutionNetBuy: -100, individualNetBuy: 400 }),
    ];
    const kpi = calcTrendKPI(series);
    expect(kpi.foreignNetBuyTotal).toBe(1300);
    expect(kpi.institutionNetBuyTotal).toBe(700);
    expect(kpi.individualNetBuyTotal).toBe(300);
  });

  it("연속 순매수 일수를 올바르게 계산한다 (최근부터 역순)", () => {
    const series: TrendDataPoint[] = [
      point({ date: "2026-03-01", foreignNetBuy: 100, institutionNetBuy: -50 }),
      point({ date: "2026-03-02", foreignNetBuy: 200, institutionNetBuy: 100 }),
      point({ date: "2026-03-03", foreignNetBuy: 300, institutionNetBuy: 200 }),
    ];
    const kpi = calcTrendKPI(series);
    expect(kpi.foreignConsecutiveDays).toBe(3);
    expect(kpi.institutionConsecutiveDays).toBe(2);
  });

  it("기간 수익률을 올바르게 계산한다", () => {
    const series: TrendDataPoint[] = [
      point({ date: "2026-03-01", close: 50000 }),
      point({ date: "2026-03-02", close: 52000 }),
      point({ date: "2026-03-03", close: 55000 }),
    ];
    const kpi = calcTrendKPI(series);
    expect(kpi.priceReturn).toBe(10);
  });

  it("빈 배열에 대해 기본값을 반환한다", () => {
    const kpi = calcTrendKPI([]);
    expect(kpi.foreignNetBuyTotal).toBe(0);
    expect(kpi.individualNetBuyTotal).toBe(0);
    expect(kpi.priceReturn).toBe(0);
    expect(kpi.foreignConsecutiveDays).toBe(0);
  });
});
