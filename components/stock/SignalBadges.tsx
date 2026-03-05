import type { AnalysisSignal, SignalType } from "@/lib/domain/schema";

const SIGNAL_LABELS: Record<SignalType, string> = {
  foreign_strong_buy: "외국인 강매수",
  foreign_sell_pressure: "외국인 매도압",
  short_increase: "공매도 증가",
  credit_risk: "신용 위험",
  macro_support: "거시 지지",
  macro_pressure: "거시 압박",
  volatility_flag: "변동성 주의",
};

const STRENGTH_STYLES = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-gray-50 text-gray-600 border-gray-200",
};

const STRENGTH_LABELS = {
  high: "강",
  medium: "중",
  low: "약",
};

interface SignalBadgesProps {
  signals: AnalysisSignal[];
}

export default function SignalBadges({ signals }: SignalBadgesProps) {
  if (signals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          분석 시그널
        </h2>
        <p className="text-sm text-gray-400">감지된 시그널이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        분석 시그널
      </h2>
      <div className="flex flex-wrap gap-2">
        {signals.map((signal, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
              STRENGTH_STYLES[signal.strength]
            }`}
          >
            {SIGNAL_LABELS[signal.type]}
            <span className="opacity-70">[{STRENGTH_LABELS[signal.strength]}]</span>
          </span>
        ))}
      </div>
    </div>
  );
}
