# 🛠️ StockWhy Technical Spec v0.1
개발 구현을 위한 기술 명세서  
Date: 2026-03-03

> 목표: **Next.js 14(App Router)** 단일 레포에서 데이터 수집/정규화/캐싱/룰엔진/AI 분석까지 “개발 가능한 수준”으로 명세

---

## 1. Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript
- Chart: Recharts (MVP), TradingView Lightweight Charts (옵션)
- Backend: Next.js Route Handlers (`app/api/*`)
- Cache: Upstash Redis (REST) 또는 Redis (node client)
- AI: Google Gemini (Flash 계열) — JSON 출력 강제
- Deploy: Vercel

---

## 2. High-level Flow (Request Path)

### 2.1 종목 분석 요청
1) Client: `/stock/{code}` 접근  
2) Server Component or Route Handler가 `GET /api/stock/{code}/analysis?date=YYYY-MM-DD` 호출  
3) API 내부에서 캐시 체크
4) 캐시 미스 시:
   - KIS/DART/News/Macro 수집
   - 정규화(`StockDailyContext`)
   - Rule Engine 수행(`signals` 생성)
   - AI 트리거 조건 충족 시 Gemini 호출
   - 결과 저장 후 응답

---

## 3. API Contract

### 3.1 분석 API
**GET** `/api/stock/[code]/analysis?date=YYYY-MM-DD`

Response (예시):
```json
{
  "context": {
    "stockCode": "005930",
    "stockName": "삼성전자",
    "date": "2026-03-03",
    "price": { "close": 0, "changePercent": 0 },
    "supply": { "foreignNetBuy": 0, "institutionNetBuy": 0, "individualNetBuy": 0, "foreignTrendScore": 0 },
    "short": { "shortSellingVolume": 0, "shortChangeRate": 0 },
    "credit": { "creditBalanceRate": 0, "creditRiskLevel": "normal" },
    "macro": { "kospiChange": 0, "usdKrwChange": 0, "nasdaqChange": 0 },
    "events": { "news": [], "disclosures": [] },
    "signals": []
  },
  "ai": {
    "summary": "",
    "analysis": "",
    "caution": ""
  },
  "meta": {
    "cache": "hit|miss",
    "generatedAt": "2026-03-03T00:00:00.000Z"
  }
}
```

에러:
- 400: 잘못된 code/date
- 429: rate limit
- 502: upstream 실패(외부 API)
- 500: 내부 오류

---

## 4. Caching Spec (Redis)

### 4.1 Key
- `stock:{code}:context:{date}` → `StockDailyContext` JSON
- `stock:{code}:ai:{date}` → `{summary,analysis,caution}` JSON
- `stock:{code}:raw:{source}:{date}` (옵션) → 원천 데이터(디버깅/재처리)

### 4.2 TTL
- context: 5~10분 (시장 중) / 24시간 (장 마감 이후) — 단계적 적용
- ai: 24시간 (기본), 필요 시 invalidate

### 4.3 Cache Policy
- cache hit: 즉시 반환
- context miss + ai hit: context 재생성(또는 context도 같이 저장하도록 강제)
- 외부 API 실패 시: **직전 캐시**가 있으면 stale-serve

---

## 5. Data Aggregator Spec

### 5.1 수집 모듈 (Port/Adapter)
각 소스는 공통 인터페이스로 캡슐화:

```ts
export interface MarketDataProvider<T> {
  fetch(params: { code: string; date: string }): Promise<T>
}
```

- `kisProvider`: 수급/시세/공매도/신용
- `dartProvider`: 공시
- `newsProvider`: 뉴스
- `macroProvider`: 환율/지수

### 5.2 Normalization
원천 응답 → 내부 `StockDailyContext`로 변환하는 `normalize()`를 반드시 분리
- 이유: UI/AI/룰엔진 모두 같은 스키마 재사용

---

## 6. Rule Engine Spec

### 6.1 Input
- `StockDailyContext` (price/supply/short/credit/macro/events)

### 6.2 Output
- `signals: AnalysisSignal[]` + (옵션) `score`

### 6.3 Suggested Rules (MVP)
- `foreign_strong_buy`: foreignNetBuy > avg20 * 2
- `foreign_sell_pressure`: foreignNetBuy < avg20 * -2
- `short_increase`: shortChangeRate >= 15
- `credit_risk`: creditBalanceRate >= 5 (warning), >= 8 (high)
- `macro_support`: nasdaqChange > 1 or usdKrwChange < -0.5
- `macro_pressure`: nasdaqChange < -1 or usdKrwChange > 0.5
- `volatility_flag`: abs(changePercent) >= 3

> avg20 계산을 위해 `inquire_daily_itemchartprice` 등으로 20거래일 시계열을 확보하거나, 별도 저장/캐싱 필요

---

## 7. AI Analysis Spec (Gemini)

### 7.1 AI Trigger
기본 트리거(권장):
- `volatility_flag` 존재 OR
- (foreign_strong_buy | foreign_sell_pressure | short_increase | credit_risk) 중 **high 1개 이상**

### 7.2 Prompt 구성
- System prompt: 투자 권유 금지 + JSON 출력 강제
- User prompt: signals + 핵심 수치 + Top 뉴스/공시

### 7.3 JSON Validation
- Zod 등으로 response schema 검증
- 실패 시: fallback 텍스트 생성(룰 기반)

Fallback 예시:
```text
외국인/기관 수급 변화가 두드러졌고(외국인 순매수 증가), 공매도/신용잔고 지표 변화도 함께 관찰됩니다. 관련 뉴스/공시를 함께 확인해보세요.
```

---

## 8. Security / Compliance
- 서버에서만 API key 사용 (Route Handler)
- 로그에 원문 뉴스 본문/개인정보 저장 금지
- “투자 참고용” 배너 상시 표시
- AI 출력 금칙어 필터링(매수/매도/추천/목표가/확률% 등)

---

## 9. Observability
- 요청별 `requestId` 발급
- 주요 타이밍 로깅:
  - cache read/write 시간
  - 각 provider fetch 시간
  - AI 호출 시간/성공률
- 에러 분류:
  - upstream(외부) / internal(정규화/검증) / ai(json 파싱)

---

## 10. Next.js Folder Structure (권장)

```text
stockwhy/
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                    # 홈(검색)
│  │  └─ stock/
│  │     └─ [code]/
│  │        ├─ page.tsx              # 종목 대시보드(서버 컴포넌트)
│  │        ├─ loading.tsx
│  │        └─ error.tsx
│  ├─ api/
│  │  └─ stock/
│  │     └─ [code]/
│  │        └─ analysis/
│  │           └─ route.ts           # GET /api/stock/[code]/analysis
│  └─ globals.css
│
├─ components/
│  ├─ stock/
│  │  ├─ PriceSummary.tsx
│  │  ├─ SupplyOverlayChart.tsx
│  │  ├─ EventsTimeline.tsx
│  │  └─ AiReportCard.tsx
│  ├─ ui/                            # shadcn/ui 사용 시
│  └─ common/
│     ├─ ErrorState.tsx
│     └─ Skeleton.tsx
│
├─ lib/
│  ├─ cache/
│  │  ├─ redis.ts                    # Upstash/Redis client
│  │  └─ keys.ts                     # key builder + TTL
│  ├─ providers/
│  │  ├─ kis/
│  │  │  ├─ client.ts                # KIS 인증/요청 래퍼
│  │  │  └─ mapper.ts                # 원천 응답 -> 내부 타입 변환
│  │  ├─ dart/
│  │  │  ├─ client.ts
│  │  │  └─ mapper.ts
│  │  ├─ news/
│  │  │  ├─ client.ts
│  │  │  └─ mapper.ts
│  │  └─ macro/
│  │     ├─ client.ts
│  │     └─ mapper.ts
│  ├─ domain/
│  │  ├─ schema.ts                   # StockDailyContext, AnalysisSignal
│  │  ├─ normalize.ts                # providers 결과 -> context
│  │  └─ ruleEngine.ts               # signals 생성
│  ├─ ai/
│  │  ├─ gemini.ts                   # 호출 래퍼
│  │  ├─ prompt.ts                   # system/user prompt 템플릿
│  │  ├─ schema.ts                   # zod JSON schema
│  │  └─ fallback.ts                 # AI 실패 시 텍스트 생성
│  ├─ utils/
│  │  ├─ date.ts
│  │  ├─ money.ts
│  │  └─ logger.ts
│  └─ config.ts                      # env schema + runtime config
│
├─ tests/
│  ├─ ruleEngine.test.ts
│  └─ normalize.test.ts
│
├─ .env.example
├─ next.config.js
├─ package.json
└─ README.md
```

### 설계 원칙
- `lib/providers/*`: 외부 API 의존성을 격리
- `lib/domain/*`: 비즈니스 로직/룰엔진/스키마의 “핵심 도메인”
- `app/api/*`: 얇게 유지(조합 + 응답만)
- `components/*`: 화면/차트/카드 단위로 분리

---

## 11. Implementation Checklist (MVP)
- [ ] env 스키마 정의 (Zod) + `.env.example`
- [ ] Redis 연결 + key builder
- [ ] KIS provider 최소 2개 endpoint 연동(시세/수급)
- [ ] `StockDailyContext` normalize
- [ ] Rule engine + 단위 테스트
- [ ] `/api/stock/[code]/analysis` route
- [ ] Gemini wrapper + JSON schema validation + fallback
- [ ] UI(차트/타임라인/리포트 카드)
