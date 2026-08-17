"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  delay?: number;
}

export function StatCard({ icon, label, value, sub, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="flex-1"
    >
      <Card
        className={cn(
          "h-full p-4",
          accent && "border-emerald-400/20 bg-emerald-500/[0.04]"
        )}
      >
        <div
          className={cn(
            "mb-2 flex h-9 w-9 items-center justify-center rounded-xl",
            accent
              ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.25)]"
              : "bg-white/[0.06] text-zinc-300"
          )}
        >
          {icon}
        </div>
        <div
          className={cn(
            "text-lg font-bold leading-tight tracking-tight",
            accent ? "text-emerald-300" : "text-zinc-100"
          )}
        >
          {value}
        </div>
        <div className="mt-0.5 text-xs font-medium text-zinc-500">{label}</div>
        {sub && <div className="mt-1 text-[11px] text-zinc-600">{sub}</div>}
      </Card>
    </motion.div>
  );
}
