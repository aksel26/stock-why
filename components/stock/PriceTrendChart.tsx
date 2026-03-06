"use client";

import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import type { TrendDataPoint } from "@/lib/trend/schema";
import { formatKRW, formatCompact } from "@/lib/utils/format";

interface PriceTrendChartProps {
  series: TrendDataPoint[];
}

export default function PriceTrendChart({ series }: PriceTrendChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        주가 + 수급 추세
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={series} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(d: string) => d.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: number) => formatKRW(v)}
            domain={["auto", "auto"]}
          />
          <YAxis
            yAxisId="supply"
            orientation="right"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12, borderRadius: 8,
              border: "1px solid #e5e7eb", backgroundColor: "#fff",
            }}
            formatter={(value: number | string | undefined, name: string | undefined) => {
              const v = Number(value ?? 0);
              if (name === "close") return [formatKRW(v) + "원", "종가"];
              if (name === "foreignNetBuy") return [formatCompact(v), "외국인"];
              if (name === "institutionNetBuy") return [formatCompact(v), "기관"];
              if (name === "individualNetBuy") return [formatCompact(v), "개인"];
              return [String(value), String(name ?? "")];
            }}
            labelFormatter={(label) => String(label)}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) => {
              const map: Record<string, string> = {
                close: "종가",
                foreignNetBuy: "외국인 순매수",
                institutionNetBuy: "기관 순매수",
                individualNetBuy: "개인 순매수",
              };
              return map[value] ?? value;
            }}
          />
          <ReferenceLine yAxisId="supply" y={0} stroke="#d1d5db" />
          <Bar yAxisId="supply" dataKey="foreignNetBuy" fill="#ef4444" opacity={0.6} radius={[2, 2, 0, 0]} />
          <Bar yAxisId="supply" dataKey="institutionNetBuy" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
          <Bar yAxisId="supply" dataKey="individualNetBuy" fill="#10b981" opacity={0.6} radius={[2, 2, 0, 0]} />
          <Line yAxisId="price" type="monotone" dataKey="close" stroke="#111827" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
