import type { AiAnalysis } from "@/lib/domain/schema";

interface AiReportCardProps {
  ai: AiAnalysis | null;
}

export default function AiReportCard({ ai }: AiReportCardProps) {
  if (!ai) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          AI 분석
        </h2>
        <p className="text-sm text-gray-400">AI 분석을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#caff33] text-sm">
          AI
        </div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          AI 분석
        </h2>
      </div>

      <div className="space-y-4">
        <div className="bg-[#caff33]/10 border border-[#caff33]/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-700 mb-1">요약</p>
          <p className="text-sm text-gray-800 leading-relaxed">{ai.summary}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">상세 분석</p>
          <p className="text-sm text-gray-600 leading-relaxed">{ai.analysis}</p>
        </div>

        {ai.caution && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
            <span className="text-amber-500 text-sm shrink-0">⚠️</span>
            <p className="text-sm text-amber-700 leading-relaxed">{ai.caution}</p>
          </div>
        )}
      </div>
    </div>
  );
}
