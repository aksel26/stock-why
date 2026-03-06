import type { MacroData } from "../../domain/schema";

export interface KospiRaw {
  bstp_nmix_prpr: string;   // 현재가
  bstp_nmix_prdy_ctrt: string; // 전일 대비율
  prdy_vrss_sign: string;   // 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)
}

export interface NasdaqRaw {
  ovrs_nmix_prpr: string;      // 현재가
  prdy_ctrt: string;           // 전일 대비율
  prdy_vrss_sign: string;      // 부호
}

export interface UsdKrwRaw {
  ovrs_nmix_prpr: string;      // 현재 환율
  prdy_ctrt: string;           // 전일 대비율
  prdy_vrss_sign: string;      // 부호
}

function signedChange(ctrt: string, sign: string): number {
  const isNegative = sign === "4" || sign === "5";
  return parseFloat(ctrt) * (isNegative ? -1 : 1);
}

export function mapMacroData(
  kospi: KospiRaw,
  nasdaq: NasdaqRaw,
  usdKrw: UsdKrwRaw
): MacroData {
  return {
    kospiChange: signedChange(kospi.bstp_nmix_prdy_ctrt, kospi.prdy_vrss_sign),
    nasdaqChange: signedChange(nasdaq.prdy_ctrt, nasdaq.prdy_vrss_sign),
    usdKrwChange: signedChange(usdKrw.prdy_ctrt, usdKrw.prdy_vrss_sign),
  };
}
