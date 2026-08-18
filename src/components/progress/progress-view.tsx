"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/app-context";
import {
  progressStats,
  sobrietyDayKeys,
  dayStatus,
  habitCompletion,
  avoidCompletion,
} from "@/lib/selectors";
import { formatKeyFull } from "@/lib/date";
import { cn } from "@/lib/utils";

export function ProgressView() {
  const { data } = useApp();
  if (!data || !data.profile) return null;

  const profile = data.profile;
  const stats = progressStats(data);
  const today = new Date();


  // Construir el mes actual del calendario
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = today.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthStatus = (d: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return dayStatus(data.records[key]);
  };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const habits = profile.habits.map((h) => ({
    ...h,
    stat: habitCompletion(data, h.id, profile.habits),
  }));
  const avoids = profile.avoids.map((a) => ({
    ...a,
    stat: avoidCompletion(data, a.id, profile.avoids),
  }));

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">Progreso</h1>
        <p className="text-sm text-zinc-500">Tu calendario y estadísticas de constancia.</p>
      </header>

      {/* Dashboard de estadísticas principales */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat icon={<Flame className="h-4 w-4" />} label="Días sobrio" value={`${stats.soberDays}`} accent />
        <MiniStat icon={<CheckCircle2 className="h-4 w-4" />} label="Tasa de éxito" value={`${stats.successRate}%`} />
        <MiniStat icon={<Award className="h-4 w-4" />} label="Mejor racha" value={`${stats.bestStreak} días`} />
        <MiniStat icon={<CalendarCheck2 className="h-4 w-4" />} label="Mes actual" value={`${stats.soberThisMonth}/${stats.totalThisMonth}`} />
      </div>

      {/* Barra de progreso general */}
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-200">Constancia general</p>
          <span className="text-xs text-emerald-300">{stats.successRate}%</span>
        </div>
        <Progress value={stats.successRate} />
        <p className="mt-2 text-[11px] text-zinc-500">
          {stats.soberDays} de {stats.totalDays} días registrados como sobrios desde tu inicio.
        </p>
      </Card>

      {/* Calendario del mes */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold capitalize text-zinc-200">{monthLabel}</p>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Sobrio
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2.5 w-2.5 rounded-full bg-red-400" /> Recaída
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Parcial
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {dayNames.map((d, i) => (
            <div key={`d-${i}`} className="pb-1 text-center text-[11px] font-medium text-zinc-600">
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e-${i}`} />;
            const status = monthStatus(d);
            const todayCell = isToday(d);
            return (
              <div
                key={d}
                title={formatKeyFull(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-xs font-semibold",
                  status === "sober" && "bg-emerald-500/25 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.25)]",
                  status === "relapse" && "bg-red-500/25 text-red-200 shadow-[0_0_10px_rgba(248,113,113,0.25)]",
                  status === "partial" && "bg-amber-500/20 text-amber-200",
                  status === "none" && "bg-white/[0.04] text-zinc-500",
                  todayCell && "ring-2 ring-emerald-400"
                )}
              >
                {d}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-zinc-600">
          Toca un día con registro para verlo en el historial. Los días sin marcar aún no tienen check-in.
        </p>
      </Card>

      {/* Cumplimiento de hábitos */}
      {habits.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Cumplimiento de hábitos</h3>
          </div>
          <div className="space-y-3">
            {habits.map((h) => (
              <div key={h.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span>{h.emoji ?? "✅"}</span> {h.label}
                  </span>
                  <span className="text-zinc-400">
                    {h.stat.completed}/{h.stat.opportunities} · <span className="text-emerald-300">{h.stat.rate}%</span>
                  </span>
                </div>
                <Progress value={h.stat.rate} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cumplimiento de evitaciones */}
      {avoids.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Evitaciones cumplidas</h3>
          </div>
          <div className="space-y-3">
            {avoids.map((a) => (
              <div key={a.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span>{a.emoji ?? "🚫"}</span> {a.label}
                  </span>
                  <span className="text-zinc-400">
                    {a.stat.completed}/{a.stat.opportunities} · <span className="text-emerald-300">{a.stat.rate}%</span>
                  </span>
                </div>
                <Progress value={a.stat.rate} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumen del historial */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Resumen del viaje</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <SummaryCell label="Sobrios" value={stats.soberDays} tone="emerald" />
          <SummaryCell label="Parciales" value={stats.partialDays} tone="amber" />
          <SummaryCell label="Recaídas" value={stats.relapseDays} tone="red" />
          <SummaryCell label="Sin datos" value={stats.emptyDays} tone="zinc" />
        </div>
      </Card>
    </div>
  );
}

function MiniStat({
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1"
    >
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
    </motion.div>
  );
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "red" | "zinc";
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <p
        className={cn(
          "text-lg font-bold",
          tone === "emerald" && "text-emerald-300",
          tone === "amber" && "text-amber-300",
          tone === "red" && "text-red-300",
          tone === "zinc" && "text-zinc-400"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}
