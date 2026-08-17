import type { AppData, DailyRecord, MorningLog, NightLog } from "@/lib/types";
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

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
