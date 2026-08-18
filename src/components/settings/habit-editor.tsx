"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCENT_COLORS, AVOID_EMOJIS, HABIT_EMOJIS, MAIN_HABIT } from "@/lib/constants";
import type { HabitItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitEditorProps {
  title: string;
  description: string;
  items: HabitItem[];
  onChange: (items: HabitItem[]) => void;
  /** true = hábitos de la mañana, false = evitaciones de la noche */
  isHabit?: boolean;
}

export function HabitEditor({ title, description, items, onChange, isHabit = true }: HabitEditorProps) {
  const [newLabel, setNewLabel] = React.useState("");
  const [newEmoji, setNewEmoji] = React.useState(isHabit ? "💪" : "🚭");
  const [newColor, setNewColor] = React.useState(isHabit ? "#34d399" : "#f87171");

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    onChange([
      ...items,
      { id, label, emoji: newEmoji, color: newColor, description: "" },
    ]);
    setNewLabel("");
  };

  const removeItem = (id: string) => {
    // El hábito principal "Free of weed" no se puede eliminar
    if (id === MAIN_HABIT.id) return;
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<HabitItem>) => {
    // El hábito principal es fijo: no se puede editar su nombre/descripción
    if (id === MAIN_HABIT.id) return;
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const emojis = isHabit ? HABIT_EMOJIS : AVOID_EMOJIS;

  return (
    <div>
      {/* Lista actual */}
      <div className="space-y-2">
        {items.map((item) => {
          const isFixed = item.fixed || item.id === MAIN_HABIT.id;
          return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 rounded-xl border p-2.5",
              isFixed
                ? "border-emerald-400/20 bg-emerald-500/[0.04]"
                : "border-white/10 bg-white/[0.02]"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-lg">
              {item.emoji ?? (isHabit ? "✅" : "🚫")}
            </span>
            <div className="min-w-0 flex-1">
              {isFixed ? (
                <p className="px-2 text-sm font-medium text-emerald-200">
                  {item.label}
                  <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    Principal
                  </span>
                </p>
              ) : (
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(item.id, { label: e.target.value })}
                  className="h-8 border-transparent bg-transparent px-2 text-sm font-medium focus:border-white/20"
                  aria-label={`Nombre de ${item.label}`}
                />
              )}
              {item.description && (
                <p className="px-2 text-[11px] text-zinc-500">{item.description}</p>
              )}
            </div>
            {isFixed ? (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-400/70"
                title="Hábito principal fijo: no se puede eliminar"
              >
                <Lock className="h-4 w-4" />
              </span>
            ) : (
              <button
                onClick={() => removeItem(item.id)}
                aria-label={`Eliminar ${item.label}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </motion.div>
          );
        })}
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-500">
            No hay elementos todavía. Agrega uno abajo.
          </p>
        )}
      </div>

      {/* Agregar nuevo */}
      <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div>
          <Label className="text-[11px] text-zinc-400">Nuevo elemento</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={isHabit ? "Ej. Entrenar, Meditar…" : "Ej. Jugar videojuegos…"}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
              }}
            />
            <Button size="sm" onClick={addItem} disabled={!newLabel.trim()}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
        </div>

        {/* Selector de emoji */}
        <div>
          <Label className="text-[11px] text-zinc-400">Emoji</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setNewEmoji(e)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-base transition",
                  newEmoji === e
                    ? "bg-emerald-500/20 ring-1 ring-emerald-400"
                    : "bg-white/[0.04] hover:bg-white/[0.08]"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de color */}
        <div>
          <Label className="text-[11px] text-zinc-400">Color</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                aria-label={`Color ${c}`}
                className={cn(
                  "h-7 w-7 rounded-full transition",
                  newColor === c && "ring-2 ring-white/70 ring-offset-2 ring-offset-black"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
