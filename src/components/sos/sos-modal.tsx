"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOS_TIMER_SECONDS } from "@/lib/constants";

interface SosModalProps {
  open: boolean;
  onClose: () => void;
  intention: string;
}

/** Fases del box breathing: inhalar-aguantar-exhalar-aguantar (4-4-4-4) */
const PHASES = [
  { label: "Inhala", duration: 4 },
  { label: "Aguanta", duration: 4 },
  { label: "Exhala", duration: 4 },
  { label: "Aguanta", duration: 4 },
] as const;

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SosModal({ open, onClose, intention }: SosModalProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(SOS_TIMER_SECONDS);
  const [phaseIndex, setPhaseIndex] = React.useState(0);
  const [phaseProgress, setPhaseProgress] = React.useState(0);
  const phase = PHASES[phaseIndex];

  // Reiniciar el estado al abrir (ajuste de estado durante render)
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSecondsLeft(SOS_TIMER_SECONDS);
      setPhaseIndex(0);
      setPhaseProgress(0);
    }
  }

  // Temporizador de 5 minutos (setState dentro de callbacks asíncronos)
  React.useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  // Ciclo de respiración (setState dentro de callbacks asíncronos)
  React.useEffect(() => {
    if (!open) return;
    let elapsed = 0;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      elapsed += now - last;
      last = now;
      const p = elapsed / (phase.duration * 1000);
      if (p >= 1) {
        setPhaseIndex((i) => (i + 1) % PHASES.length);
        setPhaseProgress(0);
        elapsed = 0;
      } else {
        setPhaseProgress(p);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phaseIndex]);

  // El orbe se expande al inhalar, se contrae al exhalar
  const isExpanding = phase.label === "Inhala";
  const isContracting = phase.label === "Exhala";
  const orbScale = isExpanding
    ? 1 + phaseProgress * 0.45
    : isContracting
    ? 1.45 - phaseProgress * 0.45
    : 1;

  const countdownPct = (secondsLeft / SOS_TIMER_SECONDS) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/3 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-[100px]" />
          </div>

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
            {/* Título */}
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-bold text-zinc-100">Momento difícil</h2>
            </div>
            <p className="mb-6 text-xs text-zinc-500">
              Esto pasará. Respira conmigo 4-4-4-4.
            </p>

            {/* Intención del día */}
            {intention ? (
              <div className="glass mb-8 w-full rounded-2xl p-4">
                <p className="text-[11px] uppercase tracking-widest text-zinc-500">
                  Tu intención de hoy
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-200">
                  “{intention}”
                </p>
              </div>
            ) : (
              <div className="glass mb-8 w-full rounded-2xl p-4">
                <p className="text-sm font-medium text-zinc-300">
                  No registraste intención hoy. Solo respira: esto también pasará.
                </p>
              </div>
            )}

            {/* Orbe de respiración */}
            <div className="relative mb-8 flex h-56 w-56 items-center justify-center">
              {/* Anillos */}
              <motion.div
                animate={{ scale: orbScale, opacity: isContracting ? 0.55 : 0.9 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="orb-glow absolute h-44 w-44 rounded-full bg-red-500/15 blur-2xl"
              />
              <motion.div
                animate={{ scale: orbScale }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute h-36 w-36 rounded-full border-2 border-red-400/40 bg-red-500/10 shadow-[0_0_60px_rgba(248,113,113,0.25)]"
              />
              <motion.div
                animate={{ scale: orbScale }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500/30 to-rose-600/30 backdrop-blur-sm"
              >
                <span className="text-2xl font-bold text-red-200">
                  {phase.label}
                </span>
              </motion.div>
            </div>

            {/* Timer */}
            <div className="glass mb-8 w-full rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <Timer className="h-4 w-4 text-red-400" />
                  Temporizador de calma
                </span>
                <span className="font-mono text-lg font-bold tabular-nums text-zinc-100">
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400"
                  animate={{ width: `${countdownPct}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </div>

            {/* Cerrar */}
            <Button
              variant="outline"
              className="w-full border-white/15 text-zinc-300 hover:bg-white/[0.06]"
              onClick={onClose}
            >
              Me siento mejor, cerrar
            </Button>
            <p className="mt-3 text-[11px] text-zinc-600">
              Recuerda: el craving suele durar 15-20 minutos. Tú puedes. 💚
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
