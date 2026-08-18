"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Leaf, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-context";
import { DEFAULT_AVOIDS, DEFAULT_HABITS } from "@/lib/constants";
import { addDays, parseDateKey, toDateKey, todayKey } from "@/lib/date";

export function Onboarding() {
  const { setProfile } = useApp();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [soberDays, setSoberDays] = React.useState(0);
  const [startDate, setStartDate] = React.useState(todayKey());
  const [budget, setBudget] = React.useState(300);
  const [doses, setDoses] = React.useState(1);

  // Actualiza la fecha de inicio según los días sobrios actuales
  const handleSoberDaysChange = (value: number) => {
    // 0 es una opción válida: el usuario empieza hoy
    const n = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    setSoberDays(n);
    setStartDate(toDateKey(addDays(parseDateKey(todayKey()), -n)));
  };

  const finish = () => {
    const derivedStart = toDateKey(
      addDays(parseDateKey(todayKey()), -soberDays)
    );
    setProfile({
      name: name.trim() || "Guerrero",
      sobrietyStartDate: startDate || derivedStart,
      dailyBudget: Math.max(0, Number(budget) || 0),
      dosesPerDay: Math.max(0, Number(doses) || 0),
      habits: DEFAULT_HABITS,
      avoids: DEFAULT_AVOIDS,
    });
  };

  const steps = [
    {
      icon: <User className="h-5 w-5" />,
      title: "¿Cómo te llamas?",
      subtitle: "Para saludarte con tu nombre cada día.",
      content: (
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="h-12 text-center text-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              setStep(1);
            }
          }}
        />
      ),
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "¿Cuántos días llevas sobrio?",
      subtitle: "Puedes escribir 0 si hoy es tu primer día.",
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-center text-sm text-zinc-400">
              Días sobrio actuales
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={soberDays}
              onChange={(e) => handleSoberDaysChange(Number(e.target.value))}
              className="mt-2 h-12 text-center text-lg"
              placeholder="0"
            />
            <p className="mt-2 text-center text-xs text-zinc-500">
              {soberDays === 0
                ? "Comenzamos hoy: cada día cuenta 🌱"
                : `Inicio calculado: ${toDateKey(addDays(parseDateKey(todayKey()), -soberDays))}`}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <Label className="text-[11px] text-zinc-400">
              O elige la fecha exacta
            </Label>
            <div className="relative mt-1.5">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="date"
                value={startDate}
                max={todayKey()}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Si editas la fecha, recalcula los días
                  if (e.target.value) {
                    const days = Math.max(
                      0,
                      Math.round(
                        (parseDateKey(todayKey()).getTime() -
                          parseDateKey(e.target.value).getTime()) /
                          86_400_000
                      )
                    );
                    setSoberDays(days);
                  }
                }}
                className="h-12 pl-9 text-center"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "¿Cuánto gastabas por día?",
      subtitle: "Para calcular cuánto has ahorrado (en MXN).",
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-center text-sm text-zinc-400">
              Gasto diario estimado (MXN)
            </Label>
            <Input
              type="number"
              min={0}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 h-12 text-center text-lg"
            />
          </div>
          <div>
            <Label className="text-center text-sm text-zinc-400">
              Dosis/gramos por día
            </Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={doses}
              onChange={(e) => setDoses(Number(e.target.value))}
              className="mt-2 h-12 text-center text-lg"
            />
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const canNext =
    step === 0
      ? name.trim().length > 0
      : step === 1
        ? true // 0 es válido
        : true;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="neon-glow mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 ring-1 ring-emerald-400/30">
            <Leaf className="h-8 w-8 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Sobrio<span className="text-emerald-400">App</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tu viaje de sobriedad y bienestar
          </p>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="glass rounded-3xl p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                {current.icon}
              </div>
              <h2 className="text-xl font-bold text-zinc-100">{current.title}</h2>
              <p className="mb-6 mt-1 text-sm text-zinc-500">{current.subtitle}</p>
              {current.content}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicador de pasos */}
        <div className="mt-6 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Navegación */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
              className={step === 0 ? "col-span-2" : ""}
            >
              Continuar
            </Button>
          ) : (
            <Button
              onClick={finish}
              className="neon-glow bg-primary text-primary-foreground hover:bg-emerald-400"
            >
              Comenzar mi camino 🌱
            </Button>
          )}
        </div>

        {step === 1 && (
          <p className="mt-4 text-center text-[11px] text-zinc-600">
            ¿No sabes los días exactos? Usa 0 y empieza hoy: cada día cuenta.
          </p>
        )}
      </div>
    </div>
  );
}
