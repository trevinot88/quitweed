export const STORAGE_KEY = "sobrio:app-data:v1";

/** Antes de esta hora (local) se muestra el check-in de la mañana */
export const MORNING_HOUR_CUTOFF = 14;

export const SOS_TIMER_SECONDS = 5 * 60;

export interface HabitItem {
  id: string;
  label: string;
  description?: string;
  emoji?: string;
  color?: string;
  /** true = hábito principal fijo y obligatorio, no se puede eliminar ni desactivar */
  fixed?: boolean;
}


export const HABIT_EMOJIS = [
  "💧",
  "💊",
  "☀️",
  "🏋️",
  "🏃",
  "🧘",
  "📖",
  "💪",
  "🥗",
  "🚶",
  "🛌",
  "💨",
  "🌿",
  "🎯",
  "🧠",
  "❤️",
];

export const AVOID_EMOJIS = [
  "🚭",
  "🍺",
  "🍷",
  "🚬",
  "📵",
  "🎮",
  "🍕",
  "💸",
  "😤",
  "🕹️",
  "🃏",
  "🛒",
];

export const ACCENT_COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#f472b6", // pink
  "#fbbf24", // amber
  "#a78bfa", // violet
  "#f87171", // red
  "#2dd4bf", // teal
  "#fb923c", // orange
  "#a3e635", // lime
  "#e879f9", // fuchsia
];

/**
 * Hábito principal y obligatorio de la app: estar libre de weed.
 * Es fijo para todos los usuarios; de él dependen el contador de
 * "Días de libertad" y el color verde/rojo del calendario.
 */
export const MAIN_HABIT: HabitItem = {
  id: "freeWeed",
  label: "Free of weed",
  description: "Hábito principal: un día sin fumar.",
  emoji: "🌿",
  color: "#34d399",
  fixed: true,
};

export const DEFAULT_HABITS: HabitItem[] = [
  MAIN_HABIT,
  { id: "seaSaltWater", label: "Agua con sal de mar", description: "Hidratación y minerales", emoji: "💧", color: "#60a5fa" },
  { id: "nac", label: "NAC (600 mg)", description: "Apoyo antioxidante", emoji: "💊", color: "#a78bfa" },
  { id: "grounding", label: "Grounding / Luz solar", description: "Recarga en el parque", emoji: "☀️", color: "#fbbf24" },
];

/**
 * Asegura que el hábito principal "Free of weed" siempre esté presente
 * (y en primer lugar) dentro de la lista de hábitos del usuario.
 */
export function withMainHabit(
  habits: HabitItem[] | undefined | null
): HabitItem[] {
  const rest = (habits ?? []).filter((h) => h.id !== MAIN_HABIT.id);
  return [MAIN_HABIT, ...rest];
}


export const DEFAULT_AVOIDS: HabitItem[] = [
  { id: "smoking", label: "Fumar", description: "Cigarrillos o vapeo", emoji: "🚭", color: "#f87171" },
  { id: "drinking", label: "Tomar alcohol", description: "Cerveza, vino, licores", emoji: "🍺", color: "#fb923c" },
  { id: "porn", label: "Pornografía", description: "Evitar contenido explícito", emoji: "📵", color: "#e879f9" },
];

export const CRAVING_LABELS = [
  "Muy bajo",
  "Bajo",
  "Moderado",
  "Alto",
  "Intenso",
];

export const MOOD_EMOJIS = [
  "😞",
  "😕",
  "😐",
  "🙂",
  "😊",
  "😄",
  "😌",
  "🤩",
  "🥰",
  "🤯",
];
