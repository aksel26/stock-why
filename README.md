# StockWhy

**주가 변동 원인 분석 서비스**

개인 투자자가 주가 변동 원인을 30초 내에 파악할 수 있도록, 정량적 이상 감지와 AI 요약 해석을 결합한 웹 서비스입니다.

> 투자 참고용 서비스이며, 투자 권유가 아닙니다.

---

## 주요 기능

- **종목 검색** — 종목코드 또는 종목명으로 빠른 검색
- **수급 분석 차트** — 외국인/기관/개인 순매수 추이를 오버레이 차트로 시각화
- **Rule Engine (정량 분석)** — 수급 강도, 공매도, 신용잔고, 매크로 지표 기반 시그널 자동 감지
- **AI 원인 분석** — Google Gemini 기반, 정량 시그널을 근거로 한 변동 원인 요약
- **뉴스/공시 타임라인** — 관련 뉴스와 공시를 시간순으로 표시

## 아키텍처

```
사용자 → Next.js (App Router)
           ↓
      API Route (/api/stock/[code]/analysis)
           ↓
      Data Aggregator (KIS · DART · News · Macro)
           ↓
      Normalize → Rule Engine (1차 정량 판단)
           ↓
      Gemini AI (2차 원인 설명)
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

## 참고 문서

- [PRD v0.2](./StockWhy_PRD_v0.2.md) — 제품 요구사항 정의서
- [Technical Spec v0.1](./StockWhy_Technical_Spec_v0.1.md) — 기술 명세서
