import type { AiAnalysis } from "@/lib/domain/schema";

interface AiReportCardProps {
  ai: AiAnalysis | null;
}

export default function AiReportCard({ ai }: AiReportCardProps) {
  if (!ai) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#caff33] text-sm">
            AI
          </div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            AI 분석
          </h2>
        </div>
        <p className="text-sm text-gray-400">AI 분석을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 하위 호환: 구 스키마 (analysis/newsSummary)
  const isLegacy = !ai.supplyAnalysis && ai.analysis;

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
        {/* 요약 */}
        <div className="bg-[#caff33]/10 border border-[#caff33]/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-700 mb-1">요약</p>
          <p className="text-sm text-gray-800 leading-relaxed">{ai.summary}</p>
        </div>

        {isLegacy ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">상세 분석</p>
              <p className="text-sm text-gray-600 leading-relaxed">{ai.analysis}</p>
            </div>
            {ai.newsSummary && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">뉴스 요약</p>
                <p className="text-sm text-blue-600 leading-relaxed">{ai.newsSummary}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 수급 + 거시경제 2컬럼 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalysisSection title="수급 분석" content={ai.supplyAnalysis} />
              <AnalysisSection title="거시경제 분석" content={ai.macroAnalysis} />
            </div>

            {/* 이벤트 분석 (있을 때만) */}
            {ai.eventAnalysis && (
              <AnalysisSection title="이벤트 분석" content={ai.eventAnalysis} />
            )}

            {/* 뉴스 분석 */}
            {ai.newsItems && ai.newsItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-3">뉴스 분석</p>
                <div className="space-y-3">
                  {ai.newsItems.map((item, i) => (
                    <div key={i} className="border-l-2 border-blue-300 pl-3">
                      <p className="text-sm font-medium text-blue-900">{item.headline}</p>
                      <p className="text-sm text-blue-600 mt-0.5">{item.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 주의사항 */}
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

function AnalysisSection({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}
