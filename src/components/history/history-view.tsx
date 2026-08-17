"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Flame,
  Moon,
  PiggyBank,
  Smile,
  Sun,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { recordStats } from "@/lib/selectors";
import { formatKeyFull, formatMoney } from "@/lib/date";
import { cn } from "@/lib/utils";

export function HistoryView() {
  const { data } = useApp();
  if (!data) return null;

  const stats = recordStats(data);
  const records = Object.values(data.records).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">Historial</h1>
        <p className="text-sm text-zinc-500">Tu constancia en números y días.</p>
      </header>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Flame className="h-4 w-4" />} label="Racha actual" value={`${stats.streak} días`} accent />
        <Stat icon={<PiggyBank className="h-4 w-4" />} label="Ahorrado registrado" value={formatMoney(stats.totalMoneySaved)} />
        <Stat icon={<Smile className="h-4 w-4" />} label="Ánimo promedio" value={stats.avgMood !== null ? `${stats.avgMood}/10` : "—"} />
        <Stat icon={<Activity className="h-4 w-4" />} label="Check-ins" value={`${stats.checkIns}`} />
      </div>

      {/* Lista de días */}
      {records.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-4xl">🌱</p>
          <p className="mt-3 font-medium text-zinc-300">Aún no hay registros</p>
          <p className="mt-1 text-sm text-zinc-500">
            Completa tu primer check-in desde Inicio.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((rec, i) => {
            const hasMorning = Boolean(rec.morning);
            const hasNight = Boolean(rec.night);
            const soberNight = rec.night?.sober;
            return (
              <motion.div
                key={rec.date}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold capitalize text-zinc-200">
                        {formatKeyFull(rec.date)}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                        <span
                          className={cn(
                            "flex items-center gap-1",
                            hasMorning ? "text-amber-300" : "text-zinc-600"
                          )}
                        >
                          <Sun className="h-3 w-3" />
                          {hasMorning
                            ? `Ánimo ${rec.morning!.mood}/10`
                            : "Sin mañana"}
                        </span>
                        <span
                          className={cn(
                            "flex items-center gap-1",
                            hasNight ? "text-indigo-300" : "text-zinc-600"
                          )}
                        >
                          <Moon className="h-3 w-3" />
                          {hasNight ? `Craving ${rec.night!.cravingLevel}/5` : "Sin noche"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {soberNight ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Sobrio
                        </span>
                      ) : hasNight ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                          <XCircle className="h-3 w-3" /> Recaída
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-zinc-500">
                          — 
                        </span>
                      )}
                      {rec.night && rec.night.moneySaved > 0 && (
                        <span className="text-xs font-semibold text-emerald-300">
                          +{formatMoney(rec.night.moneySaved)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-4",
        accent && "border-emerald-400/20 bg-emerald-500/[0.04]"
      )}
    >
      <div
        className={cn(
          "mb-2 flex h-8 w-8 items-center justify-center rounded-lg",
          accent
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-white/[0.06] text-zinc-300"
        )}
      >
        {icon}
      </div>
      <p className={cn("text-base font-bold", accent ? "text-emerald-300" : "text-zinc-100")}>
        {value}
      </p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </Card>
  );
}
