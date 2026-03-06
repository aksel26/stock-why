"use client";

import SearchBar from "@/components/stock/SearchBar";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { Globe, BrainCircuit, ArrowRight, BarChart3, Activity } from "lucide-react";
import { useState, useEffect } from "react";

const POPULAR_STOCKS = [
  { code: "005930", name: "삼성전자", iconBg: "bg-blue-100", iconColor: "text-blue-600", trend: "+2.4%" },
  { code: "000660", name: "SK하이닉스", iconBg: "bg-red-100", iconColor: "text-red-600", trend: "+1.2%" },
  { code: "035420", name: "NAVER", iconBg: "bg-green-100", iconColor: "text-green-600", trend: "-0.5%" },
  { code: "051910", name: "LG화학", iconBg: "bg-purple-100", iconColor: "text-purple-600", trend: "+0.8%" },
  { code: "005380", name: "현대차", iconBg: "bg-slate-100", iconColor: "text-slate-800", trend: "+1.5%" },
  { code: "035720", name: "카카오", iconBg: "bg-yellow-100", iconColor: "text-yellow-700", trend: "-1.1%" },
  { code: "006400", name: "삼성SDI", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", trend: "+3.2%" },
  { code: "003670", name: "포스코퓨처엠", iconBg: "bg-orange-100", iconColor: "text-orange-600", trend: "-0.2%" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const skip = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-4 pt-24 pb-16 flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#caff33]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <FadeIn delay={0.1} y={20}>
          <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold tracking-wide text-gray-700 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#caff33] ring-4 ring-[#caff33]/30 animate-pulse"></span>
            <span>AI 기반 주식 변동 원인 분석</span>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.2} y={20}>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900">
            주가 변동, <br />
            이제 <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 relative inline-block">
              직관적으로
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#caff33]/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" />
              </svg>
            </span> 이해하세요
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} y={20}>
          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl font-medium leading-relaxed">
            복잡한 수급 동향, 거시 경제 지표, 쏟아지는 뉴스를 AI가 종합하여 <br className="hidden md:block"/> 
            주가가 왜 변했는지 명확하게 설명해 드립니다.
          </p>
        </FadeIn>

        <FadeIn delay={0.4} className="w-full max-w-lg mb-10 relative z-10">
          <SearchBar />
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/stock/005930"
              className="group bg-[#1a1a1a] text-[#caff33] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-black transition-all duration-300 flex items-center gap-2"
            >
              삼성전자 분석 보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Popular Stocks Section */}
      <section className="w-full max-w-5xl px-4 py-12">
        <FadeIn delay={0.6}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              실시간 인기 종목
            </h2>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.7} className="w-full relative py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            <motion.div
              className="flex gap-4 w-max"
              animate={!mounted || skip ? {} : { x: ["0%", "-50%"] }}
              transition={!mounted || skip ? {} : { ease: "linear", duration: 30, repeat: Infinity }}
            >
              {[...POPULAR_STOCKS, ...POPULAR_STOCKS].map((stock, i) => (
                <div key={`${stock.code}-${i}`} className="w-[260px] shrink-0">
                  <motion.div whileHover={skip ? undefined : { y: -4, scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
                    <Link
                      href={`/stock/${stock.code}`}
                      className="group flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-100 hover:border-[#caff33] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${stock.iconBg} flex items-center justify-center ${stock.iconColor} font-bold text-lg shrink-0`}>
                          {stock.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-bold text-gray-900 group-hover:text-black transition-colors text-base line-clamp-1">{stock.name}</div>
                          <div className="text-sm text-gray-400 font-medium mt-0.5">{stock.code}</div>
                        </div>
                      </div>
                      <span className={`text-base font-bold shrink-0 ${stock.trend.startsWith('+') ? 'text-red-500' : 'text-blue-500'}`}>
                        {stock.trend}
                      </span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gray-50/50 border-t border-gray-100 mt-12 py-24">
        <div className="w-full max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                투자의 인사이트를 발견하는 <span className="text-[#caff33] drop-shadow-sm bg-[#1a1a1a] px-4 py-1 rounded-xl inline-block -rotate-2 ml-2">새로운 방법</span>
              </h2>
              <p className="text-gray-500 text-lg font-medium">데이터 수집부터 분석까지, StockWhy가 대신 해드립니다.</p>
            </div>
          </FadeIn>
          
          <StaggerContainer viewportOnce className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "입체적인 수급 분석",
                desc: "외국인, 기관, 개인의 순매수 동향과 공매도 잔고 등 핵심 수급 주체의 움직임을 시각화하여 보여줍니다."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "거시 경제 연동",
                desc: "KOSPI, 환율, 금리, 글로벌 지수 등 거시 경제 지표의 변화가 개별 종목에 미치는 영향을 추적합니다."
              },
              {
                icon: <BrainCircuit className="w-8 h-8" />,
                title: "AI 종합 리포트",
                desc: "흩어진 데이터와 뉴스를 종합하여 AI가 주가 변동의 핵심 원인을 명확하고 쉽게 요약해 드립니다."
              }
            ].map((feature, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={skip ? undefined : { y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 h-full flex flex-col group hover:border-gray-200 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-[#caff33] mb-8 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg flex-grow">
                    {feature.desc}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}