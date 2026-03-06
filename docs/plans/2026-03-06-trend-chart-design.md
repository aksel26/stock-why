# 기간 선택 수급 추세 분석 차트 설계

## 개요
종목 상세 페이지에 기간별 외국인/기관 수급 추세를 주가와 함께 시각화하는 기능 추가.

## 아키텍처
- 새 API 엔드포인트: `GET /api/stock/[code]/trend?period=1M`
- 서버에서 KIS API 분할 호출(100건씩) + 병합 + 캐싱
- 클라이언트는 통합 시계열 배열만 수신

## 데이터 모델
- `TrendPeriod`: `1W | 1M | 3M | 6M | 1Y`
- `TrendDataPoint`: `{ date, close, changePercent, foreignNetBuy, institutionNetBuy, shortChangeRate, creditBalanceRate }`
- `TrendKPI`: `{ foreignNetBuyTotal, institutionNetBuyTotal, foreignConsecutiveDays, institutionConsecutiveDays, priceReturn }`
- `TrendResponse`: `{ kpi, series, meta }`

## UI 구성
1. 기간 선택 바 (1W/1M/3M/6M/1Y 토글)
2. KPI 카드 4개 (외국인합계, 기관합계, 연속순매수일수, 기간수익률)
3. Panel 1: 주가 라인 + 수급 막대 오버레이 (Recharts ComposedChart)
4. Panel 2: 공매도 변화율 + 신용잔고 비율 라인

## 파일 구조
### 신규
- `app/api/stock/[code]/trend/route.ts`
- `lib/trend/pipeline.ts`
- `lib/trend/kpi.ts`
- `lib/trend/schema.ts`
- `components/stock/TrendSection.tsx`
- `components/stock/PeriodSelector.tsx`
- `components/stock/TrendKPICards.tsx`
- `components/stock/PriceTrendChart.tsx`
- `components/stock/ShortCreditChart.tsx`
- `lib/mocks/trend.ts`

### 수정
- `app/(site)/stock/[code]/page.tsx`
- `lib/providers/kis/client.ts`
- `lib/providers/kis/mapper.ts`
- `lib/mocks/providers.ts`
- `lib/config.ts`

## 캐싱
- 키: `trend:{code}:{period}:{date}`
- TTL: 시장중 5분 / 폐장 24시간

## 분할 호출 전략
| 기간 | 거래일 | 호출 횟수 |
|------|--------|----------|
| 1W   | ~5     | 1        |
| 1M   | ~22    | 1        |
| 3M   | ~65    | 1        |
| 6M   | ~130   | 2        |
| 1Y   | ~250   | 3        |
