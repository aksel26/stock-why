import type { Metadata } from "next";
import DisclaimerBanner from "@/components/common/DisclaimerBanner";

export const metadata: Metadata = {
  title: "StockWhy — 주가 변동 이유 분석",
  description: "AI 기반 국내 주식 수급·거시·이벤트 종합 분석 서비스",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DisclaimerBanner />
      <nav className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-3xl font-bold tracking-tight text-gray-900">
          StockWhy<span className="text-[#caff33]">.</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide">
          <a className="text-gray-600 hover:text-gray-900 transition-colors" href="/">홈</a>
          <a className="text-gray-600 hover:text-gray-900 transition-colors" href="/">분석</a>
        </div>
        <div>
          <span className="bg-[#1a1a1a] text-[#caff33] px-6 py-3 rounded-full text-sm font-semibold">
            투자 참고용
          </span>
        </div>
      </nav>
      <main className="w-full flex flex-col items-center flex-grow">
        {children}
      </main>
      <footer className="w-full border-t border-gray-100 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-400">
          <p>StockWhy는 투자 참고용 서비스로, 투자 권유 또는 매매 신호를 제공하지 않습니다.</p>
          <p className="mt-1">모든 투자 판단과 책임은 투자자 본인에게 있습니다.</p>
        </div>
      </footer>
    </>
  );
}
