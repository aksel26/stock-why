# 📈 StockWhy PRD v0.2
주가 변동 원인 분석 서비스  
Version 0.2 – Development Ready Draft  
Date: 2026-03-03

---

## 1. Product Vision

### 1.1 문제 정의
개인 투자자는 주가 변동 원인을 파악하기 위해 수급, 뉴스, 공시를 개별적으로 확인해야 한다.  
데이터는 존재하지만 “해석”이 어렵다.

StockWhy는 **정량적 이상 감지 + AI 요약 해석**을 결합해 주가 변동 원인을 30초 내 파악하도록 돕는다.

---

## 2. Product Principle
1. **AI가 판단하지 않는다.** → 정량 로직이 먼저 판단한다.  
2. **AI는 설명한다.** → 근거 기반 요약만 수행한다.  
3. 데이터는 재사용 가능하게 구조화한다.  
4. API 호출은 최소화한다.

---

## 3. System Architecture

```text
User → Next.js (SSR)
        ↓
API Route
        ↓
Data Aggregator Layer
        ↓
Rule Engine (1차 판단)
        ↓
AI Analysis (2차 설명)
        ↓
Redis Cache
```

---

## 4. Internal Data Model (핵심)

### 4.1 Daily Stock Context Schema

```ts
interface StockDailyContext {
  stockCode: string
  stockName: string
  date: string
  
  price: {
    close: number
    changePercent: number
  }

  supply: {
    foreignNetBuy: number
    institutionNetBuy: number
    individualNetBuy: number
    foreignTrendScore: number
  }

  short: {
    shortSellingVolume: number
    shortChangeRate: number
  }

  credit: {
    creditBalanceRate: number
    creditRiskLevel: "normal" | "warning"
  }

  macro: {
    kospiChange: number
    usdKrwChange: number
    nasdaqChange: number
  }

  events: {
    news: string[]
    disclosures: {
      type: "earnings" | "buyback" | "rights" | "other"
      title: string
    }[]
  }

  signals: AnalysisSignal[]
}
```

---

## 5. Rule Engine (1차 정량 분석)

AI 이전에 반드시 수행한다.

### 5.1 수급 강도 계산 (예시 기준)
- 외국인 강매수: 최근 20일 평균 대비 **2배 이상** → `foreign_strong_buy (high)`  
- 외국인 매도 압력: 최근 20일 평균 대비 **-2배 이하** → `foreign_sell_pressure (high)`  
- 공매도 리스크: 전일 대비 **+15% 이상 증가** → `short_increase (medium~high)`  
- 신용잔고 위험: **5% 초과** → `credit_risk (warning)` / **8% 초과** → `credit_risk (high)`  
- 가격 급등락: **±3% 이상** → `volatility_flag` (AI 분석 트리거 후보)

### 5.2 AnalysisSignal 정의

```ts
interface AnalysisSignal {
  type:
    | "foreign_strong_buy"
    | "foreign_sell_pressure"
    | "short_increase"
    | "credit_risk"
    | "macro_support"
    | "macro_pressure"
    | "volatility_flag"

  strength: "low" | "medium" | "high"
}
```

---

## 6. AI Analysis Layer (2차 설명)

AI는 다음만 전달받는다.
- 주요 Signal
- 핵심 수치 요약
- 중요 뉴스 3개
- 주요 공시 3개

AI는 원 데이터 전체를 받지 않는다.

---

## 7. Gemini Prompt Design

### 7.1 System Prompt

```text
당신은 금융 분석가가 아닙니다.
투자 권유를 하지 마십시오.
매수/매도 추천, 목표가, 확률 수치 표현을 금지합니다.

당신의 역할은 정량 신호를 기반으로 "가능한 원인"을 설명하는 것입니다.
항상 불확실성을 명시하십시오.
```

### 7.2 User Prompt Template

```text
[종목 정보]
종목: {{stockName}}
등락률: {{changePercent}}%

[주요 정량 신호]
{{signals}}

[수급 요약]
외국인 순매수: {{foreignNetBuy}}
기관 순매수: {{institutionNetBuy}}

[공매도 변화율]
{{shortChangeRate}}%

[주요 뉴스]
1. {{news1}}
2. {{news2}}
3. {{news3}}

[공시]
1. {{disclosure1}}
2. {{disclosure2}}

위 정보를 기반으로
1) 한 줄 요약
2) 3~5문장 원인 분석
3) 주의 사항
형식으로 작성하십시오.
```

### 7.3 Output Format (JSON 강제)

```json
{
  "summary": "",
  "analysis": "",
  "caution": ""
}
```

---

## 8. Caching Strategy

### 8.1 Redis Key Strategy

```text
stock:{code}:context:{date}
stock:{code}:signals:{date}
stock:{code}:ai:{date}
```

### 8.2 TTL
- 시세: 5분  
- 뉴스: 30분  
- AI 분석: 24시간

---

## 9. Rate Limit 가정
- KIS Open API: 1분 20회 가정 → 캐싱/배치 집계로 호출 최소화  
- Gemini: 하루 5,000건 이하 목표 → **변동성(±3%) 이상일 때만 AI 호출** 기본

---

## 10. Error Handling Strategy
| 상황 | 처리 |
|---|---|
| KIS API 실패 | 이전 캐시 데이터 반환 |
| 뉴스 API 실패 | 뉴스 제외하고 분석 |
| AI 실패 | 정량 Signal 기반 텍스트 fallback |
| Rate limit 초과 | 429 + 사용자 안내 |

---

## 11. Legal Protection Layer
- “투자 참고용, 투자 권유 아님” 상단 고정 표시  
- AI 출력에 **확률/목표가/추천** 단어 필터링  
- 사용자 동의(면책) 이후 분석 표시

---

## 12. MVP Scope (Revised)

### P0
- 종목 검색
- 수급 차트
- Rule Engine
- AI 분석

### P1
- 공매도/신용잔고
- 뉴스 타임라인

### P2
- 관심종목 저장

---

## 13. Development Phasing (현실적)
| 주차 | 작업 |
|---|---|
| 1주차 | KIS 연동 + 데이터 정규화 |
| 2주차 | 차트 + Signal 로직 |
| 3주차 | Rule Engine 고도화 |
| 4주차 | AI 분석 연결 |
| 5주차 | 안정화 + 배포 |

---

## 14. KPI (Revised)
- MAU
- AI 분석 조회율
- 동일 종목 재조회율
- 분석 공유율
- AI 응답 성공률
- 평균 응답 시간 < 2초
