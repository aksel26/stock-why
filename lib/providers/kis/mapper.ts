import type { PriceData, SupplyData, ShortData, CreditData } from "../../domain/schema";

// ── Raw KIS API response shapes ──

export interface KisPriceRaw {
  stck_clpr: string;   // 주식 종가
  prdy_vrss_sign: string; // 전일 대비 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)
  prdy_ctrt: string;   // 전일 대비율
}

export interface KisSupplyRaw {
  frgn_ntby_qty: string;  // 외국인 순매수 수량
  orgn_ntby_qty: string;  // 기관 순매수 수량
  indv_ntby_qty: string;  // 개인 순매수 수량
}

export interface KisShortRaw {
  shtn_qty: string;        // 공매도 수량
  prdy_shtn_qty: string;   // 전일 공매도 수량
}

export interface KisCreditRaw {
  crdt_bncr: string;       // 신용 잔고율 (%)
}

export interface KisDailyPriceRaw {
  stck_bsop_date: string;  // 영업일자 YYYYMMDD
  stck_clpr: string;       // 종가
  acml_vol: string;        // 누적 거래량
}

// ── Mappers ──

export function mapKisPrice(raw: KisPriceRaw): PriceData {
  const sign = raw.prdy_vrss_sign;
  const isNegative = sign === "4" || sign === "5";
  const changePercent = parseFloat(raw.prdy_ctrt) * (isNegative ? -1 : 1);

  return {
    close: parseInt(raw.stck_clpr, 10),
    changePercent,
  };
}

export function mapKisSupply(raw: KisSupplyRaw): SupplyData {
  return {
    foreignNetBuy: parseInt(raw.frgn_ntby_qty, 10) || 0,
    institutionNetBuy: parseInt(raw.orgn_ntby_qty, 10) || 0,
    individualNetBuy: parseInt(raw.indv_ntby_qty, 10) || 0,
  };
}

export function mapKisShort(raw: KisShortRaw): ShortData {
  const today = parseInt(raw.shtn_qty, 10) || 0;
  const prev = parseInt(raw.prdy_shtn_qty, 10) || 0;
  const shortChangeRate = prev > 0 ? ((today - prev) / prev) * 100 : 0;

  return {
    shortSellingVolume: today,
    shortChangeRate,
  };
}

export function mapKisCredit(raw: KisCreditRaw): CreditData {
  return {
    creditBalanceRate: parseFloat(raw.crdt_bncr) || 0,
  };
}

export function mapKisDailyPrices(rawList: KisDailyPriceRaw[]): number[] {
  return rawList.map((r) => parseInt(r.stck_clpr, 10)).filter((v) => !isNaN(v));
}
