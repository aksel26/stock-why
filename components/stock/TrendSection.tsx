"use client";

import { useState, useEffect } from "react";
import type { TrendPeriod } from "@/lib/trend/schema";
import type { TrendResponse } from "@/lib/trend/schema";
import PeriodSelector from "./PeriodSelector";
import TrendKPICards from "./TrendKPICards";
import PriceTrendChart from "./PriceTrendChart";

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-20" />
            ))}
          </div>
          <div className="bg-gray-100 animate-pulse rounded-xl h-80" />
        </div>
      )}

      {data && (
        <>
          <TrendKPICards kpi={data.kpi} />
          <PriceTrendChart series={data.series} />
        </>
      )}
    </div>
  );
}
