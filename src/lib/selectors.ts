import type {
  AppData,
  DailyRecord,
  HabitItem,
  MorningLog,
  NightLog,
} from "@/lib/types";
import { daysBetween, todayKey } from "@/lib/date";

export function todayRecord(data: AppData, dateKey = todayKey()): DailyRecord {
  return data.records[dateKey] ?? { date: dateKey };
}

export function todayMorning(data: AppData, dateKey = todayKey()): MorningLog | undefined {
  return todayRecord(data, dateKey).morning;
}

export function todayNight(data: AppData, dateKey = todayKey()): NightLog | undefined {
  return todayRecord(data, dateKey).night;
}

/** Días de sobriedad acumulados hasta hoy (inclusivo) */
export function soberDays(data: AppData): number {
  if (!data.profile) return 0;
  const days = daysBetween(data.profile.sobrietyStartDate, todayKey());
  return Math.max(0, days + 1);
}

/** Dinero ahorrado según el presupuesto diario configurado */
export function moneySaved(data: AppData): number {
  if (!data.profile) return 0;
  return soberDays(data) * data.profile.dailyBudget;
}

/** Dosis no consumidas acumuladas */
export function dosesAvoided(data: AppData): number {
  if (!data.profile) return 0;
  return soberDays(data) * data.profile.dosesPerDay;
}

/* ---------------- Hábitos y evitaciones ---------------- */

/** Resuelve qué hábitos de la mañana se marcaron como hechos (compatible con v1) */
export function morningHabitsDone(
  log: MorningLog | undefined,
  habits: HabitItem[]
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!log) return out;
  if (log.habitsDone) return log.habitsDone;
  // Legacy v1
  if (log.seaSaltWater) out["seaSaltWater"] = true;
  if (log.nac) out["nac"] = true;
  if (log.grounding) out["grounding"] = true;
  return out;
}

/** Resuelve qué evitaciones se marcaron como evitadas */
export function nightAvoidsDone(
  log: NightLog | undefined,
  avoids: HabitItem[]
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!log || !log.avoidsDone) return out;
  return log.avoidsDone;
}

export interface CompletionStat {
  /** Veces que se pudo cumplir (días con registro) */
  opportunities: number;
  /** Veces que se cumplió */
  completed: number;
  /** Porcentaje 0-100 (0 si no hay oportunidades) */
  rate: number;
}

/** Estadística de cumplimiento de un hábito (mañana) */
export function habitCompletion(
  data: AppData,
  habitId: string,
  habits: HabitItem[]
): CompletionStat {
  let opportunities = 0;
  let completed = 0;
  for (const rec of Object.values(data.records)) {
    const done = morningHabitsDone(rec.morning, habits)[habitId];
    if (done !== undefined) {
      opportunities++;
      if (done) completed++;
    }
  }
  return {
    opportunities,
    completed,
    rate: opportunities ? Math.round((completed / opportunities) * 100) : 0,
  };
}

/** Estadística de cumplimiento de una evitación (noche) */
export function avoidCompletion(
  data: AppData,
  avoidId: string,
  avoids: HabitItem[]
): CompletionStat {
  let opportunities = 0;
  let completed = 0;
  for (const rec of Object.values(data.records)) {
    const done = nightAvoidsDone(rec.night, avoids)[avoidId];
    if (done !== undefined) {
      opportunities++;
      if (done) completed++;
    }
  }
  return {
    opportunities,
    completed,
    rate: opportunities ? Math.round((completed / opportunities) * 100) : 0,
  };
}

/* ---------------- Registros y rachas ---------------- */

export interface RecordStats {
  checkIns: number;
  soberDaysRecorded: number;
  avgMood: number | null;
  avgCraving: number | null;
  totalMoneySaved: number;
  streak: number;
}

/** Estadísticas sobre todos los registros guardados */
export function recordStats(data: AppData): RecordStats {
  const entries = Object.values(data.records);
  let checkIns = 0;
  let soberDaysRecorded = 0;
  let moodSum = 0;
  let moodCount = 0;
  let cravingSum = 0;
  let cravingCount = 0;
  let totalMoneySaved = 0;

  for (const rec of entries) {
    if (rec.morning) {
      checkIns++;
      moodSum += rec.morning.mood;
      moodCount++;
    }
    if (rec.night) {
      checkIns++;
      if (rec.night.sober) soberDaysRecorded++;
      cravingSum += rec.night.cravingLevel;
      cravingCount++;
      totalMoneySaved += rec.night.moneySaved;
    }
  }

  // Racha: días consecutivos con registro nocturno "sober" terminando hoy
  const dates = entries
    .filter((r) => r.night?.sober)
    .map((r) => r.date)
    .sort()
    .reverse();
  let streak = 0;
  const today = todayKey();
  const cursor = new Date(today);

  const startSet = new Set(dates);
  if (!startSet.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (startSet.has(toKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    checkIns,
    soberDaysRecorded,
    avgMood: moodCount ? Math.round((moodSum / moodCount) * 10) / 10 : null,
    avgCraving: cravingCount ? Math.round((cravingSum / cravingCount) * 10) / 10 : null,
    totalMoneySaved,
    streak,
  };
}

/* ---------------- Calendario y progreso ---------------- */

export type DayStatus =
  | "none" // sin registros
  | "partial" // solo un check-in, sin registro de sobriedad
  | "sober" // día sobrio (noche registrada como sobrio)
  | "relapse"; // día con recaída

/** Estado del día para el calendario */
export function dayStatus(rec: DailyRecord | undefined): DayStatus {
  if (!rec) return "none";
  if (rec.night) return rec.night.sober ? "sober" : "relapse";
  if (rec.morning) return "partial";
  return "none";
}

/** Clave local de un Date (yyyy-mm-dd) */
export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Días desde el inicio hasta hoy (claves en orden cronológico) */
export function sobrietyDayKeys(data: AppData): string[] {
  if (!data.profile) return [];
  const start = data.profile.sobrietyStartDate;
  const today = todayKey();
  const days = daysBetween(start, today);
  const keys: string[] = [];
  const cursor = new Date(start);
  for (let i = 0; i <= days; i++) {
    keys.push(toKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export interface ProgressStats {
  totalDays: number;
  soberDays: number;
  relapseDays: number;
  partialDays: number;
  emptyDays: number;
  /** % de días sin recaída sobre días desde inicio */
  successRate: number;
  bestStreak: number;
  currentStreak: number;
  soberThisMonth: number;
  totalThisMonth: number;
}

export function progressStats(data: AppData): ProgressStats {
  const keys = sobrietyDayKeys(data);
  let sober = 0;
  let relapse = 0;
  let partial = 0;
  let empty = 0;

  let bestStreak = 0;
  let currentRun = 0;

  for (const k of keys) {
    const status = dayStatus(data.records[k]);
    if (status === "sober") {
      sober++;
      currentRun++;
      bestStreak = Math.max(bestStreak, currentRun);
    } else if (status === "relapse") {
      relapse++;
      currentRun = 0;
    } else if (status === "partial") {
      partial++;
      currentRun = 0;
    } else {
      empty++;
      currentRun = 0;
    }
  }

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let soberThisMonth = 0;
  let totalThisMonth = 0;
  for (const k of keys) {
    if (!k.startsWith(monthKey)) continue;
    totalThisMonth++;
    if (dayStatus(data.records[k]) === "sober") soberThisMonth++;
  }

  const totalDays = keys.length;
  const successRate = totalDays ? Math.round((sober / totalDays) * 100) : 0;

  return {
    totalDays,
    soberDays: sober,
    relapseDays: relapse,
    partialDays: partial,
    emptyDays: empty,
    successRate,
    bestStreak,
    currentStreak: currentRun,
    soberThisMonth,
    totalThisMonth,
  };
}

