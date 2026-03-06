# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StockWhy is a Korean stock price movement analysis service. It combines quantitative signal detection (Rule Engine) with AI-powered explanation (Gemini) to help investors understand *why* a stock moved. Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and TypeScript.

**Core principle:** The Rule Engine decides first (quantitative signals), then AI explains. AI never judges or recommends — it only narrates based on detected signals.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + typescript)
npx vitest           # Run all tests
npx vitest run tests/unit/ruleEngine.test.ts  # Run a single test file
```

## Environment

- `USE_MOCK=true` (default) enables mock mode — no real API keys needed. Set `USE_MOCK=false` for real API calls.
- Required env vars (production): `KIS_APP_KEY`, `KIS_APP_SECRET`, `KIS_ACCOUNT_NO`, `DART_API_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Local config goes in `.env.local`.

## Architecture

### Data Pipeline (`lib/pipeline.ts`)

The central orchestrator. For a given stock code:

1. **Cache check** — Upstash Redis (`lib/cache/redis.ts`)
2. **Parallel fetch** — All providers called via `Promise.all`
3. **Normalize** — Raw provider data → `StockDailyContext` (`lib/domain/normalize.ts`)
4. **Rule Engine** — Generates `AnalysisSignal[]` from context (`lib/domain/ruleEngine.ts`)
5. **AI Analysis** — Gemini call if signals warrant it (`lib/ai/gemini.ts`)
6. **Cache result** — Store for TTL-based reuse

### Provider Layer (`lib/providers/`)

Each provider implements `MarketDataProvider<T>` with a `fetch()` method and a corresponding mapper:

| Provider | Source | Data |
|---|---|---|
| `kis/` | Korea Investment Securities Open API | Price, supply (foreign/institution/individual), short selling, credit balance |
| `dart/` | DART electronic disclosure API | Corporate disclosures |
| `news/` | Naver News API | News headlines |
| `macro/` | Macro indicators | KOSPI, USD/KRW, NASDAQ changes |

Mock implementations in `lib/mocks/providers.ts` mirror real providers for development.

### Domain Layer (`lib/domain/`)

- **`schema.ts`** — All Zod schemas and TypeScript types. `StockDailyContext` is the central data model. `AnalysisSignal` has 7 signal types with low/medium/high strength.
- **`ruleEngine.ts`** — `analyzeSignals()` produces signals from context. `shouldTriggerAI()` decides if AI analysis is needed (volatility >= 3% or any high-strength signal).
- **`normalize.ts`** — Combines raw provider data into `StockDailyContext`, auto-generating signals.

### AI Layer (`lib/ai/`)

- `gemini.ts` — Calls Gemini 1.5 Flash with JSON output mode, 10s timeout, 1 retry
- `prompt.ts` — System/user prompt templates
- `schema.ts` — Validates AI JSON response (`{summary, analysis, caution}`)

### Trend Layer (`lib/trend/`)

- `pipeline.ts` — Period-based supply trend pipeline (reuses KIS paginated fetch)
- `kpi.ts` — Trend KPI calculations (net buy totals, consecutive days, price return)
- `schema.ts` — Zod schemas for trend API request/response

### Routing

- `app/api/stock/[code]/analysis/route.ts` — API endpoint, validates 6-digit stock code, calls pipeline
- `app/api/stock/[code]/trend/route.ts` — Trend API endpoint, period-based supply trend data
- `app/(site)/page.tsx` — Home page with search bar (client component)
- `app/(site)/stock/[code]/page.tsx` — Stock analysis page (server component, fetches via internal API with `revalidate: 300`)

### UI Components (`components/`)

- `stock/` — `SearchBar`, `PriceSummary`, `SignalBadges`, `SupplyOverlayChart`, `EventsTimeline`, `AiReportCard`
- `motion/` — Framer Motion animation wrappers (`FadeIn`, `StaggerContainer`, `AnimatedCardGrid`)
- `common/` — `DisclaimerBanner`, `ErrorState`, `Skeleton`

## Key Conventions

- Path alias: `@/*` maps to project root (e.g., `@/lib/config`)
- Thresholds and constants live in `lib/config.ts` (`RULE_THRESHOLDS`, `AI_TRIGGER`, `CACHE_TTL`)
- Korean language is used for user-facing strings and error messages
- Tests are in `tests/unit/` using Vitest with globals enabled
- The stock detail page is a **server component** that calls the internal API; the home page is a **client component**
- All provider clients share the `MarketDataProvider<T>` interface pattern
