export interface HabitItem {
  /** Identificador único */
  id: string;
  /** Nombre visible (ej. "Agua con sal de mar", "Fumar") */
  label: string;
  /** Descripción corta */
  description?: string;
  /** Emoji para el check-list */
  emoji?: string;
  /** Color de acento (hex) */
  color?: string;
}

export interface Profile {
  /** Nombre del usuario */
  name: string;
  /** Fecha de inicio de sobriedad en formato yyyy-mm-dd */
  sobrietyStartDate: string;
  /** Gasto estimado diario (MXN) */
  dailyBudget: number;
  /** Dosis/gramos estimados consumidos por día */
  dosesPerDay: number;
  /** Actividades que SÍ se hacen (checklist de la mañana) */
  habits: HabitItem[];
  /** Actividades que se EVITAN (checklist de la noche) */
  avoids: HabitItem[];
}

export interface MorningLog {
  date: string;
  mood: number; // 1-10
  physical: number; // 1-10
  intention: string;
  /** Checkboxes de hábitos cumplidos (id -> hecho) */
  habitsDone?: Record<string, boolean>;
  /** Legacy (v1): campos booleanos fijos */
  seaSaltWater?: boolean;
  nac?: boolean;
  grounding?: boolean;
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
  /** Actividades evitadas (id -> evitado) */
  avoidsDone?: Record<string, boolean>;
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
