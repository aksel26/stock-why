import { AiAnalysisSchema, type AiAnalysis } from "../domain/schema";

const PROHIBITED_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // "매수/매도" 단독 사용만 필터 (순매수, 순매도, 공매도는 허용)
  { pattern: /(?<!순)(?<!공)매수/g, replacement: "▪" },
  { pattern: /(?<!순)(?<!공)매도/g, replacement: "▪" },
  { pattern: /추천/g, replacement: "▪" },
  { pattern: /목표가/g, replacement: "▪" },
  { pattern: /확률/g, replacement: "▪" },
  { pattern: /적극/g, replacement: "▪" },
  { pattern: /강력/g, replacement: "▪" },
  { pattern: /반드시/g, replacement: "▪" },
  { pattern: /확실/g, replacement: "▪" },
];

export function filterProhibitedWords(text: string): string {
  let result = text;
  for (const { pattern, replacement } of PROHIBITED_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function validateAiResponse(raw: unknown): AiAnalysis | null {
  const parsed = AiAnalysisSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[ai:validation] 스키마 검증 실패:", JSON.stringify(parsed.error.flatten().fieldErrors));
    return null;
  }
  const d = parsed.data;
  return {
    summary: filterProhibitedWords(d.summary),
    supplyAnalysis: filterProhibitedWords(d.supplyAnalysis),
    macroAnalysis: filterProhibitedWords(d.macroAnalysis),
    eventAnalysis: d.eventAnalysis ? filterProhibitedWords(d.eventAnalysis) : undefined,
    newsItems: d.newsItems?.map((n) => ({
      headline: filterProhibitedWords(n.headline),
      impact: filterProhibitedWords(n.impact),
    })),
    caution: filterProhibitedWords(d.caution),
  };
}
