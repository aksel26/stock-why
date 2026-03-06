"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const skip = useReducedMotion();

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={skip ? undefined : { height: "auto", opacity: 1 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={skip ? undefined : { height: 0, opacity: 0 }}
          transition={skip ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-sm text-amber-800">
            <span>
              <strong>투자 참고용</strong> — 이 서비스의 분석 결과는 투자 권유가 아닙니다. 투자 판단은 본인 책임입니다.
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="ml-4 text-amber-600 hover:text-amber-900 font-medium shrink-0"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
