import { describe, it, expect } from "vitest";
import { analyzeSignals, shouldTriggerAI } from "@/lib/domain/ruleEngine";
import type { StockDailyContext } from "@/lib/domain/schema";

function makeContext(overrides: Partial<StockDailyContext> = {}): StockDailyContext {
  const base: StockDailyContext = {
    stockCode: "005930",
    stockName: "삼성전자",
    date: "2024-01-15",
    price: { close: 70000, changePercent: 0 },
    supply: {
      foreignNetBuy: 0,
      institutionNetBuy: 0,
      individualNetBuy: 0,
      foreignTrendScore: 100,
    },
    short: { shortSellingVolume: 1000, shortChangeRate: 0 },
    credit: { creditBalanceRate: 0, creditRiskLevel: "normal" },
    macro: { kospiChange: 0, usdKrwChange: 0, nasdaqChange: 0 },
    events: { news: [], disclosures: [] },
    signals: [],
  };
  return { ...base, ...overrides };
}

// ── foreign_strong_buy ──────────────────────────────────────────────────────

describe("foreign_strong_buy", () => {
  it("triggers when foreignNetBuy > avg20 * 2", () => {
    const ctx = makeContext({ supply: { foreignNetBuy: 201, institutionNetBuy: 0, individualNetBuy: 0, foreignTrendScore: 100 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "foreign_strong_buy" && s.strength === "high")).toBe(true);
  });

  it("does NOT trigger when foreignNetBuy equals avg20 * 2 exactly", () => {
    const ctx = makeContext({ supply: { foreignNetBuy: 200, institutionNetBuy: 0, individualNetBuy: 0, foreignTrendScore: 100 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "foreign_strong_buy")).toBe(false);
  });

  it("does NOT trigger when foreignNetBuy is below threshold", () => {
    const ctx = makeContext({ supply: { foreignNetBuy: 50, institutionNetBuy: 0, individualNetBuy: 0, foreignTrendScore: 100 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "foreign_strong_buy")).toBe(false);
  });
});

// ── foreign_sell_pressure ───────────────────────────────────────────────────

describe("foreign_sell_pressure", () => {
  it("triggers when foreignNetBuy < -(avg20 * 2)", () => {
    const ctx = makeContext({ supply: { foreignNetBuy: -201, institutionNetBuy: 0, individualNetBuy: 0, foreignTrendScore: 100 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "foreign_sell_pressure" && s.strength === "high")).toBe(true);
  });

  it("does NOT trigger when foreignNetBuy equals -(avg20 * 2) exactly", () => {
    const ctx = makeContext({ supply: { foreignNetBuy: -200, institutionNetBuy: 0, individualNetBuy: 0, foreignTrendScore: 100 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "foreign_sell_pressure")).toBe(false);
  });
});

// ── short_increase ──────────────────────────────────────────────────────────

describe("short_increase", () => {
  it("triggers medium when shortChangeRate >= 15 and < 30", () => {
    const ctx = makeContext({ short: { shortSellingVolume: 1000, shortChangeRate: 15 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "short_increase" && s.strength === "medium")).toBe(true);
  });

  it("triggers high when shortChangeRate >= 30", () => {
    const ctx = makeContext({ short: { shortSellingVolume: 1000, shortChangeRate: 30 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "short_increase" && s.strength === "high")).toBe(true);
  });

  it("does NOT trigger when shortChangeRate < 15", () => {
    const ctx = makeContext({ short: { shortSellingVolume: 1000, shortChangeRate: 14 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "short_increase")).toBe(false);
  });
});

// ── credit_risk ─────────────────────────────────────────────────────────────

describe("credit_risk", () => {
  it("triggers medium when creditBalanceRate >= 5 and < 8", () => {
    const ctx = makeContext({ credit: { creditBalanceRate: 5, creditRiskLevel: "warning" } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "credit_risk" && s.strength === "medium")).toBe(true);
  });

  it("triggers high when creditBalanceRate >= 8", () => {
    const ctx = makeContext({ credit: { creditBalanceRate: 8, creditRiskLevel: "warning" } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "credit_risk" && s.strength === "high")).toBe(true);
  });

  it("does NOT trigger when creditBalanceRate < 5", () => {
    const ctx = makeContext({ credit: { creditBalanceRate: 4.9, creditRiskLevel: "normal" } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "credit_risk")).toBe(false);
  });
});

// ── macro_support ───────────────────────────────────────────────────────────

describe("macro_support", () => {
  it("triggers when nasdaqChange > 1", () => {
    const ctx = makeContext({ macro: { kospiChange: 0, usdKrwChange: 0, nasdaqChange: 1.1 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "macro_support" && s.strength === "medium")).toBe(true);
  });

  it("triggers when usdKrwChange < -0.5", () => {
    const ctx = makeContext({ macro: { kospiChange: 0, usdKrwChange: -0.6, nasdaqChange: 0 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "macro_support" && s.strength === "medium")).toBe(true);
  });

  it("does NOT trigger when nasdaqChange == 1 and usdKrwChange == -0.5", () => {
    const ctx = makeContext({ macro: { kospiChange: 0, usdKrwChange: -0.5, nasdaqChange: 1 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "macro_support")).toBe(false);
  });
});

// ── macro_pressure ──────────────────────────────────────────────────────────

describe("macro_pressure", () => {
  it("triggers when nasdaqChange < -1", () => {
    const ctx = makeContext({ macro: { kospiChange: 0, usdKrwChange: 0, nasdaqChange: -1.1 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "macro_pressure" && s.strength === "medium")).toBe(true);
  });

  it("triggers when usdKrwChange > 0.5", () => {
    const ctx = makeContext({ macro: { kospiChange: 0, usdKrwChange: 0.6, nasdaqChange: 0 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "macro_pressure" && s.strength === "medium")).toBe(true);
  });

  it("does NOT trigger when nasdaqChange == -1 and usdKrwChange == 0.5", () => {
    const ctx = makeContext({ macro: { kospiChange: 0, usdKrwChange: 0.5, nasdaqChange: -1 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "macro_pressure")).toBe(false);
  });
});

// ── volatility_flag ─────────────────────────────────────────────────────────

describe("volatility_flag", () => {
  it("triggers on positive changePercent >= 3", () => {
    const ctx = makeContext({ price: { close: 70000, changePercent: 3 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "volatility_flag" && s.strength === "high")).toBe(true);
  });

  it("triggers on negative changePercent <= -3", () => {
    const ctx = makeContext({ price: { close: 70000, changePercent: -3 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "volatility_flag" && s.strength === "high")).toBe(true);
  });

  it("does NOT trigger when abs(changePercent) < 3", () => {
    const ctx = makeContext({ price: { close: 70000, changePercent: 2.9 } });
    const signals = analyzeSignals(ctx);
    expect(signals.some((s) => s.type === "volatility_flag")).toBe(false);
  });
});

// ── shouldTriggerAI ─────────────────────────────────────────────────────────

describe("shouldTriggerAI", () => {
  it("returns true when abs(changePercent) >= 3 even with no signals", () => {
    expect(shouldTriggerAI([], 3)).toBe(true);
    expect(shouldTriggerAI([], -3)).toBe(true);
  });

  it("returns true when there is at least 1 high signal", () => {
    const signals = [{ type: "foreign_strong_buy" as const, strength: "high" as const }];
    expect(shouldTriggerAI(signals, 0)).toBe(true);
  });

  it("returns false when no high signals and changePercent < 3", () => {
    const signals = [{ type: "macro_support" as const, strength: "medium" as const }];
    expect(shouldTriggerAI(signals, 2)).toBe(false);
  });

  it("returns false with empty signals and low changePercent", () => {
    expect(shouldTriggerAI([], 1)).toBe(false);
  });
});
