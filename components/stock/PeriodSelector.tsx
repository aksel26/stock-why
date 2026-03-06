"use client";

import type { TrendPeriod } from "@/lib/trend/schema";

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: "1W", label: "1주" },
  { value: "1M", label: "1개월" },
  { value: "3M", label: "3개월" },
  { value: "6M", label: "6개월" },
  { value: "1Y", label: "1년" },
];

interface PeriodSelectorProps {
  selected: TrendPeriod;
  onChange: (period: TrendPeriod) => void;
  disabled?: boolean;
}

export default function PeriodSelector({ selected, onChange, disabled }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {PERIODS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          disabled={disabled}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
            selected === value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
