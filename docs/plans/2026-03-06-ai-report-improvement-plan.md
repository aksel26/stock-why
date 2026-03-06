# AI 상세분석/뉴스요약 개선 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AI 분석 리포트의 스키마를 구조화하고, Gemini 프롬프트를 개선하며, Fallback을 제거하고, UI를 섹션별로 재구성한다.

**Architecture:** AiAnalysisSchema를 `{summary, supplyAnalysis, macroAnalysis, eventAnalysis, newsItems[], caution}`으로 변경. Gemini 프롬프트에 인과관계 분석 지시 추가. fallback.ts 삭제 후 AI 실패 시 null 반환. AiReportCard를 섹션별 카드로 분리.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Tailwind CSS 4, Google Genai SDK

---

### Task 1: AiAnalysisSchema 변경

**Files:**
- Modify: `lib/domain/schema.ts:92-98`

**Step 1: 스키마 변경**

`AiAnalysisSchema`를 다음으로 교체:

```ts
export const NewsItemSchema = z.object({
  headline: z.string(),
  impact: z.string(),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const AiAnalysisSchema = z.object({
  summary: z.string(),
  supplyAnalysis: z.string(),
  macroAnalysis: z.string(),
  eventAnalysis: z.string().optional(),
  newsItems: z.array(NewsItemSchema).optional(),
  caution: z.string(),
  // 하위 호환 (캐시된 구 스키마)
  analysis: z.string().optional(),
  newsSummary: z.string().optional(),
});
```

`AiAnalysis` 타입은 Zod infer로 자동 갱신됨.

**Step 2: 빌드 확인**

Run: `npm run build 2>&1 | tail -5`
Expected: 타입 에러 발생 (다음 태스크에서 해결)

**Step 3: Commit**

```bash
git add lib/domain/schema.ts
git commit -m "refactor(schema): AiAnalysisSchema 구조화 - 섹션별 분석 + newsItems"
```

---

### Task 2: AI 응답 validation 수정

**Files:**
- Modify: `lib/ai/schema.ts:24-33`

**Step 1: validateAiResponse 수정**

```ts
export function validateAiResponse(raw: unknown): AiAnalysis | null {
  const parsed = AiAnalysisSchema.safeParse(raw);
  if (!parsed.success) return null;
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
```

**Step 2: Commit**

```bash
git add lib/ai/schema.ts
git commit -m "refactor(ai): validateAiResponse 새 스키마 대응"
```

---

### Task 3: Gemini 프롬프트 개선

**Files:**
- Modify: `lib/ai/prompt.ts`

**Step 1: 시스템 프롬프트 재작성**

`getSystemPrompt()`를 다음으로 교체:

```ts
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
```

**Step 2: 유저 프롬프트 수정**

`getUserPrompt()` 마지막 줄의 JSON 필드 안내를 새 스키마에 맞게 변경:

```
위 데이터를 분석하여 JSON 형식으로 응답하세요.
```
→ 그대로 유지 (시스템 프롬프트에서 이미 JSON 구조를 지정했으므로)

**Step 3: Commit**

```bash
git add lib/ai/prompt.ts
git commit -m "refactor(prompt): 구조화된 분석 프롬프트로 개선"
```

---

### Task 4: Fallback 제거 + Gemini 클라이언트 수정

**Files:**
- Delete: `lib/ai/fallback.ts`
- Modify: `lib/ai/gemini.ts:6,68-72`

**Step 1: gemini.ts에서 fallback import 제거 + null 반환**

`lib/ai/gemini.ts` 수정:

```ts
// 삭제: import { generateFallback } from "./fallback";

// generateAnalysis 함수 마지막 부분 변경:
// 기존:
//   log(requestId, "gemini fallback", {});
//   return generateFallback(context);
// 변경:
  logError(requestId, "gemini: all attempts failed", new Error("Gemini unavailable"));
  return null;
```

반환 타입도 변경: `Promise<AiAnalysis>` → `Promise<AiAnalysis | null>`

**Step 2: fallback.ts 삭제**

Run: `rm lib/ai/fallback.ts`

**Step 3: Commit**

```bash
git add lib/ai/gemini.ts
git rm lib/ai/fallback.ts
git commit -m "refactor(ai): fallback 템플릿 제거, Gemini 실패 시 null 반환"
```

---

### Task 5: Pipeline에서 fallback 호출 제거

**Files:**
- Modify: `lib/pipeline.ts:16,207-224`

**Step 1: fallback import 제거**

```ts
// 삭제: import { generateFallback } from "./ai/fallback";
```

**Step 2: AI 분석 로직 변경 (3곳)**

```ts
// 현재 (mock 모드):
if (isMock) {
  ai = generateFallback(context);
}
// 변경:
if (isMock) {
  ai = null;
}

// 현재 (Gemini 실패 catch):
ai = generateFallback(context);
// 변경:
ai = null;

// 현재 (shouldTriggerAI false):
ai = generateFallback(context);
// 변경:
ai = null;
```

**Step 3: Commit**

```bash
git add lib/pipeline.ts
git commit -m "refactor(pipeline): fallback 호출 제거, AI 실패 시 null"
```

---

### Task 6: AiReportCard UI 구조화

**Files:**
- Modify: `components/stock/AiReportCard.tsx`

**Step 1: 전체 컴포넌트 재작성**

```tsx
import type { AiAnalysis } from "@/lib/domain/schema";

interface AiReportCardProps {
  ai: AiAnalysis | null;
}

export default function AiReportCard({ ai }: AiReportCardProps) {
  if (!ai) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#caff33] text-sm">
            AI
          </div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            AI 분석
          </h2>
        </div>
        <p className="text-sm text-gray-400">AI 분석을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 하위 호환: 구 스키마 (analysis/newsSummary)
  const isLegacy = !ai.supplyAnalysis && ai.analysis;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#caff33] text-sm">
          AI
        </div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          AI 분석
        </h2>
      </div>

      <div className="space-y-4">
        {/* 요약 */}
        <div className="bg-[#caff33]/10 border border-[#caff33]/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-700 mb-1">요약</p>
          <p className="text-sm text-gray-800 leading-relaxed">{ai.summary}</p>
        </div>

        {isLegacy ? (
          /* 구 스키마 호환 렌더링 */
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">상세 분석</p>
              <p className="text-sm text-gray-600 leading-relaxed">{ai.analysis}</p>
            </div>
            {ai.newsSummary && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">뉴스 요약</p>
                <p className="text-sm text-blue-600 leading-relaxed">{ai.newsSummary}</p>
              </div>
            )}
          </>
        ) : (
          /* 새 스키마 렌더링 */
          <>
            {/* 수급 + 거시경제 2컬럼 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalysisSection icon="📊" title="수급 분석" content={ai.supplyAnalysis} />
              <AnalysisSection icon="🌍" title="거시경제 분석" content={ai.macroAnalysis} />
            </div>

            {/* 이벤트 분석 (있을 때만) */}
            {ai.eventAnalysis && (
              <AnalysisSection icon="📋" title="이벤트 분석" content={ai.eventAnalysis} />
            )}

            {/* 뉴스 분석 */}
            {ai.newsItems && ai.newsItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-3">📰 뉴스 분석</p>
                <div className="space-y-3">
                  {ai.newsItems.map((item, i) => (
                    <div key={i} className="border-l-2 border-blue-300 pl-3">
                      <p className="text-sm font-medium text-blue-900">{item.headline}</p>
                      <p className="text-sm text-blue-600 mt-0.5">{item.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 주의사항 */}
        {ai.caution && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
            <span className="text-amber-500 text-sm shrink-0">⚠️</span>
            <p className="text-sm text-amber-700 leading-relaxed">{ai.caution}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisSection({ icon, title, content }: { icon: string; title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-700 mb-1">{icon} {title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/stock/AiReportCard.tsx
git commit -m "feat(ui): AiReportCard 섹션별 구조화 + 뉴스 카드"
```

---

### Task 7: Gemini maxOutputTokens 증가

**Files:**
- Modify: `lib/ai/gemini.ts:31`

**Step 1: 토큰 한도 증가**

새 스키마는 더 많은 텍스트를 생성하므로:

```ts
// 기존: maxOutputTokens: 512,
// 변경:
maxOutputTokens: 1024,
```

**Step 2: Commit**

```bash
git add lib/ai/gemini.ts
git commit -m "chore(ai): maxOutputTokens 1024로 증가"
```

---

### Task 8: 테스트 수정 + 빌드 확인

**Files:**
- Modify: `tests/unit/normalize.test.ts` (필요 시)

**Step 1: 빌드 확인**

Run: `npm run build`
Expected: 성공

**Step 2: 테스트 확인**

Run: `npx vitest run`
Expected: 전체 통과

**Step 3: 테스트 실패 시 수정**

normalize.test.ts에서 `AiAnalysis` 타입 관련 mock 데이터가 있다면 새 스키마에 맞게 수정.

**Step 4: 최종 Commit**

```bash
git add -A
git commit -m "test: AI 스키마 변경에 따른 테스트 수정"
```
