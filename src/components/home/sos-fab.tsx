"use client";

import { motion } from "framer-motion";
import { Siren } from "lucide-react";

interface SosFabProps {
  onClick: () => void;
}

export function SosFab({ onClick }: SosFabProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", damping: 20, stiffness: 260, delay: 0.4 }}
      onClick={onClick}
      aria-label="SOS · Craving"
      className="pb-safe animate-sos fixed bottom-24 right-4 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-2xl shadow-red-500/40 ring-2 ring-white/20 hover:from-red-400 hover:to-rose-500 sm:right-[max(1rem,calc(50%-12rem))]"
    >
      <Siren className="h-7 w-7" />
    </motion.button>
  );
}
