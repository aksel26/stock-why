import { describe, it, expect } from "vitest";
import { normalizeContext } from "@/lib/domain/normalize";
import type { NormalizeParams } from "@/lib/domain/normalize";

function makeParams(overrides: Partial<NormalizeParams> = {}): NormalizeParams {
  return {
    code: "005930",
    name: "삼성전자",
    date: "2024-01-15",
    price: { close: 70000, changePercent: 1.5 },
    supply: {
      foreignNetBuy: 50,
      institutionNetBuy: -10,
      individualNetBuy: -40,
      foreignTrendScore: 100,
    },
    short: { shortSellingVolume: 5000, shortChangeRate: 5 },
    credit: { creditBalanceRate: 3 },
    macro: { kospiChange: 0.5, usdKrwChange: 0.1, nasdaqChange: 0.3 },
    news: { headlines: [{ title: "삼성전자 실적 발표" }] },
    disclosures: { disclosures: [{ type: "earnings", title: "2023 4Q 실적" }] },
    ...overrides,
  };
}

describe("normalizeContext", () => {
  it("maps stockCode and stockName correctly", () => {
    const ctx = normalizeContext(makeParams());
    expect(ctx.stockCode).toBe("005930");
    expect(ctx.stockName).toBe("삼성전자");
  });

  it("maps date correctly", () => {
    const ctx = normalizeContext(makeParams());
    expect(ctx.date).toBe("2024-01-15");
  });

  it("maps price fields correctly", () => {
    const ctx = normalizeContext(makeParams({ price: { close: 72000, changePercent: 2.1 } }));
    expect(ctx.price.close).toBe(72000);
    expect(ctx.price.changePercent).toBe(2.1);
  });

  it("maps supply fields including foreignTrendScore", () => {
    const ctx = normalizeContext(makeParams());
    expect(ctx.supply.foreignNetBuy).toBe(50);
    expect(ctx.supply.institutionNetBuy).toBe(-10);
    expect(ctx.supply.individualNetBuy).toBe(-40);
    expect(ctx.supply.foreignTrendScore).toBe(100);
  });

  it("maps short fields correctly", () => {
    const ctx = normalizeContext(makeParams({ short: { shortSellingVolume: 9999, shortChangeRate: 20 } }));
    expect(ctx.short.shortSellingVolume).toBe(9999);
    expect(ctx.short.shortChangeRate).toBe(20);
  });

  it("sets creditRiskLevel to 'warning' when creditBalanceRate >= 5", () => {
    const ctx = normalizeContext(makeParams({ credit: { creditBalanceRate: 6 } }));
    expect(ctx.credit.creditRiskLevel).toBe("warning");
    expect(ctx.credit.creditBalanceRate).toBe(6);
  });

  it("sets creditRiskLevel to 'normal' when creditBalanceRate < 5", () => {
    const ctx = normalizeContext(makeParams({ credit: { creditBalanceRate: 3 } }));
    expect(ctx.credit.creditRiskLevel).toBe("normal");
  });

  it("maps macro fields correctly", () => {
    const ctx = normalizeContext(makeParams({ macro: { kospiChange: 1.2, usdKrwChange: -0.3, nasdaqChange: 2.0 } }));
    expect(ctx.macro.kospiChange).toBe(1.2);
    expect(ctx.macro.usdKrwChange).toBe(-0.3);
    expect(ctx.macro.nasdaqChange).toBe(2.0);
  });

  it("maps news headlines correctly", () => {
    const ctx = normalizeContext(makeParams({ news: { headlines: [{ title: "뉴스1" }, { title: "뉴스2" }] } }));
    expect(ctx.events.news).toEqual([{ title: "뉴스1" }, { title: "뉴스2" }]);
  });

  it("maps disclosures correctly", () => {
    const ctx = normalizeContext(makeParams({
      disclosures: {
        disclosures: [
          { type: "buyback", title: "자사주 매입" },
          { type: "rights", title: "유상증자" },
        ],
      },
    }));
    expect(ctx.events.disclosures).toHaveLength(2);
    expect(ctx.events.disclosures[0].type).toBe("buyback");
  });

  it("auto-generates signals via analyzeSignals", () => {
    // volatility_flag should fire: changePercent = 4 (>= 3)
    const ctx = normalizeContext(makeParams({ price: { close: 70000, changePercent: 4 } }));
    expect(ctx.signals.some((s) => s.type === "volatility_flag")).toBe(true);
  });

  it("generates no signals when all values are neutral", () => {
    const ctx = normalizeContext(makeParams());
    // With default neutral values no signals should fire
    expect(ctx.signals).toHaveLength(0);
  });

  it("generates macro_support signal when nasdaqChange > 1", () => {
    const ctx = normalizeContext(makeParams({ macro: { kospiChange: 0, usdKrwChange: 0, nasdaqChange: 1.5 } }));
    expect(ctx.signals.some((s) => s.type === "macro_support")).toBe(true);
  });
});
