"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  CalendarDays,
  Database,
  Download,
  Package,
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
import { useApp } from "@/context/app-context";
import { todayKey } from "@/lib/date";
import type { AppData, Profile } from "@/lib/types";

export function SettingsPanel() {
  const { data, setProfile, importData, resetAll } = useApp();
  const profile = data?.profile;

  const [name, setName] = React.useState(profile?.name ?? "");
  const [startDate, setStartDate] = React.useState(profile?.sobrietyStartDate ?? todayKey());
  const [budget, setBudget] = React.useState(profile?.dailyBudget ?? 300);
  const [doses, setDoses] = React.useState(profile?.dosesPerDay ?? 1);
  const [confirmReset, setConfirmReset] = React.useState(false);
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
