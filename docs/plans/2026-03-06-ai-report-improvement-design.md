# AI 상세분석/뉴스요약 개선 설계

## 목표

1. Fallback 템플릿 제거 — Gemini 실패 시 "불러올 수 없습니다" 표시
2. Gemini 프롬프트 개선 — 인과관계 분석 + 뉴스-주가 연결
3. UI 구조화 — 섹션별 분리 + 개별 뉴스 카드

## 1. AI 스키마 변경

`lib/ai/schema.ts` + `lib/domain/schema.ts`

```ts
// 기존
{ summary, analysis, newsSummary?, caution }

// 변경
{
  summary: string,
  supplyAnalysis: string,
  macroAnalysis: string,
  eventAnalysis: string,
  newsItems: [{ headline: string, impact: string }],
  caution: string
}
```

하위 호환: 캐시에 구 스키마(`analysis`, `newsSummary`)가 있을 경우 UI에서 단일 블록으로 렌더링.

## 2. Gemini 프롬프트 개선

`lib/ai/prompt.ts`

- supplyAnalysis: 외국인/기관 매매 동향 + "왜" 인과관계 추론
- macroAnalysis: KOSPI/환율/NASDAQ이 종목에 미치는 경로 설명
- eventAnalysis: 공시/이벤트의 주가 영향 (없으면 생략 가능)
- newsItems: 각 헤드라인별 주가 연관성 1~2문장 해석
- 톤: 일반 투자자 이해 가능한 언어, 전문 용어 시 괄호 설명

## 3. Fallback 제거

- `lib/ai/fallback.ts` 삭제
- `lib/pipeline.ts`: 모든 `generateFallback()` 호출 -> `null` 반환
- UI: `ai === null`이면 "AI 분석을 불러올 수 없습니다" (기존 구현 활용)

## 4. UI 컴포넌트 개선

`components/stock/AiReportCard.tsx`

레이아웃:
- 요약: 강조 박스 (유지)
- 수급 분석 + 거시경제 분석: `md:grid-cols-2` 나란히 배치
- 이벤트 분석: 조건부 표시 (비어있으면 숨김)
- 뉴스 분석: 각 아이템별 헤드라인(bold) + 영향(일반) 구조
- 주의사항: amber 박스 (유지)
- `ai === null`: 전체를 에러 메시지 한 줄로 표시

## 수정 대상 파일

1. `lib/domain/schema.ts` — AiAnalysisSchema 변경
2. `lib/ai/schema.ts` — AI 응답 validation 변경
3. `lib/ai/prompt.ts` — 시스템/유저 프롬프트 재작성
4. `lib/ai/gemini.ts` — 새 스키마에 맞춰 파싱
5. `lib/ai/fallback.ts` — 삭제
6. `lib/pipeline.ts` — fallback 호출 제거
7. `components/stock/AiReportCard.tsx` — UI 구조화
8. `tests/unit/normalize.test.ts` — 스키마 변경에 따른 테스트 수정
