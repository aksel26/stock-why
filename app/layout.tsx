import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockWhy — 주가 변동 이유 분석",
  description: "주가 변동의 원인을 데이터 기반으로 분석하고 AI가 요약해주는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
