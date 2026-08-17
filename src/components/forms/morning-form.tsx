"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Droplets, Pill, Sun, Sunrise } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { HABIT_ITEMS, MOOD_EMOJIS } from "@/lib/constants";
import { todayKey } from "@/lib/date";
import type { MorningLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MorningFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: MorningLog;
  onSave: (log: MorningLog) => void;
}

export function MorningForm({ open, onOpenChange, initial, onSave }: MorningFormProps) {
  const [mood, setMood] = React.useState(initial?.mood ?? 7);
  const [physical, setPhysical] = React.useState(initial?.physical ?? 7);
  const [intention, setIntention] = React.useState(initial?.intention ?? "");
  const [habits, setHabits] = React.useState({
    seaSaltWater: initial?.seaSaltWater ?? false,
    nac: initial?.nac ?? false,
    grounding: initial?.grounding ?? false,
  });

  // Reiniciar el formulario al abrir (ajuste de estado durante render)
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMood(initial?.mood ?? 7);
      setPhysical(initial?.physical ?? 7);
      setIntention(initial?.intention ?? "");
      setHabits({
        seaSaltWater: initial?.seaSaltWater ?? false,
        nac: initial?.nac ?? false,
        grounding: initial?.grounding ?? false,
      });
    }
  }

  const toggleHabit = (id: keyof typeof habits) =>
    setHabits((h) => ({ ...h, [id]: !h[id] }));

  const submit = () => {
    onSave({
      date: todayKey(),
      mood,
      physical,
      intention: intention.trim(),
      ...habits,
      completedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} drawer>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <Sunrise className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Check-in de la Mañana</h2>
            <p className="text-xs text-zinc-400">2 minutos · empieza con intención ☀️</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ánimo */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-zinc-300">Estado de Ánimo</Label>
              <span className="text-2xl">{MOOD_EMOJIS[mood - 1]}</span>
            </div>
            <Slider min={1} max={10} step={1} value={mood} onValueChange={setMood} />
            <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
              <span>Decaído</span>
              <span>Excelente</span>
            </div>
          </div>

          {/* Físico */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-zinc-300">Estado Físico</Label>
              <span className="text-sm font-semibold text-zinc-300">{physical}/10</span>
            </div>
            <Slider min={1} max={10} step={1} value={physical} onValueChange={setPhysical} />
            <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
              <span>Agotado</span>
              <span>Lleno de energía</span>
            </div>
          </div>

          {/* Intención */}
          <div>
            <Label htmlFor="intention" className="text-zinc-300">
              Intención del Día
            </Label>
            <Input
              id="intention"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Hoy elijo estar presente y sobrio…"
              className="mt-2"
              maxLength={140}
            />
          </div>

          {/* Hábitos */}
          <div>
            <Label className="text-zinc-300">Hábitos de hoy</Label>
            <div className="mt-3 space-y-2">
              {HABIT_ITEMS.map((h) => {
                const icons = {
                  seaSaltWater: <Droplets className="h-4 w-4" />,
                  nac: <Pill className="h-4 w-4" />,
                  grounding: <Sun className="h-4 w-4" />,
                } as const;
                const checked = habits[h.id];
                return (
                  <motion.button
                    key={h.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleHabit(h.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      checked
                        ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        checked
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/[0.05] text-zinc-400"
                      )}
                    >
                      {icons[h.id]}
                    </span>
                    <span className="flex-1">
                      <span className={cn("block text-sm font-medium", checked ? "text-emerald-200" : "text-zinc-200")}>
                        {h.label}
                      </span>
                      <span className="block text-xs text-zinc-500">{h.description}</span>
                    </span>
                    <Checkbox checked={checked} onCheckedChange={() => toggleHabit(h.id)} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={submit}>
            Guardar mañana
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
