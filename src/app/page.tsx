"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell, type Tab } from "@/components/layout/shell";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { HistoryView } from "@/components/history/history-view";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Onboarding } from "@/components/onboarding/onboarding";
import { SosFab } from "@/components/home/sos-fab";
import { SosModal } from "@/components/sos/sos-modal";
import { useApp } from "@/context/app-context";
import { todayMorning } from "@/lib/selectors";

export default function HomePage() {
  const { data, ready } = useApp();
  const [tab, setTab] = React.useState<Tab>("home");
  const [sosOpen, setSosOpen] = React.useState(false);

  const intention = data ? todayMorning(data)?.intention ?? "" : "";

  // Pantalla de carga mientras se lee localStorage
  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="neon-glow flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 ring-1 ring-emerald-400/30"
        >
          <span className="text-3xl">🌱</span>
        </motion.div>
        <p className="text-sm text-zinc-500">Cargando tu viaje…</p>
      </div>
    );
  }

  // Primer uso: onboarding
  if (!data?.profile) {
    return <Onboarding />;
  }

  return (
    <>
      <Shell activeTab={tab} onChange={setTab}>
        {tab === "home" && <HomeDashboard />}
        {tab === "history" && <HistoryView />}
        {tab === "settings" && <SettingsPanel />}
      </Shell>

      <SosFab onClick={() => setSosOpen(true)} />
      <SosModal open={sosOpen} onClose={() => setSosOpen(false)} intention={intention} />
    </>
  );
}
