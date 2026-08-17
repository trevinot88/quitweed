import { MORNING_HOUR_CUTOFF } from "@/lib/constants";

/** Convierte un Date a clave local yyyy-mm-dd */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatKey(key: string): string {
  return parseDateKey(key).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatKeyFull(key: string): string {
  return parseDateKey(key).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Días entre dos claves de fecha (inclusivo si sameDay=true) */
export function daysBetween(startKey: string, endKey: string): number {
  const start = parseDateKey(startKey).getTime();
  const end = parseDateKey(endKey).getTime();
  return Math.round((end - start) / 86_400_000);
}

export interface Breakdown {
  years: number;
  months: number;
  days: number;
}

export function breakdown(days: number): Breakdown {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const d = days % 30;
  return { years, months, days: d };
}

export function formatBreakdown(b: Breakdown): string {
  const parts: string[] = [];
  if (b.years > 0) parts.push(`${b.years} ${b.years === 1 ? "año" : "años"}`);
  if (b.months > 0) parts.push(`${b.months} ${b.months === 1 ? "mes" : "meses"}`);
  if (b.years === 0) parts.push(`${b.days} ${b.days === 1 ? "día" : "días"}`);
  return parts.join(" · ");
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/** true si la hora local es "ventana de mañana" */
export function isMorningWindow(): boolean {
  return new Date().getHours() < MORNING_HOUR_CUTOFF;
}
