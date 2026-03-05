"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { formatCompact } from "@/lib/utils/format";

interface SupplyData {
  foreignNetBuy: number;
  institutionNetBuy: number;
  individualNetBuy: number;
}

interface SupplyOverlayChartProps {
  supply: SupplyData;
}

export default function SupplyOverlayChart({ supply }: SupplyOverlayChartProps) {
  const data = [
    { name: "외국인", value: supply.foreignNetBuy },
    { name: "기관", value: supply.institutionNetBuy },
    { name: "개인", value: supply.individualNetBuy },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        수급 현황 (순매수)
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip
            formatter={(value: number | string | undefined) => [
              formatCompact(Number(value ?? 0)) + "원",
              "순매수",
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
          />
          <ReferenceLine y={0} stroke="#d1d5db" />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? "#ef4444" : "#3b82f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
          매수 우세
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          매도 우세
        </span>
      </div>
    </div>
  );
}
