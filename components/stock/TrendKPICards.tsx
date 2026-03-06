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
      label: "개인 순매수",
      value: formatCompact(kpi.individualNetBuyTotal),
      color: kpi.individualNetBuyTotal >= 0 ? "text-red-600" : "text-blue-600",
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
