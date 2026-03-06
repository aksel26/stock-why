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
  prsn_ntby_qty: string;  // 개인 순매수 수량
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

export function mapKisPrice(raw: KisPriceRaw | KisPriceRaw[]): PriceData {
  // KIS API may return an array — use the first element
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item?.stck_clpr) {
    return { close: 0, changePercent: 0 };
  }
  const sign = item.prdy_vrss_sign;
  const isNegative = sign === "4" || sign === "5";
  const changePercent = parseFloat(item.prdy_ctrt) * (isNegative ? -1 : 1);

  return {
    close: parseInt(item.stck_clpr, 10) || 0,
    changePercent: isNaN(changePercent) ? 0 : changePercent,
  };
}

export function mapKisSupply(raw: KisSupplyRaw | KisSupplyRaw[] | undefined): SupplyData {
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) return { foreignNetBuy: 0, institutionNetBuy: 0, individualNetBuy: 0 };
  return {
    foreignNetBuy: parseInt(item.frgn_ntby_qty, 10) || 0,
    institutionNetBuy: parseInt(item.orgn_ntby_qty, 10) || 0,
    individualNetBuy: parseInt(item.prsn_ntby_qty, 10) || 0,
  };
}

export function mapKisShort(raw: KisShortRaw | KisShortRaw[] | undefined): ShortData {
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) return { shortSellingVolume: 0, shortChangeRate: 0 };
  const today = parseInt(item.shtn_qty, 10) || 0;
  const prev = parseInt(item.prdy_shtn_qty, 10) || 0;
  const shortChangeRate = prev > 0 ? ((today - prev) / prev) * 100 : 0;

  return {
    shortSellingVolume: today,
    shortChangeRate,
  };
}

export function mapKisCredit(raw: KisCreditRaw | KisCreditRaw[] | undefined): CreditData {
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) return { creditBalanceRate: 0 };
  return {
    creditBalanceRate: parseFloat(item.crdt_bncr) || 0,
  };
}

export function mapKisDailyPrices(rawList: KisDailyPriceRaw[]): number[] {
  return rawList.map((r) => parseInt(r.stck_clpr, 10)).filter((v) => !isNaN(v));
}

// ── Trend Data Raw Types ──

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
  prsn_ntby_qty: string;
}

export interface KisTrendShortCreditRaw {
  stck_bsop_date: string;
  ssts_cntg_qty: string;   // 공매도 수량
  crdt_bncr: string;       // 신용잔고율
}

// ── Trend Mappers ──

function parseDateCompact(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export function mapKisTrendPrice(rawList: KisTrendPriceRaw[]): { date: string; close: number; changePercent: number }[] {
  return rawList
    .filter((r) => r.stck_bsop_date && r.stck_clpr)
    .map((r) => {
      const sign = r.prdy_vrss_sign;
      const isNegative = sign === "4" || sign === "5";
      const pct = parseFloat(r.prdy_ctrt) * (isNegative ? -1 : 1);
      return {
        date: parseDateCompact(r.stck_bsop_date),
        close: parseInt(r.stck_clpr, 10) || 0,
        changePercent: isNaN(pct) ? 0 : pct,
      };
    });
}

export function mapKisTrendSupply(rawList: KisTrendSupplyRaw[]): { date: string; foreignNetBuy: number; institutionNetBuy: number; individualNetBuy: number }[] {
  return rawList
    .filter((r) => r.stck_bsop_date)
    .map((r) => ({
      date: parseDateCompact(r.stck_bsop_date),
      foreignNetBuy: parseInt(r.frgn_ntby_qty, 10) || 0,
      institutionNetBuy: parseInt(r.orgn_ntby_qty, 10) || 0,
      individualNetBuy: parseInt(r.prsn_ntby_qty, 10) || 0,
    }));
}

export function mapKisTrendShortCredit(rawList: KisTrendShortCreditRaw[]): { date: string; shortVolume: number; creditBalanceRate: number }[] {
  return rawList
    .filter((r) => r.stck_bsop_date)
    .map((r) => ({
      date: parseDateCompact(r.stck_bsop_date),
      shortVolume: parseInt(r.ssts_cntg_qty, 10) || 0,
      creditBalanceRate: parseFloat(r.crdt_bncr) || 0,
    }));
}
