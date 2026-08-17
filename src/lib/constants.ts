export const STORAGE_KEY = "sobrio:app-data:v1";

/** Antes de esta hora (local) se muestra el check-in de la mañana */
export const MORNING_HOUR_CUTOFF = 14;

export const SOS_TIMER_SECONDS = 5 * 60;

export interface HabitItem {
  id: "seaSaltWater" | "nac" | "grounding";
  label: string;
  description: string;
}

export const HABIT_ITEMS: HabitItem[] = [
  {
    id: "seaSaltWater",
    label: "Agua con Sal de mar",
    description: "Hidratación y minerales",
  },
  {
    id: "nac",
    label: "NAC (600 mg)",
    description: "Apoyo antioxidante",
  },
  {
    id: "grounding",
    label: "Grounding / Luz solar",
    description: "Recarga en el parque",
  },
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
