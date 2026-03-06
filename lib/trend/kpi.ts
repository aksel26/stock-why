import type { TrendDataPoint, TrendKPI } from "./schema";

export function calcTrendKPI(series: TrendDataPoint[]): TrendKPI {
  if (series.length === 0) {
    return {
      foreignNetBuyTotal: 0,
      institutionNetBuyTotal: 0,
      individualNetBuyTotal: 0,
      foreignConsecutiveDays: 0,
      institutionConsecutiveDays: 0,
      priceReturn: 0,
    };
  }

  const foreignNetBuyTotal = series.reduce((sum, d) => sum + d.foreignNetBuy, 0);
  const institutionNetBuyTotal = series.reduce((sum, d) => sum + d.institutionNetBuy, 0);
  const individualNetBuyTotal = series.reduce((sum, d) => sum + d.individualNetBuy, 0);

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

  const firstClose = series[0].close;
  const lastClose = series[series.length - 1].close;
  const priceReturn = firstClose > 0
    ? ((lastClose - firstClose) / firstClose) * 100
    : 0;

  return {
    foreignNetBuyTotal,
    institutionNetBuyTotal,
    individualNetBuyTotal,
    foreignConsecutiveDays,
    institutionConsecutiveDays,
    priceReturn: Math.round(priceReturn * 100) / 100,
  };
}
