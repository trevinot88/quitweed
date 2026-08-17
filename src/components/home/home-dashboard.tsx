"use client";

import * as React from "react";
import { PiggyBank, PackageX, Flame } from "lucide-react";
import { Counter } from "@/components/home/counter";
import { StatCard } from "@/components/home/stat-card";
import { CheckinBanner } from "@/components/home/checkin-banner";
import { MorningForm } from "@/components/forms/morning-form";
import { NightForm } from "@/components/forms/night-form";
import { useApp } from "@/context/app-context";
import { soberDays, moneySaved, dosesAvoided, todayMorning, todayNight } from "@/lib/selectors";
import { formatBreakdown, breakdown, formatMoney, isMorningWindow } from "@/lib/date";


export function HomeDashboard() {
  const { data, saveMorning, saveNight } = useApp();
  const [morningOpen, setMorningOpen] = React.useState(false);
  const [nightOpen, setNightOpen] = React.useState(false);

  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!data || !data.profile) return null;

  const days = soberDays(data);
  const money = moneySaved(data);
  const doses = dosesAvoided(data);
  const morning = isMorningWindow();
  const m = todayMorning(data);
  const n = todayNight(data);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div className="space-y-5">
      {/* Saludo */}
      <header className="pt-2">
        <p className="text-sm text-zinc-500">{greeting},</p>
        <h1 className="text-2xl font-bold text-zinc-100">
          {data.profile.name} <span className="align-middle">👋</span>
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500">
          Desde {formatBreakdown(breakdown(days))} cada día cuenta.
        </p>
      </header>

      {/* Contador central */}
      <div className="pt-4">
        <Counter days={days} />
      </div>


      {/* Banners de check-in */}
      <CheckinBanner
        morning={morning}
        hasMorning={Boolean(m)}
        hasNight={Boolean(n)}
        onOpenMorning={() => setMorningOpen(true)}
        onOpenNight={() => setNightOpen(true)}
      />

      {/* Estadísticas */}
      <div className="flex gap-3">
        <StatCard
          icon={<PiggyBank className="h-4 w-4" />}
          label="Dinero ahorrado"
          value={formatMoney(money)}
          sub="estimado total"
          accent
          delay={0.3}
        />
        <StatCard
          icon={<PackageX className="h-4 w-4" />}
          label="Dosis no consumidas"
          value={String(doses)}
          sub="evitadas"
          delay={0.38}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Días sobrio"
          value={String(days)}
          sub="racha"
          delay={0.46}
        />
      </div>

      {/* Forms */}
      <MorningForm
        open={morningOpen}
        onOpenChange={setMorningOpen}
        initial={m}
        onSave={saveMorning}
      />
      <NightForm
        open={nightOpen}
        onOpenChange={setNightOpen}
        initial={n}
        onSave={saveNight}
      />
    </div>
  );
}
