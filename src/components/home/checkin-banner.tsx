"use client";

import { motion } from "framer-motion";
import { Moon, Sun, Trophy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckinBannerProps {
  morning: boolean;
  hasMorning: boolean;
  hasNight: boolean;
  onOpenMorning: () => void;
  onOpenNight: () => void;
}

export function CheckinBanner({
  morning,
  hasMorning,
  hasNight,
  onOpenMorning,
  onOpenNight,
}: CheckinBannerProps) {
  // Si ambos están completos
  if (hasMorning && hasNight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass flex items-center gap-3 rounded-2xl border-emerald-400/20 bg-emerald-500/[0.05] p-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-200">¡Día completo!</p>
          <p className="text-xs text-zinc-400">
            Registraste mañana y noche. Increíble constancia.
          </p>
        </div>
        <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-400" />
      </motion.div>
    );
  }

  // Banner de la mañana
  if (morning && !hasMorning) {
    return (
      <Banner
        icon={<Sun className="h-5 w-5" />}
        title="Check-in de la Mañana"
        subtitle="2 minutos · ánimo, física e intención del día"
        cta="Registrar ahora"
        tone="sun"
        onClick={onOpenMorning}
      />
    );
  }

  // Si ya hizo el de la mañana pero falta el de la noche
  if (hasMorning && !hasNight) {
    return (
      <Banner
        icon={<Moon className="h-5 w-5" />}
        title="Check-in de la Noche"
        subtitle="5 minutos · cierra tu día con victorias"
        cta="Registrar noche"
        tone="moon"
        onClick={onOpenNight}
      />
    );
  }

  // Noche sin check-in de mañana
  if (!morning && !hasMorning && !hasNight) {
    return (
      <Banner
        icon={<Moon className="h-5 w-5" />}
        title="Check-in de la Noche"
        subtitle="¿Sobrio hoy? Cierra el día con intención"
        cta="Registrar noche"
        tone="moon"
        onClick={onOpenNight}
      />
    );
  }

  // Noche, faltan ambos
  if (!morning && hasMorning) {
    return (
      <Banner
        icon={<Moon className="h-5 w-5" />}
        title="Check-in de la Noche"
        subtitle="5 minutos · cierra tu día"
        cta="Registrar noche"
        tone="moon"
        onClick={onOpenNight}
      />
    );
  }

  return null;
}

interface BannerProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta: string;
  tone: "sun" | "moon";
  onClick: () => void;
}

function Banner({ icon, title, subtitle, cta, tone, onClick }: BannerProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: 0.2 }}
      onClick={onClick}
      className={cn(
        "glass group flex w-full items-center gap-3 rounded-2xl p-4 text-left transition hover:border-white/20",
        tone === "sun" ? "border-amber-400/25 bg-amber-500/[0.06]" : "border-indigo-400/25 bg-indigo-500/[0.06]"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          tone === "sun"
            ? "bg-amber-500/15 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.2)]"
            : "bg-indigo-500/15 text-indigo-300 shadow-[0_0_16px_rgba(129,140,248,0.2)]"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-100">{title}</p>
        <p className="truncate text-xs text-zinc-400">{subtitle}</p>
      </div>
      <span
        className={cn(
          "shrink-0 text-xs font-semibold",
          tone === "sun" ? "text-amber-300" : "text-indigo-300"
        )}
      >
        {cta} →
      </span>
    </motion.button>
  );
}
