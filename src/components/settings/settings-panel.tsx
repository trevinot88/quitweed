"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Ban,
  CalendarDays,
  CheckCircle2,
  Database,
  Download,
  Leaf,
  Package,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { HabitEditor } from "@/components/settings/habit-editor";
import { useApp } from "@/context/app-context";
import { todayKey } from "@/lib/date";
import type { AppData, Profile } from "@/lib/types";

export function SettingsPanel() {
  const {
    data,
    setProfile,
    saveHabits,
    saveAvoids,
    importData,
    resetAll,
    resetProgress,
  } = useApp();
  const profile = data?.profile;


  const [name, setName] = React.useState(profile?.name ?? "");
  const [startDate, setStartDate] = React.useState(profile?.sobrietyStartDate ?? todayKey());
  const [budget, setBudget] = React.useState(profile?.dailyBudget ?? 300);
  const [doses, setDoses] = React.useState(profile?.dosesPerDay ?? 1);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [confirmResetProgress, setConfirmResetProgress] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const fileRef = React.useRef<HTMLInputElement>(null);

  // Sincronizar el formulario con el perfil (ajuste de estado durante render)
  const [wasProfile, setWasProfile] = React.useState(profile);
  if (profile !== wasProfile) {
    setWasProfile(profile);
    if (profile) {
      setName(profile.name ?? "");
      setStartDate(profile.sobrietyStartDate ?? todayKey());
      setBudget(profile.dailyBudget ?? 300);
      setDoses(profile.dosesPerDay ?? 1);
    }
  }


  const saveProfile = () => {
    const p: Profile = {
      name: name.trim() || "Guerrero",
      sobrietyStartDate: startDate,
      dailyBudget: Math.max(0, Number(budget) || 0),
      dosesPerDay: Math.max(0, Number(doses) || 0),
      habits: profile?.habits ?? [],
      avoids: profile?.avoids ?? [],
    };
    setProfile(p);
    setStatus({ type: "ok", msg: "Perfil guardado ✓" });
    setTimeout(() => setStatus(null), 2500);
  };


  const exportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sobrio-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus({ type: "ok", msg: "Backup exportado 📦" });
    setTimeout(() => setStatus(null), 2500);
  };

  const importDataFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed || typeof parsed !== "object" || !("records" in parsed)) {
          throw new Error("Formato inválido");
        }
        importData({
          profile: parsed.profile ?? null,
          records: parsed.records ?? {},
        });
        setStatus({ type: "ok", msg: "Datos importados ✓" });
        setTimeout(() => setStatus(null), 2500);
      } catch {
        setStatus({ type: "err", msg: "Archivo inválido. Revisa el JSON." });
        setTimeout(() => setStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">Ajustes</h1>
        <p className="text-sm text-zinc-500">Tu información, tu control.</p>
      </header>

      {/* Perfil */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Perfil</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" placeholder="Tu nombre" />
          </div>
          <div>
            <Label htmlFor="start">Fecha de inicio de sobriedad</Label>
            <div className="relative mt-2">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="start"
                type="date"
                value={startDate}
                max={todayKey()}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="budget" className="flex items-center gap-1">
                <Banknote className="h-3 w-3 text-emerald-400" /> Gasto diario (MXN)
              </Label>
              <Input
                id="budget"
                type="number"
                min={0}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="doses" className="flex items-center gap-1">
                <Package className="h-3 w-3 text-emerald-400" /> Dosis/día evitadas
              </Label>
              <Input
                id="doses"
                type="number"
                min={0}
                step={0.5}
                value={doses}
                onChange={(e) => setDoses(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>
          <Button className="w-full" onClick={saveProfile}>
            <Save className="h-4 w-4" /> Guardar perfil
          </Button>
        </div>
      </Card>

      {/* Hábitos personalizables */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Mis hábitos de la mañana</h3>
        </div>
        <p className="mb-4 text-xs text-zinc-500">
          Elige qué actividades marcas en tu check-in de la mañana. Escribe lo que quieras: agua con sal, NAC, entrenar, meditar…
        </p>

        {/* Hábito principal */}
        <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3.5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-lg">
              🌿
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-200">
                Free of weed <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Principal</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Es el eje principal de la app: tu objetivo central es dejar de consumir.
                Los demás hábitos son complementarios y te ayudan a gestionar antojos y ansiedad.
              </p>
            </div>
          </div>
        </div>

        <HabitEditor
          title="Hábitos"
          description="Actividades que quieres cumplir en la mañana"
          items={profile?.habits ?? []}
          onChange={saveHabits}
          isHabit
        />
      </Card>

      {/* Evitaciones personalizables */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Ban className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Lo que quiero evitar</h3>
        </div>
        <p className="mb-4 text-xs text-zinc-500">
          Define qué actividades marcas como "hoy evité": fumar, tomar, porno o lo que elijas.
        </p>
        <HabitEditor
          title="Evitaciones"
          description="Actividades que quieres evitar"
          items={profile?.avoids ?? []}
          onChange={saveAvoids}
          isHabit={false}
        />
      </Card>

      {/* Datos */}
      <Card className="p-5">

        <div className="mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Respaldo de datos</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={exportData} className="h-auto flex-col gap-2 py-4">
            <Download className="h-5 w-5 text-emerald-300" />
            <span className="text-xs">Exportar JSON</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-auto flex-col gap-2 py-4"
          >
            <Upload className="h-5 w-5 text-emerald-300" />
            <span className="text-xs">Importar JSON</span>
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importDataFromFile(f);
            e.target.value = "";
          }}
        />
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
          Todo se guarda solo en este dispositivo. Exporta periódicamente para no perder tu historial.
        </p>
      </Card>

      {/* Reiniciar progreso */}
      <Card className="border-amber-500/25 p-5">
        <div className="mb-2 flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-200">Reiniciar progreso</h3>
        </div>
        <p className="mb-4 text-xs text-zinc-500">
          Borra el historial de registros y pone tu contador de días de libertad en 0.
          Conserva tu perfil, hábitos y configuraciones.
        </p>
        <Button
          variant="outline"
          className="w-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10 hover:text-amber-100"
          onClick={() => setConfirmResetProgress(true)}
        >
          <RefreshCcw className="h-4 w-4" /> RESET / Reiniciar progreso de cero
        </Button>
      </Card>

      {/* Zona de peligro */}
      <Card className="border-red-500/20 p-5">
        <h3 className="mb-1 text-sm font-semibold text-red-300">Zona de peligro</h3>
        <p className="mb-4 text-xs text-zinc-500">
          Esto borra TODO tu historial y perfil de este dispositivo.
        </p>
        <Button variant="destructive" className="w-full" onClick={() => setConfirmReset(true)}>
          <Trash2 className="h-4 w-4" /> Borrar todos los datos
        </Button>
      </Card>

      {/* Status toast */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            status.type === "ok"
              ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-200"
              : "rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm font-medium text-red-200"
          }
        >
          {status.msg}
        </motion.div>
      )}

      {/* Confirmación de reinicio de progreso */}
      <Dialog open={confirmResetProgress} onOpenChange={setConfirmResetProgress}>
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <RefreshCcw className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">¿Reiniciar tu progreso?</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Se borrará el historial de registros y tu contador de días de libertad volverá a 0.
            Tu perfil y hábitos se conservan. Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmResetProgress(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetProgress();
                setConfirmResetProgress(false);
                setStatus({ type: "ok", msg: "Progreso reiniciado de cero ↺" });
                setTimeout(() => setStatus(null), 2500);
              }}
            >
              Sí, reiniciar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Confirmación de reset */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <Trash2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">¿Seguro que quieres borrar todo?</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Se eliminarán tu perfil y todos tus registros. Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                setStatus({ type: "ok", msg: "Datos eliminados" });
                setTimeout(() => setStatus(null), 2500);
              }}
            >
              Sí, borrar todo
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
