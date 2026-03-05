import type { StockDailyContext, AiAnalysis, AnalysisSignal } from "../domain/schema";
import { filterProhibitedWords } from "./schema";

function describeSignal(signal: AnalysisSignal): string {
  const descriptions: Record<string, string> = {
    foreign_strong_buy: "외국인 순매수가 20일 평균 대비 크게 증가했습니다.",
    foreign_sell_pressure: "외국인 매도 압력이 관찰됩니다.",
    short_increase: "공매도 거래량이 증가하는 흐름이 나타났습니다.",
    credit_risk: "신용잔고율이 경고 수준에 근접하거나 초과했습니다.",
    macro_support: "거시경제 지표가 우호적인 환경을 나타내고 있습니다.",
    macro_pressure: "거시경제 지표가 부정적인 흐름을 보이고 있습니다.",
    volatility_flag: "주가 변동폭이 크게 나타났습니다.",
  };
  return descriptions[signal.type] ?? `${signal.type} 신호가 감지되었습니다.`;
}

export function generateFallback(context: StockDailyContext): AiAnalysis {
  const changeSign = context.price.changePercent >= 0 ? "+" : "";
  const changeStr = `${changeSign}${context.price.changePercent.toFixed(2)}%`;

  const summary = filterProhibitedWords(
    `${context.stockName}(${context.stockCode}) ${changeStr} 마감. AI 분석 일시 불가, 데이터 기반 요약 제공.`
  );

  const signalSentences =
    context.signals.length > 0
      ? context.signals.map(describeSignal).join(" ")
      : "특이 신호가 감지되지 않았습니다.";

  const foreignFlow =
    context.supply.foreignNetBuy >= 0
      ? `외국인이 ${context.supply.foreignNetBuy.toLocaleString()}주 순매수`
      : `외국인이 ${Math.abs(context.supply.foreignNetBuy).toLocaleString()}주 순매도`;

  const analysis = filterProhibitedWords(
    `${foreignFlow}했습니다. 공매도 변화율 ${context.short.shortChangeRate.toFixed(1)}%. ` +
      `KOSPI ${context.macro.kospiChange > 0 ? "+" : ""}${context.macro.kospiChange.toFixed(2)}%, ` +
      `NASDAQ ${context.macro.nasdaqChange > 0 ? "+" : ""}${context.macro.nasdaqChange.toFixed(2)}%. ` +
      signalSentences
  );

  const cautionParts: string[] = [];
  if (context.credit.creditRiskLevel === "warning") {
    cautionParts.push(`신용잔고율 ${context.credit.creditBalanceRate.toFixed(1)}% 경고 수준`);
  }
  if (Math.abs(context.price.changePercent) >= 3) {
    cautionParts.push("높은 가격 변동성 주의");
  }
  if (context.short.shortChangeRate >= 15) {
    cautionParts.push("공매도 급증 관찰");
  }
  cautionParts.push("본 분석은 투자 참고용이며 투자 권유가 아닙니다.");

  return { summary, analysis, caution: filterProhibitedWords(cautionParts.join(" ")) };
}
