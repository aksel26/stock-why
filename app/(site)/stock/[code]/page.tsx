import Link from "next/link";
import { notFound } from "next/navigation";
import type { AnalysisResponse } from "@/lib/domain/schema";
import PriceSummary from "@/components/stock/PriceSummary";
import SignalBadges from "@/components/stock/SignalBadges";
import SupplyOverlayChart from "@/components/stock/SupplyOverlayChart";
import EventsTimeline from "@/components/stock/EventsTimeline";
import AiReportCard from "@/components/stock/AiReportCard";
import TrendSection from "@/components/stock/TrendSection";
import { AnimatedCardGrid, AnimatedCard } from "@/components/motion/StockPageAnimations";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

async function fetchAnalysis(code: string): Promise<AnalysisResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/stock/${code}/analysis`, {
    next: { revalidate: 300 },
  });

  if (res.status === 400) notFound();
  if (!res.ok) throw new Error(`분석 데이터를 불러오지 못했습니다. (${res.status})`);

  return res.json();
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return {
    title: `${code} 분석 — StockWhy`,
  };
}

export default async function StockPage({ params }: PageProps) {
  const { code } = await params;
  const data = await fetchAnalysis(code);
  const { context, ai } = data;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#caff33] hover:bg-[#1a1a1a] px-4 py-2 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기
        </Link>
      </div>

      <AnimatedCardGrid className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column (Summary) */}
        <AnimatedCard className="lg:col-span-4 flex flex-col gap-6">
          <PriceSummary
            stockName={context.stockName}
            stockCode={context.stockCode}
            close={context.price.close}
            changePercent={context.price.changePercent}
            date={context.date}
          />
          <SignalBadges signals={context.signals} />
          
          {/* Macro Environment Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                거시 환경
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <MacroRow label="KOSPI" value={context.macro.kospiChange} />
              <MacroRow label="USD/KRW" value={context.macro.usdKrwChange} />
              <MacroRow label="NASDAQ" value={context.macro.nasdaqChange} />
            </div>
          </div>
        </AnimatedCard>

        {/* Right column (Details) */}
        <AnimatedCard className="lg:col-span-8 flex flex-col gap-6">
          <AiReportCard ai={ai} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <SupplyOverlayChart supply={context.supply} />
             <EventsTimeline
               news={context.events.news}
               disclosures={context.events.disclosures}
             />
          </div>
          <TrendSection stockCode={context.stockCode} />
        </AnimatedCard>
      </AnimatedCardGrid>

      <div className="mt-16 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full text-xs text-gray-500 font-medium">
          <span>생성 시각: {new Date(data.meta.generatedAt).toLocaleString("ko-KR")}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{data.meta.cache === "hit" ? "⚡ 캐시된 데이터" : "🔄 실시간 생성"}</span>
        </div>
      </div>
    </div>
  );
}

function MacroRow({ label, value }: { label: string; value: number }) {
  const isUp = value > 0;
  const isDown = value < 0;
  const colorClass = isUp ? "text-red-500 bg-red-50" : isDown ? "text-blue-500 bg-blue-50" : "text-gray-500 bg-gray-50";
  const textClass = isUp ? "text-red-600" : isDown ? "text-blue-600" : "text-gray-600";
  const sign = isUp ? "+" : "";

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100/50 hover:bg-gray-50 transition-colors">
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-bold text-sm ${textClass}`}>
          {sign}{value.toFixed(2)}%
        </span>
        <div className={`p-1 rounded-md ${colorClass}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}
