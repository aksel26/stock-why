# StockWhy

**주가 변동 원인 분석 서비스**

개인 투자자가 주가 변동 원인을 30초 내에 파악할 수 있도록, 정량적 이상 감지와 AI 요약 해석을 결합한 웹 서비스입니다.

> 투자 참고용 서비스이며, 투자 권유가 아닙니다.

---

## 주요 기능

- **종목 검색** — 종목코드 또는 종목명으로 빠른 검색
- **수급 분석 차트** — 외국인/기관/개인 순매수 추이를 오버레이 차트로 시각화
- **수급 추세 분석** — 1주~1년 기간별 수급 추세 차트 + KPI (기간수익률, 연속 매수일수, 누적 순매수)
- **Rule Engine (정량 분석)** — 수급 강도, 공매도, 신용잔고, 매크로 지표 기반 시그널 자동 감지
- **AI 원인 분석** — Google Gemini 기반, 정량 시그널을 근거로 한 변동 원인 요약
- **뉴스/공시 타임라인** — 관련 뉴스와 공시를 시간순으로 표시

## 아키텍처

```
사용자 → Next.js (App Router)
           ↓
      ┌─ /api/stock/[code]/analysis ─┐   ┌─ /api/stock/[code]/trend ─┐
      │  Data Aggregator             │   │  Trend Pipeline           │
      │  (KIS · DART · News · Macro) │   │  (KIS 일별시세 · 수급)    │
      │         ↓                    │   │         ↓                 │
      │  Normalize → Rule Engine     │   │  KPI 계산 + 시계열 정규화 │
      │         ↓                    │   └───────────────────────────┘
      │  Gemini AI (원인 설명)       │
      └──────────────────────────────┘
                    ↓
            Upstash Redis Cache
```

### 핵심 원칙

1. **AI가 판단하지 않는다** — 정량 로직이 먼저 판단
2. **AI는 설명한다** — 근거 기반 요약만 수행
3. 데이터는 재사용 가능하게 구조화
4. API 호출은 최소화 (캐싱 + 조건부 AI 호출)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Chart | Recharts |
| Animation | Framer Motion |
| AI | Google Gemini (JSON 출력 강제) |
| Cache | Upstash Redis |
| Validation | Zod |
| Test | Vitest |
| Deploy | Vercel |

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm

### 설치

```bash
git clone https://github.com/aksel26/stock-why.git
cd stock-why
npm install
```

### 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 각 API 키를 입력합니다.

| 변수 | 설명 | 발급처 |
|------|------|--------|
| `KIS_APP_KEY` / `KIS_APP_SECRET` | 한국투자증권 Open API | [KIS Developers](https://apiportal.koreainvestment.com/) |
| `DART_API_KEY` | 전자공시시스템 API | [DART OpenAPI](https://opendart.fss.or.kr/) |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 네이버 검색 API (뉴스) | [Naver Developers](https://developers.naver.com/) |
| `GEMINI_API_KEY` | Google Gemini API | [Google AI Studio](https://aistudio.google.com/) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis | [Upstash](https://upstash.com/) |

> Mock 모드: `USE_MOCK=true`로 설정하면 실제 API 없이 목 데이터로 동작합니다.

### 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 테스트

```bash
npx vitest
```

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
stockwhy/
├── app/
│   ├── (site)/                # 페이지 라우트
│   │   ├── page.tsx           # 홈 (검색)
│   │   └── stock/[code]/      # 종목 분석 대시보드
│   ├── api/stock/[code]/      # API Route
│   └── globals.css
├── components/
│   ├── stock/                 # 주식 분석 컴포넌트
│   ├── common/                # 공통 UI (ErrorState, Skeleton)
│   └── motion/                # 애니메이션
├── lib/
│   ├── providers/             # 외부 API 클라이언트 (KIS, DART, News, Macro)
│   ├── domain/                # 스키마, 정규화, 룰엔진
│   ├── trend/                 # 수급 추세 파이프라인, KPI, 스키마
│   ├── ai/                    # Gemini 호출, 프롬프트, 폴백
│   ├── cache/                 # Redis 클라이언트, 키 빌더
│   └── utils/                 # 유틸리티 (날짜, 포맷, 로거)
└── tests/                     # 단위 테스트
```

## API

### GET `/api/stock/[code]/analysis`

종목의 수급/매크로/이벤트 데이터를 수집하고 룰엔진 + AI 분석 결과를 반환합니다.

**Query Parameters:**
- `date` (선택) — 분석 날짜 (`YYYY-MM-DD`, 기본값: 오늘)

**Response:**
```json
{
  "context": { "stockCode": "005930", "stockName": "삼성전자", "signals": [...] },
  "ai": { "summary": "...", "analysis": "...", "caution": "..." },
  "meta": { "cache": "hit|miss", "generatedAt": "..." }
}
```

### GET `/api/stock/[code]/trend`

기간별 수급 추세 시계열과 KPI를 반환합니다.

**Query Parameters:**
- `period` (선택) — `1W` | `1M` | `3M` | `6M` | `1Y` (기본값: `1M`)

**Response:**
```json
{
  "kpi": {
    "foreignNetBuyTotal": 125000,
    "institutionNetBuyTotal": -30000,
    "individualNetBuyTotal": -95000,
    "foreignConsecutiveDays": 5,
    "institutionConsecutiveDays": -2,
    "priceReturn": 3.2
  },
  "series": [
    { "date": "2026-03-05", "close": 72000, "changePercent": 1.2, "foreignNetBuy": 25000, "institutionNetBuy": -6000, "individualNetBuy": -19000 }
  ],
  "meta": { "period": "1M", "startDate": "2026-02-06", "endDate": "2026-03-06", "cache": "miss" }
}
```

## 캐시 전략

Upstash Redis를 사용하며, 장중/장외에 따라 TTL이 달라집니다.

| 캐시 대상 | 장중 TTL | 장외 TTL | 설명 |
|-----------|---------|---------|------|
| 종목 컨텍스트 (`context:`) | 5분 | 1시간 | 가격/수급/시그널 등 전체 분석 결과 |
| AI 분석 (`ai:`) | 1시간 | 1시간 | Gemini 응답 |
| 20일 평균 (`avg20:`) | 24시간 | 24시간 | 일별 종가 배열 |
| KIS 토큰 (`kis:token`) | 23시간 | 23시간 | OAuth 토큰 (만료 24h 전 갱신) |

- 장중 판단: `isMarketOpen()` — 평일 09:00~15:30 KST
- 캐시 키 패턴: `{타입}:{종목코드}:{날짜}` (예: `context:005930:2026-03-06`)
- Mock 모드(`USE_MOCK=true`)에서는 캐시를 사용하지 않음

## 참고 문서

- [PRD v0.2](./StockWhy_PRD_v0.2.md) — 제품 요구사항 정의서
- [Technical Spec v0.1](./StockWhy_Technical_Spec_v0.1.md) — 기술 명세서
