"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SearchBar() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      router.push(`/stock/${trimmed}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="종목코드 입력 (예: 005930)"
        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#caff33]/60 focus:border-[#caff33] text-sm"
        maxLength={10}
        autoComplete="off"
      />
      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-[#1a1a1a] text-[#caff33] rounded-full hover:bg-black transition-colors duration-200 font-semibold text-sm shrink-0"
      >
        분석
      </motion.button>
    </form>
  );
}
