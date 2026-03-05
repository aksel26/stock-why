import type { StockDailyContext } from "../domain/schema";

export function getSystemPrompt(): string {
  return `당신은 금융 분석가가 아닙니다.
투자 권유를 하지 마십시오.
매수/매도 추천, 목표가, 확률 수치 표현을 금지합니다.
당신의 역할은 정량 신호를 기반으로 "가능한 원인"을 설명하는 것입니다.
항상 불확실성을 명시하십시오.
반드시 JSON 형식으로 응답하십시오: {"summary":"","analysis":"","caution":""}`;
}

export function getUserPrompt(context: StockDailyContext): string {
  const signalLines =
    context.signals.length > 0
      ? context.signals.map((s) => `  - ${s.type} (강도: ${s.strength})`).join("\n")
      : "  - 없음";

  const newsLines =
    context.events.news.slice(0, 3).map((n, i) => `  ${i + 1}. ${n}`).join("\n") || "  - 없음";

  const disclosureLines =
    context.events.disclosures.slice(0, 2).map((d) => `  - [${d.type}] ${d.title}`).join("\n") || "  - 없음";

  const changeSign = context.price.changePercent >= 0 ? "+" : "";

  return `종목: ${context.stockName} (${context.stockCode}) / 날짜: ${context.date}

[가격]
  종가: ${context.price.close.toLocaleString()}원 / 등락률: ${changeSign}${context.price.changePercent.toFixed(2)}%

[주요 정량 신호]
${signalLines}

[수급 요약]
  외국인 순매수: ${context.supply.foreignNetBuy.toLocaleString()}주
  기관 순매수: ${context.supply.institutionNetBuy.toLocaleString()}주
  개인 순매수: ${context.supply.individualNetBuy.toLocaleString()}주
  외국인 추세 점수: ${context.supply.foreignTrendScore.toFixed(1)}

[공매도]
  거래량: ${context.short.shortSellingVolume.toLocaleString()}주 / 변화율: ${context.short.shortChangeRate > 0 ? "+" : ""}${context.short.shortChangeRate.toFixed(2)}%

[신용]
  신용잔고율: ${context.credit.creditBalanceRate.toFixed(2)}% / 위험 단계: ${context.credit.creditRiskLevel}

[거시경제]
  KOSPI: ${context.macro.kospiChange > 0 ? "+" : ""}${context.macro.kospiChange.toFixed(2)}% / USD/KRW: ${context.macro.usdKrwChange > 0 ? "+" : ""}${context.macro.usdKrwChange.toFixed(2)}% / NASDAQ: ${context.macro.nasdaqChange > 0 ? "+" : ""}${context.macro.nasdaqChange.toFixed(2)}%

[주요 뉴스 (최대 3개)]
${newsLines}

[공시 (최대 2개)]
${disclosureLines}

위 데이터를 분석하여 JSON 형식으로 응답하세요.`;
}
