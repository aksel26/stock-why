# 기간 선택 수급 추세 분석 차트 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 종목 상세 페이지에 기간별(1W/1M/3M/6M/1Y) 외국인/기관 수급 추세를 주가와 함께 시각화하는 기능 추가

**Architecture:** 새 API 엔드포인트(`/api/stock/[code]/trend`)가 KIS API를 분할 호출하여 통합 시계열 데이터를 반환. 클라이언트는 `TrendSection` 컴포넌트에서 기간 선택 → fetch → KPI 카드 + 2패널 Recharts 차트를 렌더링.

**Tech Stack:** Next.js 16 (App Router), React 19, Recharts 3, Zod 4, date-fns 4, Tailwind CSS 4, TypeScript

---

### Task 1: Trend 스키마 정의 (`lib/trend/schema.ts`)

**Files:**
- Create: `lib/trend/schema.ts`

**Step 1: 스키마 파일 생성**

```typescript
// lib/trend/schema.ts
import { z } from "zod";

export const TrendPeriod = z.enum(["1W", "1M", "3M", "6M", "1Y"]);
export type TrendPeriod = z.infer<typeof TrendPeriod>;

export const TrendDataPointSchema = z.object({
  date: z.string(),
  close: z.number(),
  changePercent: z.number(),
  foreignNetBuy: z.number(),
  institutionNetBuy: z.number(),
  shortChangeRate: z.number(),
  creditBalanceRate: z.number(),
});
export type TrendDataPoint = z.infer<typeof TrendDataPointSchema>;

export const TrendKPISchema = z.object({
  foreignNetBuyTotal: z.number(),
  institutionNetBuyTotal: z.number(),
  foreignConsecutiveDays: z.number(),
  institutionConsecutiveDays: z.number(),
  priceReturn: z.number(),
});
export type TrendKPI = z.infer<typeof TrendKPISchema>;

export const TrendResponseSchema = z.object({
  kpi: TrendKPISchema,
  series: z.array(TrendDataPointSchema),
  meta: z.object({
    period: TrendPeriod,
    startDate: z.string(),
    endDate: z.string(),
    cache: z.enum(["hit", "miss"]),
  }),
});
export type TrendResponse = z.infer<typeof TrendResponseSchema>;
```

**Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: PASS (no errors)

**Step 3: 커밋**

```bash
git add lib/trend/schema.ts
git commit -m "feat(trend): add Zod schemas for trend data model"
```

---

### Task 2: KPI 계산 로직 + 테스트 (`lib/trend/kpi.ts`)

**Files:**
- Create: `lib/trend/kpi.ts`
- Create: `tests/unit/trendKpi.test.ts`

**Step 1: 테스트 먼저 작성**

```typescript
// tests/unit/trendKpi.test.ts
import { describe, it, expect } from "vitest";
import { calcTrendKPI } from "@/lib/trend/kpi";
import type { TrendDataPoint } from "@/lib/trend/schema";

function point(overrides: Partial<TrendDataPoint> & { date: string }): TrendDataPoint {
  return {
    close: 50000, changePercent: 0,
    foreignNetBuy: 0, institutionNetBuy: 0,
    shortChangeRate: 0, creditBalanceRate: 0,
    ...overrides,
  };
}

describe("calcTrendKPI", () => {
  it("순매수 합계를 올바르게 계산한다", () => {
    const series: TrendDataPoint[] = [
      point({ date: "2026-03-01", foreignNetBuy: 1000, institutionNetBuy: 500 }),
      point({ date: "2026-03-02", foreignNetBuy: -200, institutionNetBuy: 300 }),
      point({ date: "2026-03-03", foreignNetBuy: 500, institutionNetBuy: -100 }),
    ];
    const kpi = calcTrendKPI(series);
    expect(kpi.foreignNetBuyTotal).toBe(1300);
    expect(kpi.institutionNetBuyTotal).toBe(700);
  });

  it("연속 순매수 일수를 올바르게 계산한다 (최근부터 역순)", () => {
    const series: TrendDataPoint[] = [
      point({ date: "2026-03-01", foreignNetBuy: 100, institutionNetBuy: -50 }),
      point({ date: "2026-03-02", foreignNetBuy: 200, institutionNetBuy: 100 }),
      point({ date: "2026-03-03", foreignNetBuy: 300, institutionNetBuy: 200 }),
    ];
    const kpi = calcTrendKPI(series);
    expect(kpi.foreignConsecutiveDays).toBe(3);
    expect(kpi.institutionConsecutiveDays).toBe(2);
  });

  it("기간 수익률을 올바르게 계산한다", () => {
    const series: TrendDataPoint[] = [
      point({ date: "2026-03-01", close: 50000 }),
      point({ date: "2026-03-02", close: 52000 }),
      point({ date: "2026-03-03", close: 55000 }),
    ];
    const kpi = calcTrendKPI(series);
    // (55000 - 50000) / 50000 * 100 = 10
    expect(kpi.priceReturn).toBe(10);
  });

  it("빈 배열에 대해 기본값을 반환한다", () => {
    const kpi = calcTrendKPI([]);
    expect(kpi.foreignNetBuyTotal).toBe(0);
    expect(kpi.priceReturn).toBe(0);
    expect(kpi.foreignConsecutiveDays).toBe(0);
  });
});
```

**Step 2: 테스트 실패 확인**

Run: `npx vitest run tests/unit/trendKpi.test.ts`
Expected: FAIL — `calcTrendKPI` not found

**Step 3: 구현 작성**

```typescript
// lib/trend/kpi.ts
import type { TrendDataPoint, TrendKPI } from "./schema";

export function calcTrendKPI(series: TrendDataPoint[]): TrendKPI {
  if (series.length === 0) {
    return {
      foreignNetBuyTotal: 0,
      institutionNetBuyTotal: 0,
      foreignConsecutiveDays: 0,
      institutionConsecutiveDays: 0,
      priceReturn: 0,
    };
  }

  const foreignNetBuyTotal = series.reduce((sum, d) => sum + d.foreignNetBuy, 0);
  const institutionNetBuyTotal = series.reduce((sum, d) => sum + d.institutionNetBuy, 0);

  // 연속 순매수 일수: 최근(마지막)부터 역순으로 세기
  let foreignConsecutiveDays = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].foreignNetBuy > 0) foreignConsecutiveDays++;
    else break;
  }

  let institutionConsecutiveDays = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].institutionNetBuy > 0) institutionConsecutiveDays++;
    else break;
  }

  // 기간 수익률: (마지막 종가 - 첫 종가) / 첫 종가 * 100
  const firstClose = series[0].close;
  const lastClose = series[series.length - 1].close;
  const priceReturn = firstClose > 0
    ? ((lastClose - firstClose) / firstClose) * 100
    : 0;

  return {
    foreignNetBuyTotal,
    institutionNetBuyTotal,
    foreignConsecutiveDays,
    institutionConsecutiveDays,
    priceReturn: Math.round(priceReturn * 100) / 100,
  };
}
```

**Step 4: 테스트 통과 확인**

Run: `npx vitest run tests/unit/trendKpi.test.ts`
Expected: 4 tests PASS

**Step 5: 커밋**

```bash
git add lib/trend/kpi.ts tests/unit/trendKpi.test.ts
git commit -m "feat(trend): add KPI calculation with tests"
```

---

### Task 3: Config에 기간 상수 추가 (`lib/config.ts`)

**Files:**
- Modify: `lib/config.ts:74` (파일 끝에 추가)

**Step 1: 상수 추가**

`lib/config.ts` 끝에 추가:
```typescript
export const TREND_PERIODS = {
  "1W": 5,
  "1M": 22,
  "3M": 65,
  "6M": 130,
  "1Y": 250,
} as const;

export const KIS_MAX_ITEMS_PER_CALL = 100;
```

**Step 2: 커밋**

```bash
git add lib/config.ts
git commit -m "feat(config): add TREND_PERIODS and KIS pagination constants"
```

---

### Task 4: KIS 분할 호출 함수 (`lib/providers/kis/client.ts`)

**Files:**
- Modify: `lib/providers/kis/client.ts` (파일 끝에 함수 추가)
- Modify: `lib/providers/kis/mapper.ts` (매퍼 추가)

**Step 1: mapper에 TrendRaw 타입 + 매퍼 추가**

`lib/providers/kis/mapper.ts` 끝에 추가:
```typescript
// ── Trend Data Raw (기간별 시세 + 수급 + 공매도 + 신용) ──

export interface KisTrendPriceRaw {
  stck_bsop_date: string;  // YYYYMMDD
  stck_clpr: string;       // 종가
  prdy_ctrt: string;       // 전일 대비율
  prdy_vrss_sign: string;  // 전일 대비 부호
}

export interface KisTrendSupplyRaw {
  stck_bsop_date: string;
  frgn_ntby_qty: string;
  orgn_ntby_qty: string;
}

export interface KisTrendShortCreditRaw {
  stck_bsop_date: string;
  ssts_cntg_qty: string;   // 공매도 수량
  crdt_bncr: string;       // 신용잔고율
}

export function mapKisTrendPrice(rawList: KisTrendPriceRaw[]): { date: string; close: number; changePercent: number }[] {
  return rawList
    .filter((r) => r.stck_bsop_date && r.stck_clpr)
    .map((r) => {
      const sign = r.prdy_vrss_sign;
      const isNegative = sign === "4" || sign === "5";
      const pct = parseFloat(r.prdy_ctrt) * (isNegative ? -1 : 1);
      return {
        date: `${r.stck_bsop_date.slice(0, 4)}-${r.stck_bsop_date.slice(4, 6)}-${r.stck_bsop_date.slice(6, 8)}`,
        close: parseInt(r.stck_clpr, 10) || 0,
        changePercent: isNaN(pct) ? 0 : pct,
      };
    });
}

export function mapKisTrendSupply(rawList: KisTrendSupplyRaw[]): { date: string; foreignNetBuy: number; institutionNetBuy: number }[] {
  return rawList
    .filter((r) => r.stck_bsop_date)
    .map((r) => ({
      date: `${r.stck_bsop_date.slice(0, 4)}-${r.stck_bsop_date.slice(4, 6)}-${r.stck_bsop_date.slice(6, 8)}`,
      foreignNetBuy: parseInt(r.frgn_ntby_qty, 10) || 0,
      institutionNetBuy: parseInt(r.orgn_ntby_qty, 10) || 0,
    }));
}

export function mapKisTrendShortCredit(rawList: KisTrendShortCreditRaw[]): { date: string; shortVolume: number; creditBalanceRate: number }[] {
  return rawList
    .filter((r) => r.stck_bsop_date)
    .map((r) => ({
      date: `${r.stck_bsop_date.slice(0, 4)}-${r.stck_bsop_date.slice(4, 6)}-${r.stck_bsop_date.slice(6, 8)}`,
      shortVolume: parseInt(r.ssts_cntg_qty, 10) || 0,
      creditBalanceRate: parseFloat(r.crdt_bncr) || 0,
    }));
}
```

**Step 2: client에 분할 호출 함수 추가**

`lib/providers/kis/client.ts` 끝에 추가:
```typescript
import { KIS_MAX_ITEMS_PER_CALL } from "../../config";
import {
  mapKisTrendPrice,
  mapKisTrendSupply,
  mapKisTrendShortCredit,
  type KisTrendPriceRaw,
  type KisTrendSupplyRaw,
  type KisTrendShortCreditRaw,
} from "./mapper";

// ── Trend Data: 분할 호출로 기간별 시계열 데이터 수집 ──

async function fetchPaginated<T>(
  requestId: string,
  path: string,
  baseParams: Record<string, string>,
  trId: string,
  startDate: Date,
  endDate: Date,
  outputKey: string,
): Promise<T[]> {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const chunks = Math.ceil(totalDays / KIS_MAX_ITEMS_PER_CALL);

  const results: T[] = [];
  let chunkEnd = endDate;

  for (let i = 0; i < chunks; i++) {
    const chunkStart = i === chunks - 1
      ? startDate
      : new Date(chunkEnd.getTime() - KIS_MAX_ITEMS_PER_CALL * 24 * 60 * 60 * 1000);

    if (chunkStart < startDate) {
      // 마지막 청크에서 시작일보다 앞서면 startDate로 보정
    }

    const effectiveStart = chunkStart < startDate ? startDate : chunkStart;

    const params = {
      ...baseParams,
      FID_INPUT_DATE_1: formatDateCompact(effectiveStart),
      FID_INPUT_DATE_2: formatDateCompact(chunkEnd),
    };

    const data = await kisGet<Record<string, T[]>>(requestId, path, params, trId);
    const items = data[outputKey] ?? [];
    results.push(...items);

    // 다음 청크의 끝 = 현재 청크 시작 - 1일
    chunkEnd = new Date(effectiveStart.getTime() - 24 * 60 * 60 * 1000);
    if (chunkEnd < startDate) break;
  }

  return results;
}

export async function fetchTrendPrices(
  code: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; close: number; changePercent: number }[]> {
  const requestId = `kis-trend-price-${code}`;
  log(requestId, "kis:trendPrice:fetch", { code });

  const rawList = await fetchPaginated<KisTrendPriceRaw>(
    requestId,
    "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
      FID_PERIOD_DIV_CODE: "D",
      FID_ORG_ADJ_PRC: "0",
    },
    "FHKST03010100",
    startDate,
    endDate,
    "output2",
  );

  const result = mapKisTrendPrice(rawList);
  log(requestId, "kis:trendPrice:success", { code, count: result.length });
  return result;
}

export async function fetchTrendSupply(
  code: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; foreignNetBuy: number; institutionNetBuy: number }[]> {
  const requestId = `kis-trend-supply-${code}`;
  log(requestId, "kis:trendSupply:fetch", { code });

  const rawList = await fetchPaginated<KisTrendSupplyRaw>(
    requestId,
    "/uapi/domestic-stock/v1/quotations/inquire-investor",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
      FID_PERIOD_DIV_CODE: "D",
    },
    "FHKST01010900",
    startDate,
    endDate,
    "output",
  );

  const result = mapKisTrendSupply(rawList);
  log(requestId, "kis:trendSupply:success", { code, count: result.length });
  return result;
}

export async function fetchTrendShortCredit(
  code: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; shortVolume: number; creditBalanceRate: number }[]> {
  const requestId = `kis-trend-shortcredit-${code}`;
  log(requestId, "kis:trendShortCredit:fetch", { code });

  const rawList = await fetchPaginated<KisTrendShortCreditRaw>(
    requestId,
    "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
      FID_PERIOD_DIV_CODE: "D",
      FID_ORG_ADJ_PRC: "0",
    },
    "FHKST03010100",
    startDate,
    endDate,
    "output2",
  );

  const result = mapKisTrendShortCredit(rawList);
  log(requestId, "kis:trendShortCredit:success", { code, count: result.length });
  return result;
}
```

**Step 3: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: 커밋**

```bash
git add lib/providers/kis/client.ts lib/providers/kis/mapper.ts
git commit -m "feat(kis): add paginated trend data fetch functions"
```

---

### Task 5: Mock 데이터 (`lib/mocks/trend.ts`)

**Files:**
- Create: `lib/mocks/trend.ts`

**Step 1: 목 데이터 생성기 작성**

```typescript
// lib/mocks/trend.ts
import type { TrendDataPoint } from "../trend/schema";

export function generateMockTrendSeries(days: number): TrendDataPoint[] {
  const series: TrendDataPoint[] = [];
  const baseDate = new Date("2026-03-06");
  let close = 67000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);

    // 주말 스킵
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * 3; // 약간 상승 편향
    close = Math.round(close * (1 + change / 100));
    const foreignNetBuy = Math.round((Math.random() - 0.4) * 50000);
    const institutionNetBuy = Math.round((Math.random() - 0.45) * 30000);

    series.push({
      date: date.toISOString().slice(0, 10),
      close,
      changePercent: Math.round(change * 100) / 100,
      foreignNetBuy,
      institutionNetBuy,
      shortChangeRate: Math.round((Math.random() - 0.5) * 20 * 100) / 100,
      creditBalanceRate: Math.round((2 + Math.random() * 4) * 100) / 100,
    });
  }

  return series;
}
```

**Step 2: 커밋**

```bash
git add lib/mocks/trend.ts
git commit -m "feat(mock): add trend series data generator"
```

---

### Task 6: Trend 파이프라인 (`lib/trend/pipeline.ts`)

**Files:**
- Create: `lib/trend/pipeline.ts`

**Step 1: 파이프라인 구현**

```typescript
// lib/trend/pipeline.ts
import { getCache, setCache } from "../cache/redis";
import { CacheKeys, contextTtl } from "../cache/keys";
import { TREND_PERIODS, useMock } from "../config";
import { getBusinessDaysAgo, today } from "../utils/date";
import { log, logError, createRequestId } from "../utils/logger";
import { fetchTrendPrices, fetchTrendSupply, fetchTrendShortCredit } from "../providers/kis/client";
import { generateMockTrendSeries } from "../mocks/trend";
import { calcTrendKPI } from "./kpi";
import type { TrendDataPoint, TrendPeriod, TrendResponse } from "./schema";

function calcStartDate(period: TrendPeriod): Date {
  const days = TREND_PERIODS[period];
  return getBusinessDaysAgo(days);
}

function mergeSeries(
  prices: { date: string; close: number; changePercent: number }[],
  supply: { date: string; foreignNetBuy: number; institutionNetBuy: number }[],
  shortCredit: { date: string; shortVolume: number; creditBalanceRate: number }[],
): TrendDataPoint[] {
  const supplyMap = new Map(supply.map((s) => [s.date, s]));
  const scMap = new Map(shortCredit.map((s) => [s.date, s]));

  // 공매도 변화율 계산 (전일 대비)
  const shortVolumeByDate = new Map(shortCredit.map((s) => [s.date, s.shortVolume]));

  return prices
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p, idx, arr) => {
      const sup = supplyMap.get(p.date);
      const sc = scMap.get(p.date);

      // 공매도 변화율: (오늘 - 어제) / 어제 * 100
      let shortChangeRate = 0;
      if (idx > 0 && sc) {
        const prevDate = arr[idx - 1].date;
        const prevVol = shortVolumeByDate.get(prevDate) ?? 0;
        if (prevVol > 0) {
          shortChangeRate = ((sc.shortVolume - prevVol) / prevVol) * 100;
        }
      }

      return {
        date: p.date,
        close: p.close,
        changePercent: p.changePercent,
        foreignNetBuy: sup?.foreignNetBuy ?? 0,
        institutionNetBuy: sup?.institutionNetBuy ?? 0,
        shortChangeRate: Math.round(shortChangeRate * 100) / 100,
        creditBalanceRate: sc?.creditBalanceRate ?? 0,
      };
    });
}

export async function runTrendPipeline(
  code: string,
  period: TrendPeriod,
): Promise<TrendResponse> {
  const requestId = createRequestId();
  const isMock = useMock();
  const date = today();

  log(requestId, "trend:start", { code, period, mock: isMock });

  // 1. Cache check
  const cacheKey = `trend:${code}:${period}:${date}`;
  if (!isMock) {
    const cached = await getCache<TrendResponse>(cacheKey);
    if (cached) {
      log(requestId, "trend:cache:hit", { code, period });
      return { ...cached, meta: { ...cached.meta, cache: "hit" } };
    }
  }

  const endDate = new Date();
  const startDate = calcStartDate(period);

  let series: TrendDataPoint[];

  if (isMock) {
    series = generateMockTrendSeries(TREND_PERIODS[period]);
  } else {
    // 2. 병렬로 3가지 데이터 호출 (각각 내부에서 분할 호출)
    const [prices, supply, shortCredit] = await Promise.all([
      fetchTrendPrices(code, startDate, endDate).catch((err) => {
        logError(requestId, "trend:prices:fallback", err);
        return [] as { date: string; close: number; changePercent: number }[];
      }),
      fetchTrendSupply(code, startDate, endDate).catch((err) => {
        logError(requestId, "trend:supply:fallback", err);
        return [] as { date: string; foreignNetBuy: number; institutionNetBuy: number }[];
      }),
      fetchTrendShortCredit(code, startDate, endDate).catch((err) => {
        logError(requestId, "trend:shortCredit:fallback", err);
        return [] as { date: string; shortVolume: number; creditBalanceRate: number }[];
      }),
    ]);

    series = mergeSeries(prices, supply, shortCredit);
  }

  // 3. KPI 계산
  const kpi = calcTrendKPI(series);

  // 4. 캐싱
  const startDateStr = series.length > 0 ? series[0].date : "";
  const endDateStr = series.length > 0 ? series[series.length - 1].date : "";

  const response: TrendResponse = {
    kpi,
    series,
    meta: {
      period,
      startDate: startDateStr,
      endDate: endDateStr,
      cache: "miss",
    },
  };

  if (!isMock) {
    await setCache(cacheKey, response, contextTtl());
  }

  log(requestId, "trend:done", { code, period, seriesCount: series.length });
  return response;
}
```

**Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: 커밋**

```bash
git add lib/trend/pipeline.ts
git commit -m "feat(trend): add trend pipeline with paginated fetch and caching"
```

---

### Task 7: Trend API 엔드포인트 (`app/api/stock/[code]/trend/route.ts`)

**Files:**
- Create: `app/api/stock/[code]/trend/route.ts`

**Step 1: API 라우트 작성**

```typescript
// app/api/stock/[code]/trend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runTrendPipeline } from "@/lib/trend/pipeline";
import { TrendPeriod } from "@/lib/trend/schema";
import { useMock } from "@/lib/config";
import { log, logError, createRequestId } from "@/lib/utils/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const requestId = createRequestId();

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "올바른 종목코드(6자리 숫자)를 입력해주세요." },
      { status: 400 }
    );
  }

  const periodParam = req.nextUrl.searchParams.get("period") ?? "1M";
  const parsed = TrendPeriod.safeParse(periodParam);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "올바른 기간을 선택해주세요. (1W, 1M, 3M, 6M, 1Y)" },
      { status: 400 }
    );
  }

  log(requestId, "trend-api:request", { code, period: parsed.data, mock: useMock() });

  try {
    const data = await runTrendPipeline(code, parsed.data);
    log(requestId, "trend-api:response", { code, period: parsed.data, cache: data.meta.cache });
    return NextResponse.json(data);
  } catch (err) {
    logError(requestId, "trend-api:error", err);
    return NextResponse.json(
      { error: "추세 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
```

**Step 2: dev 서버에서 수동 확인**

Run: `curl http://localhost:3000/api/stock/005930/trend?period=1M | head -c 200`
Expected: JSON with `kpi`, `series`, `meta` fields

**Step 3: 커밋**

```bash
git add app/api/stock/\[code\]/trend/route.ts
git commit -m "feat(api): add GET /api/stock/[code]/trend endpoint"
```

---

### Task 8: PeriodSelector 컴포넌트

**Files:**
- Create: `components/stock/PeriodSelector.tsx`

**Step 1: 컴포넌트 작성**

```tsx
// components/stock/PeriodSelector.tsx
"use client";

import type { TrendPeriod } from "@/lib/trend/schema";

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: "1W", label: "1주" },
  { value: "1M", label: "1개월" },
  { value: "3M", label: "3개월" },
  { value: "6M", label: "6개월" },
  { value: "1Y", label: "1년" },
];

interface PeriodSelectorProps {
  selected: TrendPeriod;
  onChange: (period: TrendPeriod) => void;
  disabled?: boolean;
}

export default function PeriodSelector({ selected, onChange, disabled }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {PERIODS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          disabled={disabled}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
            selected === value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add components/stock/PeriodSelector.tsx
git commit -m "feat(ui): add PeriodSelector toggle component"
```

---

### Task 9: TrendKPICards 컴포넌트

**Files:**
- Create: `components/stock/TrendKPICards.tsx`

**Step 1: 컴포넌트 작성**

```tsx
// components/stock/TrendKPICards.tsx
"use client";

import type { TrendKPI } from "@/lib/trend/schema";
import { formatCompact, formatPercent } from "@/lib/utils/format";

interface TrendKPICardsProps {
  kpi: TrendKPI;
}

export default function TrendKPICards({ kpi }: TrendKPICardsProps) {
  const cards = [
    {
      label: "외국인 순매수",
      value: formatCompact(kpi.foreignNetBuyTotal),
      color: kpi.foreignNetBuyTotal >= 0 ? "text-red-600" : "text-blue-600",
    },
    {
      label: "기관 순매수",
      value: formatCompact(kpi.institutionNetBuyTotal),
      color: kpi.institutionNetBuyTotal >= 0 ? "text-red-600" : "text-blue-600",
    },
    {
      label: "외국인 연속 순매수",
      value: kpi.foreignConsecutiveDays > 0
        ? `${kpi.foreignConsecutiveDays}일 연속`
        : "—",
      color: kpi.foreignConsecutiveDays > 0 ? "text-emerald-600" : "text-gray-400",
    },
    {
      label: "기간 수익률",
      value: formatPercent(kpi.priceReturn),
      color: kpi.priceReturn > 0 ? "text-red-600" : kpi.priceReturn < 0 ? "text-blue-600" : "text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1"
        >
          <span className="text-xs font-medium text-gray-500">{card.label}</span>
          <span className={`text-lg font-bold ${card.color}`}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add components/stock/TrendKPICards.tsx
git commit -m "feat(ui): add TrendKPICards component"
```

---

### Task 10: PriceTrendChart 컴포넌트 (Panel 1)

**Files:**
- Create: `components/stock/PriceTrendChart.tsx`

**Step 1: 컴포넌트 작성**

```tsx
// components/stock/PriceTrendChart.tsx
"use client";

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import type { TrendDataPoint } from "@/lib/trend/schema";
import { formatKRW, formatCompact } from "@/lib/utils/format";

interface PriceTrendChartProps {
  series: TrendDataPoint[];
}

export default function PriceTrendChart({ series }: PriceTrendChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        주가 + 수급 추세
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={series} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(d: string) => d.slice(5)} // MM-DD
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: number) => formatKRW(v)}
            domain={["auto", "auto"]}
          />
          <YAxis
            yAxisId="supply"
            orientation="right"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12, borderRadius: 8,
              border: "1px solid #e5e7eb", backgroundColor: "#fff",
            }}
            formatter={(value: number, name: string) => {
              if (name === "close") return [formatKRW(value) + "원", "종가"];
              if (name === "foreignNetBuy") return [formatCompact(value), "외국인"];
              if (name === "institutionNetBuy") return [formatCompact(value), "기관"];
              return [String(value), name];
            }}
            labelFormatter={(label: string) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) => {
              const map: Record<string, string> = {
                close: "종가",
                foreignNetBuy: "외국인 순매수",
                institutionNetBuy: "기관 순매수",
              };
              return map[value] ?? value;
            }}
          />
          <ReferenceLine yAxisId="supply" y={0} stroke="#d1d5db" />
          <Bar yAxisId="supply" dataKey="foreignNetBuy" fill="#ef4444" opacity={0.6} radius={[2, 2, 0, 0]} />
          <Bar yAxisId="supply" dataKey="institutionNetBuy" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
          <Line yAxisId="price" type="monotone" dataKey="close" stroke="#111827" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add components/stock/PriceTrendChart.tsx
git commit -m "feat(ui): add PriceTrendChart (price line + supply bars)"
```

---

### Task 11: ShortCreditChart 컴포넌트 (Panel 2)

**Files:**
- Create: `components/stock/ShortCreditChart.tsx`

**Step 1: 컴포넌트 작성**

```tsx
// components/stock/ShortCreditChart.tsx
"use client";

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { TrendDataPoint } from "@/lib/trend/schema";

interface ShortCreditChartProps {
  series: TrendDataPoint[];
}

export default function ShortCreditChart({ series }: ShortCreditChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        공매도 변화율 + 신용잔고
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={series} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(d: string) => d.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="short"
            orientation="left"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: number) => `${v}%`}
            label={{ value: "공매도(%)", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#9ca3af" } }}
          />
          <YAxis
            yAxisId="credit"
            orientation="right"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: number) => `${v}%`}
            label={{ value: "신용(%)", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "#9ca3af" } }}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12, borderRadius: 8,
              border: "1px solid #e5e7eb", backgroundColor: "#fff",
            }}
            formatter={(value: number, name: string) => {
              if (name === "shortChangeRate") return [`${value.toFixed(2)}%`, "공매도 변화율"];
              if (name === "creditBalanceRate") return [`${value.toFixed(2)}%`, "신용잔고 비율"];
              return [String(value), name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) => {
              const map: Record<string, string> = {
                shortChangeRate: "공매도 변화율",
                creditBalanceRate: "신용잔고 비율",
              };
              return map[value] ?? value;
            }}
          />
          <Line yAxisId="short" type="monotone" dataKey="shortChangeRate" stroke="#f97316" strokeWidth={1.5} dot={false} />
          <Line yAxisId="credit" type="monotone" dataKey="creditBalanceRate" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add components/stock/ShortCreditChart.tsx
git commit -m "feat(ui): add ShortCreditChart (short rate + credit balance)"
```

---

### Task 12: TrendSection 컨테이너 컴포넌트

**Files:**
- Create: `components/stock/TrendSection.tsx`

**Step 1: 컴포넌트 작성**

```tsx
// components/stock/TrendSection.tsx
"use client";

import { useState, useEffect } from "react";
import type { TrendPeriod } from "@/lib/trend/schema";
import type { TrendResponse } from "@/lib/trend/schema";
import PeriodSelector from "./PeriodSelector";
import TrendKPICards from "./TrendKPICards";
import PriceTrendChart from "./PriceTrendChart";
import ShortCreditChart from "./ShortCreditChart";

interface TrendSectionProps {
  stockCode: string;
}

export default function TrendSection({ stockCode }: TrendSectionProps) {
  const [period, setPeriod] = useState<TrendPeriod>("1M");
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/stock/${stockCode}/trend?period=${period}`)
      .then((res) => {
        if (!res.ok) throw new Error("추세 데이터를 불러오지 못했습니다.");
        return res.json();
      })
      .then((json: TrendResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [stockCode, period]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">기간별 수급 추세</h2>
        <PeriodSelector selected={period} onChange={setPeriod} disabled={loading} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-20" />
            ))}
          </div>
          <div className="bg-gray-100 animate-pulse rounded-xl h-80" />
          <div className="bg-gray-100 animate-pulse rounded-xl h-60" />
        </div>
      )}

      {data && (
        <>
          <TrendKPICards kpi={data.kpi} />
          <PriceTrendChart series={data.series} />
          <ShortCreditChart series={data.series} />
        </>
      )}
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add components/stock/TrendSection.tsx
git commit -m "feat(ui): add TrendSection container with fetch and loading states"
```

---

### Task 13: 종목 상세 페이지에 TrendSection 통합

**Files:**
- Modify: `app/(site)/stock/[code]/page.tsx:82-91` (right column에 TrendSection 추가)

**Step 1: 페이지 수정**

`app/(site)/stock/[code]/page.tsx`에서:

1. import 추가: `import TrendSection from "@/components/stock/TrendSection";`
2. right column(`lg:col-span-8`) 안에서 기존 `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">` 블록 다음에 TrendSection 추가:

```tsx
{/* 기존 코드 유지 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <SupplyOverlayChart supply={context.supply} />
  <EventsTimeline
    news={context.events.news}
    disclosures={context.events.disclosures}
  />
</div>

{/* 새로 추가 */}
<TrendSection stockCode={context.stockCode} />
```

**Step 2: dev 서버에서 확인**

Run: `npm run dev`
브라우저에서 `http://localhost:3000/stock/005930` 접속하여 TrendSection이 보이는지 확인

**Step 3: 커밋**

```bash
git add app/\(site\)/stock/\[code\]/page.tsx
git commit -m "feat(page): integrate TrendSection into stock detail page"
```

---

### Task 14: 빌드 + 전체 테스트 확인

**Step 1: 전체 테스트 실행**

Run: `npx vitest run`
Expected: 모든 테스트 PASS

**Step 2: 프로덕션 빌드 확인**

Run: `npm run build`
Expected: Build succeeds

**Step 3: 린트 확인**

Run: `npm run lint`
Expected: No errors

**Step 4: 최종 커밋 (필요시)**

```bash
git add -A
git commit -m "chore: fix any remaining build/lint issues"
```
