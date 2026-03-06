import type { TrendDataPoint } from "../trend/schema";

export function generateMockTrendSeries(days: number): TrendDataPoint[] {
  const series: TrendDataPoint[] = [];
  const baseDate = new Date("2026-03-06");
  let close = 67000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * 3;
    close = Math.round(close * (1 + change / 100));
    const foreignNetBuy = Math.round((Math.random() - 0.4) * 50000);
    const institutionNetBuy = Math.round((Math.random() - 0.45) * 30000);
    const individualNetBuy = Math.round((Math.random() - 0.5) * 40000);

    series.push({
      date: date.toISOString().slice(0, 10),
      close,
      changePercent: Math.round(change * 100) / 100,
      foreignNetBuy,
      institutionNetBuy,
      individualNetBuy,
    });
  }

  return series;
}
