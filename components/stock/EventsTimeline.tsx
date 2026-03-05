import type { DisclosureType } from "@/lib/domain/schema";

const DISCLOSURE_LABELS: Record<DisclosureType, string> = {
  earnings: "실적",
  buyback: "자사주",
  rights: "유상증자",
  other: "공시",
};

const DISCLOSURE_COLORS: Record<DisclosureType, string> = {
  earnings: "bg-blue-100 text-blue-700",
  buyback: "bg-green-100 text-green-700",
  rights: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

interface Disclosure {
  type: DisclosureType;
  title: string;
}

interface EventsTimelineProps {
  news: string[];
  disclosures: Disclosure[];
}

export default function EventsTimeline({ news, disclosures }: EventsTimelineProps) {
  const hasContent = news.length > 0 || disclosures.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        뉴스 &amp; 공시
      </h2>
      {!hasContent ? (
        <p className="text-sm text-gray-400">관련 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {disclosures.map((d, i) => (
            <div key={`d-${i}`} className="flex items-start gap-3">
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                  DISCLOSURE_COLORS[d.type]
                }`}
              >
                {DISCLOSURE_LABELS[d.type]}
              </span>
              <p className="text-sm text-gray-700 leading-snug">{d.title}</p>
            </div>
          ))}
          {news.map((headline, i) => (
            <div key={`n-${i}`} className="flex items-start gap-3">
              <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                뉴스
              </span>
              <p className="text-sm text-gray-700 leading-snug">{headline}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
