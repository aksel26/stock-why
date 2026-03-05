"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  const skip =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.div
      initial={skip ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={skip ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
