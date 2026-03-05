"use client";

import { useEffect } from "react";
import ErrorState from "@/components/common/ErrorState";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StockError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[StockPage Error]", error);
  }, [error]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <a href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← 홈으로
      </a>
      <ErrorState
        title="분석을 불러오지 못했습니다"
        message={error.message || "잠시 후 다시 시도해주세요."}
        onRetry={reset}
      />
    </div>
  );
}
