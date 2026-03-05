/** 숫자를 한국식 통화 포맷으로 변환 (예: 1,234,567) */
export function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

/** 숫자를 억/만 단위로 축약 */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_0000_0000) {
    return `${sign}${(abs / 1_0000_0000).toFixed(1)}억`;
  }
  if (abs >= 1_0000) {
    return `${sign}${(abs / 1_0000).toFixed(0)}만`;
  }
  return `${sign}${formatKRW(abs)}`;
}

/** 등락률 포맷 (예: +3.25%, -1.50%) */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
