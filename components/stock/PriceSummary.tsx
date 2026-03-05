import { formatKRW, formatPercent } from "@/lib/utils/format";

interface PriceSummaryProps {
  stockName: string;
  stockCode: string;
  close: number;
  changePercent: number;
  date: string;
}

export default function PriceSummary({
  stockName,
  stockCode,
  close,
  changePercent,
  date,
}: PriceSummaryProps) {
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;
  const colorClass = isUp
    ? "text-red-500"
    : isDown
    ? "text-blue-500"
    : "text-gray-500";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{stockName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{stockCode}</p>
        </div>
        <span className="text-xs text-gray-400 mt-1">{date}</span>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-3xl font-bold text-gray-900">
          {formatKRW(close)}원
        </span>
        <span className={`text-xl font-semibold ${colorClass}`}>
          {formatPercent(changePercent)}
        </span>
      </div>
      <div className="mt-2">
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
            isUp
              ? "bg-red-50 text-red-500"
              : isDown
              ? "bg-blue-50 text-blue-500"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isUp ? "상승" : isDown ? "하락" : "보합"}
        </span>
      </div>
    </div>
  );
}
