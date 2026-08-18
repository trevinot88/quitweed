"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, History, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "home" | "progress" | "history" | "settings";

interface ShellProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  children: React.ReactNode;
}

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "progress", label: "Progreso", icon: BarChart3 },
  { id: "history", label: "Historial", icon: History },
  { id: "settings", label: "Ajustes", icon: Settings },
];

export function Shell({ activeTab, onChange, children }: ShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-28 pt-4">
      {/* Contenido con transición */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          className="flex-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Navegación inferior */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-md px-4">
          <div className="glass mb-3 flex items-center justify-around rounded-2xl px-2 py-2 shadow-2xl shadow-black/50">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChange(tab.id)}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors",
                    active ? "text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20"
                      transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative h-5 w-5 transition-all",
                      active && "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    )}
                  />
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
