export interface Profile {
  /** Nombre del usuario */
  name: string;
  /** Fecha de inicio de sobriedad en formato yyyy-mm-dd */
  sobrietyStartDate: string;
  /** Gasto estimado diario (MXN) */
  dailyBudget: number;
  /** Dosis/gramos estimados consumidos por día */
  dosesPerDay: number;
}

export interface MorningLog {
  date: string;
  mood: number; // 1-10
  physical: number; // 1-10
  intention: string;
  seaSaltWater: boolean;
  nac: boolean;
  grounding: boolean;
  completedAt: string;
}

export interface NightLog {
  date: string;
  sober: boolean;
  cravingLevel: number; // 1-5
  worstMoment: string;
  victories: string;
  notes: string;
  moneySaved: number;
  completedAt: string;
}

export interface DailyRecord {
  date: string; // yyyy-mm-dd
  morning?: MorningLog;
  night?: NightLog;
}

export interface AppData {
  profile: Profile | null;
  /** Registros diarios indexados por fecha (yyyy-mm-dd) */
  records: Record<string, DailyRecord>;
}
