"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { formatBreakdown, breakdown } from "@/lib/date";

interface CounterProps {
  days: number;
}

export function Counter({ days }: CounterProps) {
  const [displayDays, setDisplayDays] = useState(days);

  // Animación de conteo (el setState ocurre en el callback del rAF, no en el effect)
  useEffect(() => {
    let raf = 0;
    const duration = 900;
    const start = performance.now();
    const from = displayDays;
    const to = days;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayDays(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const b = breakdown(days);

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Halo decorativo */}
      <div className="pointer-events-none absolute -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[90px]" />

      {/* key={days}: remonta y reproduce el pulso cada vez que cambia el día */}
      <motion.div
        key={days}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.035, 1] }}
        transition={{ duration: 1.1, times: [0, 0.5, 1], ease: "easeInOut" }}
        className="relative"
      >
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Días sobrio
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        </div>

        <div className="neon-text font-mono text-[84px] font-bold leading-none tabular-nums tracking-tighter sm:text-[104px]">
          {displayDays}
        </div>

        <div className="mt-3 text-base font-medium text-zinc-300">
          {days === 1 ? "1 día" : `${days} días`} de libertad
        </div>
        <div className="mt-1 text-sm text-zinc-500">
          {formatBreakdown(b)}
        </div>
      </motion.div>
    </div>
  );
}
