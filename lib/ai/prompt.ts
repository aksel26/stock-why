import type { StockDailyContext, AnalysisSignal } from "../domain/schema";

const signalTypeKorean: Record<string, string> = {
  foreign_strong_buy: "외국인 대규모 순매수",
  foreign_sell_pressure: "외국인 매도 압력",
  short_increase: "공매도 증가",
  credit_risk: "신용잔고 위험",
  macro_support: "거시경제 우호",
  macro_pressure: "거시경제 부정",
  volatility_flag: "높은 가격 변동성",
};

function describeSignalForPrompt(signal: AnalysisSignal): string {
  const label = signalTypeKorean[signal.type] ?? signal.type;
  const strengthKorean: Record<string, string> = { low: "약", medium: "중", high: "강" };
  return `${label} (강도: ${strengthKorean[signal.strength] ?? signal.strength})`;
}

export function getSystemPrompt(): string {
  return `당신은 금융 분석가가 아닙니다.
투자 권유를 하지 마십시오.
매수/매도 추천, 목표가, 확률 수치 표현을 금지합니다.
당신의 역할은 정량 신호를 기반으로 "가능한 원인"을 설명하는 것입니다.
항상 불확실성을 명시하십시오.
반드시 JSON 형식으로 응답하십시오:
{"summary":"","supplyAnalysis":"","macroAnalysis":"","eventAnalysis":"","newsItems":[{"headline":"","impact":""}],"caution":""}

summary 작성 규칙:
- 1~2문장으로 당일 주가 변동의 핵심 요인을 요약하세요.
- 등락률과 가장 영향력 있는 원인을 간결하게 포함하세요.

supplyAnalysis 작성 규칙:
- 외국인/기관/개인의 매매 동향을 서술하세요.
- 수치만 나열하지 말고, 해당 매매 패턴의 가능한 원인을 추론하세요.
- "왜 외국인이 매수/매도했는지" 인과관계를 설명하세요.
- 2~3문장으로 작성하세요.

macroAnalysis 작성 규칙:
- KOSPI, 환율, NASDAQ 변동이 이 종목에 어떤 경로로 영향을 줄 수 있는지 설명하세요.
- 2~3문장으로 작성하세요.

eventAnalysis 작성 규칙:
- 공시(실적, 자사주, 유상증자 등)와 주요 뉴스가 주가에 미친 영향을 구체적으로 분석하세요.
- 공시나 뉴스가 없으면 빈 문자열("")로 응답하세요.
- 2~3문장으로 작성하세요.

newsItems 작성 규칙:
- 각 뉴스 헤드라인에 대해 주가와의 연관성을 1~2문장으로 해석하세요.
- headline: 원본 뉴스 제목
- impact: 해당 뉴스가 주가에 미칠 수 있는 영향 해석
- 관련 뉴스가 없으면 빈 배열([])로 응답하세요.

caution 작성 규칙:
- 투자 시 주의할 점을 1~2문장으로 작성하세요.
- 반드시 "투자 참고용이며 투자 권유가 아닙니다"를 포함하세요.

일반 투자자가 쉽게 이해할 수 있는 언어를 사용하세요.
전문 용어 사용 시 괄호 안에 간단한 설명을 포함하세요.`;
}

export function getUserPrompt(context: StockDailyContext, trendSummary?: string): string {
  const signalLines =
    context.signals.length > 0
      ? context.signals.map((s) => `  - ${describeSignalForPrompt(s)}`).join("\n")
      : "  - 없음";

  const newsLines =
    context.events.news.slice(0, 5).map((n, i) => `  ${i + 1}. ${n.title}`).join("\n") || "  - 없음";

  const disclosureTypeMap: Record<string, string> = {
    earnings: "실적",
    buyback: "자사주",
    rights: "유상증자",
    other: "기타",
  };
  const disclosureLines =
    context.events.disclosures.slice(0, 3).map((d) => `  - [${disclosureTypeMap[d.type] ?? d.type}] ${d.title}`).join("\n") || "  - 없음";

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
  외국인 20일 평균 순매수: ${context.supply.foreignTrendScore.toFixed(1)}

[공매도]
  거래량: ${context.short.shortSellingVolume.toLocaleString()}주 / 변화율: ${context.short.shortChangeRate > 0 ? "+" : ""}${context.short.shortChangeRate.toFixed(2)}%

[신용]
  신용잔고율: ${context.credit.creditBalanceRate.toFixed(2)}% / 위험 단계: ${context.credit.creditRiskLevel}

[거시경제]
  KOSPI: ${context.macro.kospiChange > 0 ? "+" : ""}${context.macro.kospiChange.toFixed(2)}% / USD/KRW: ${context.macro.usdKrwChange > 0 ? "+" : ""}${context.macro.usdKrwChange.toFixed(2)}% / NASDAQ: ${context.macro.nasdaqChange > 0 ? "+" : ""}${context.macro.nasdaqChange.toFixed(2)}%

[주요 뉴스 (최대 5개)]
${newsLines}

[공시 (최대 3개)]
${disclosureLines}

${trendSummary ? `[최근 수급 추세]\n${trendSummary}\n\n` : ""}위 데이터를 분석하여 JSON 형식으로 응답하세요.`;
}
