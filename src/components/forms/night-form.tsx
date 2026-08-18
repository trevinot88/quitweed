"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Moon, Trophy, Wallet, XCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CRAVING_LABELS, MAIN_HABIT } from "@/lib/constants";
import { todayKey } from "@/lib/date";
import { nightAvoidsDone } from "@/lib/selectors";
import type { HabitItem, NightLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NightFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: NightLog;
  onSave: (log: NightLog) => void;
  avoids: HabitItem[] | undefined;
}

export function NightForm({ open, onOpenChange, initial, onSave, avoids = [] }: NightFormProps) {

  const [sober, setSober] = React.useState(initial?.sober ?? true);
  const [craving, setCraving] = React.useState(initial?.cravingLevel ?? 2);
  const [worstMoment, setWorstMoment] = React.useState(initial?.worstMoment ?? "");
  const [victories, setVictories] = React.useState(initial?.victories ?? "");
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [money, setMoney] = React.useState(initial?.moneySaved ?? 0);
  const [avoidsDone, setAvoidsDone] = React.useState<Record<string, boolean>>({});

  // Reiniciar el formulario al abrir (ajuste de estado durante render)
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSober(initial?.sober ?? true);
      setCraving(initial?.cravingLevel ?? 2);
      setWorstMoment(initial?.worstMoment ?? "");
      setVictories(initial?.victories ?? "");
      setNotes(initial?.notes ?? "");
      setMoney(initial?.moneySaved ?? 0);
      setAvoidsDone(nightAvoidsDone(initial, avoids));
    }
  }

  const toggleAvoid = (id: string) =>
    setAvoidsDone((a) => ({ ...a, [id]: !a[id] }));

  // "Free of weed" está sincronizado con el switch principal:
  // si no fumaste (sober=true) queda marcado como evitado, y si fumaste no.
  const mainAvoidChecked = sober;
  const toggleMainAvoid = () => setSober((s) => !s);

  const submit = () => {
    const allAvoidsDone = {
      ...avoidsDone,
      // El hábito principal siempre refleja el estado de sobriedad del día
      [MAIN_HABIT.id]: sober,
    };
    onSave({
      date: todayKey(),
      sober,
      cravingLevel: craving,
      worstMoment: worstMoment.trim(),
      victories: victories.trim(),
      notes: notes.trim(),
      moneySaved: Math.max(0, Number(money) || 0),
      avoidsDone: allAvoidsDone,
      completedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} drawer>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300 shadow-[0_0_20px_rgba(129,140,248,0.2)]">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Check-in de la Noche</h2>
            <p className="text-xs text-zinc-400">5 minutos · cierra tu día 🌙</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Switch Free of weed (hábito principal) */}
          <motion.div
            animate={{ boxShadow: sober ? "0 0 32px rgba(52,211,153,0.15)" : "0 0 32px rgba(248,113,113,0.15)" }}
            className={cn(
              "flex items-center justify-between rounded-2xl border p-4 transition-colors",
              sober
                ? "border-emerald-400/30 bg-emerald-500/[0.07]"
                : "border-red-400/30 bg-red-500/[0.07]"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-lg">
                🌿
              </span>
              <div>
                <p className={cn("text-sm font-semibold", sober ? "text-emerald-200" : "text-red-300")}>
                  {sober ? "Hoy NO fumé" : "Hoy SÍ fumé"}
                </p>
                <p className="text-xs text-zinc-400">
                  {sober ? "Free of weed ✓ · Increíble, sigue así 💪" : "Free of weed ✗ · Mañana es una nueva oportunidad, sé amable contigo."}
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={sober}
              onClick={() => setSober(!sober)}
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full transition-colors",
                sober ? "bg-emerald-500" : "bg-red-500"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all",
                  sober ? "left-7" : "left-1"
                )}
              />
            </button>
          </motion.div>

          {/* Cravings */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-zinc-300">Nivel de Cravings / Abstinencia</Label>
              <span className="text-sm font-semibold text-zinc-200">
                {CRAVING_LABELS[craving - 1]} · {craving}/5
              </span>
            </div>
            <Slider min={1} max={5} step={1} value={craving} onValueChange={setCraving} />
            <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
              <span>Sin cravings</span>
              <span>Muy intensos</span>
            </div>
          </div>

          {/* Evitaciones */}
          <div>
            <Label className="text-zinc-300">Hoy evité</Label>
            <div className="mt-3 space-y-2">
              {/* Hábito principal "Free of weed" sincronizado con el switch */}
              <motion.button
                key={MAIN_HABIT.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={toggleMainAvoid}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  mainAvoidChecked
                    ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
                style={
                  mainAvoidChecked
                    ? { borderColor: `${MAIN_HABIT.color}66`, backgroundColor: `${MAIN_HABIT.color}14` }
                    : undefined
                }
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base",
                    mainAvoidChecked ? "bg-white/[0.1]" : "bg-white/[0.05]"
                  )}
                  style={mainAvoidChecked ? { color: MAIN_HABIT.color } : undefined}
                >
                  {MAIN_HABIT.emoji ?? "🌿"}
                </span>
                <span className="flex-1">
                  <span
                    className={cn("block text-sm font-medium", mainAvoidChecked ? "text-emerald-200" : "text-zinc-200")}
                    style={mainAvoidChecked ? { color: MAIN_HABIT.color } : undefined}
                  >
                    {MAIN_HABIT.label}
                  </span>
                  <span className="block text-xs text-zinc-500">{MAIN_HABIT.description}</span>
                </span>
                <Checkbox checked={mainAvoidChecked} onCheckedChange={toggleMainAvoid} />
              </motion.button>

              {avoids.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-zinc-500">
                  No tienes evitaciones configuradas. Agrégalas desde Ajustes.
                </p>
              )}
              {avoids.map((a) => {
                const checked = Boolean(avoidsDone[a.id]);
                const accent = a.color ?? "#f87171";
                return (
                  <motion.button
                    key={a.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAvoid(a.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      checked
                        ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    )}
                    style={
                      checked
                        ? { borderColor: `${accent}66`, backgroundColor: `${accent}14` }
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base",
                        checked ? "bg-white/[0.1]" : "bg-white/[0.05]"
                      )}
                      style={checked ? { color: accent } : undefined}
                    >
                      {a.emoji ?? "🚫"}
                    </span>
                    <span className="flex-1">
                      <span
                        className={cn("block text-sm font-medium", checked ? "text-emerald-200" : "text-zinc-200")}
                        style={checked ? { color: accent } : undefined}
                      >
                        {a.label}
                      </span>
                      {a.description && (
                        <span className="block text-xs text-zinc-500">{a.description}</span>
                      )}
                    </span>
                    <Checkbox checked={checked} onCheckedChange={() => toggleAvoid(a.id)} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Peor momento */}
          <div>
            <Label htmlFor="worst" className="text-zinc-300">
              ¿Cómo superé el peor momento del día?
            </Label>
            <Textarea
              id="worst"
              value={worstMoment}
              onChange={(e) => setWorstMoment(e.target.value)}
              placeholder="Hubo un momento difícil con la abstinencia y…"
              className="mt-2 min-h-[80px]"
            />
          </div>

          {/* 3 victorias */}
          <div>
            <Label htmlFor="victories" className="flex items-center gap-1.5 text-zinc-300">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              3 Victorias del día
            </Label>
            <Textarea
              id="victories"
              value={victories}
              onChange={(e) => setVictories(e.target.value)}
              placeholder={"1. Hice ejercicio\n2. Trabajé enfocado\n3. Fui honesto conmigo"}
              className="mt-2 min-h-[96px]"
            />
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes" className="text-zinc-300">
              Notas / Desahogo
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lo que quieras soltar antes de dormir…"
              className="mt-2 min-h-[80px]"
            />
          </div>

          {/* Dinero ahorrado */}
          <div>
            <Label htmlFor="money" className="flex items-center gap-1.5 text-zinc-300">
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              Dinero ahorrado hoy (MXN)
            </Label>
            <Input
              id="money"
              type="number"
              min={0}
              step={1}
              value={money}
              onChange={(e) => setMoney(Number(e.target.value))}
              placeholder="0"
              className="mt-2"
            />
          </div>

          <Button className="w-full" size="lg" variant={sober ? "default" : "destructive"} onClick={submit}>
            {sober ? "Guardar noche · Sobrio ✓" : "Guardar noche · Recaída"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
