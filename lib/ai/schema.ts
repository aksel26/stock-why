import { AiAnalysisSchema, type AiAnalysis } from "../domain/schema";

const PROHIBITED_WORDS = [
  "매수", "매도", "추천", "목표가", "확률", "적극", "강력", "반드시", "확실",
];

export function filterProhibitedWords(text: string): string {
  let result = text;
  for (const word of PROHIBITED_WORDS) {
    result = result.replaceAll(word, "▪");
  }
  return result;
}

export function validateAiResponse(raw: unknown): AiAnalysis | null {
  const parsed = AiAnalysisSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    summary: filterProhibitedWords(parsed.data.summary),
    analysis: filterProhibitedWords(parsed.data.analysis),
    caution: filterProhibitedWords(parsed.data.caution),
  };
}
