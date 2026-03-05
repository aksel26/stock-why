import { RULE_THRESHOLDS, AI_TRIGGER } from "@/lib/config";
import type { AnalysisSignal, StockDailyContext } from "@/lib/domain/schema";

/**
 * Analyzes a StockDailyContext and returns an array of triggered signals.
 * foreignTrendScore is used as the avg20 baseline for foreign buy/sell rules.
 */
export function analyzeSignals(context: StockDailyContext): AnalysisSignal[] {
  const signals: AnalysisSignal[] = [];
  const { supply, short, credit, macro, price } = context;
  const avg20 = supply.foreignTrendScore;

  // foreign_strong_buy
  if (supply.foreignNetBuy > avg20 * RULE_THRESHOLDS.FOREIGN_STRONG_MULTIPLIER) {
    signals.push({ type: "foreign_strong_buy", strength: "high" });
  }

  // foreign_sell_pressure
  if (supply.foreignNetBuy < avg20 * -RULE_THRESHOLDS.FOREIGN_STRONG_MULTIPLIER) {
    signals.push({ type: "foreign_sell_pressure", strength: "high" });
  }

  // short_increase
  if (short.shortChangeRate >= RULE_THRESHOLDS.SHORT_INCREASE_RATE) {
    const strength = short.shortChangeRate >= 30 ? "high" : "medium";
    signals.push({ type: "short_increase", strength });
  }

  // credit_risk
  if (credit.creditBalanceRate >= RULE_THRESHOLDS.CREDIT_HIGH_RATE) {
    signals.push({ type: "credit_risk", strength: "high" });
  } else if (credit.creditBalanceRate >= RULE_THRESHOLDS.CREDIT_WARNING_RATE) {
    signals.push({ type: "credit_risk", strength: "medium" });
  }

  // macro_support: nasdaq up OR usd/krw down
  if (
    macro.nasdaqChange > RULE_THRESHOLDS.MACRO_SUPPORT_NASDAQ ||
    macro.usdKrwChange < RULE_THRESHOLDS.MACRO_SUPPORT_USD
  ) {
    signals.push({ type: "macro_support", strength: "medium" });
  }

  // macro_pressure: nasdaq down OR usd/krw up
  if (
    macro.nasdaqChange < RULE_THRESHOLDS.MACRO_PRESSURE_NASDAQ ||
    macro.usdKrwChange > RULE_THRESHOLDS.MACRO_PRESSURE_USD
  ) {
    signals.push({ type: "macro_pressure", strength: "medium" });
  }

  // volatility_flag
  if (Math.abs(price.changePercent) >= RULE_THRESHOLDS.VOLATILITY_THRESHOLD) {
    signals.push({ type: "volatility_flag", strength: "high" });
  }

  return signals;
}

/**
 * Returns true if AI analysis should be triggered based on signals and price change.
 * Triggers when:
 * - abs(changePercent) >= VOLATILITY_THRESHOLD, OR
 * - at least MIN_HIGH_SIGNALS signals have strength "high"
 */
export function shouldTriggerAI(
  signals: AnalysisSignal[],
  changePercent: number
): boolean {
  if (Math.abs(changePercent) >= AI_TRIGGER.VOLATILITY_THRESHOLD) {
    return true;
  }
  const highCount = signals.filter((s) => s.strength === "high").length;
  return highCount >= AI_TRIGGER.MIN_HIGH_SIGNALS;
}
