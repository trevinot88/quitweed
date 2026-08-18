"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  DEFAULT_AVOIDS,
  DEFAULT_HABITS,
  STORAGE_KEY,
  withMainHabit,
} from "@/lib/constants";
import { todayKey } from "@/lib/date";
import type {
  AppData,
  HabitItem,
  MorningLog,
  NightLog,
  Profile,
} from "@/lib/types";

interface AppContextValue {
  /** true cuando los datos ya fueron cargados del localStorage */
  ready: boolean;
  data: AppData | null;
  setProfile: (profile: Profile) => void;
  saveHabits: (habits: HabitItem[]) => void;
  saveAvoids: (avoids: HabitItem[]) => void;
  saveMorning: (log: MorningLog) => void;
  saveNight: (log: NightLog) => void;
  importData: (data: AppData) => void;
  resetAll: () => void;
  /** Reinicia el progreso: contador a hoy y registros vacíos. Conserva perfil, hábitos y evitaciones. */
  resetProgress: () => void;
}


const DEFAULT_DATA: AppData = {
  profile: null,
  records: {},
};

const AppContext = createContext<AppContextValue | null>(null);

/**
 * Normaliza los datos cargados para ser compatibles con la versión actual.
 * Perfiles v1 (sin hábitos/evitaciones personalizados) reciben los valores por defecto.
 */
function normalizeData(data: AppData | null | undefined): AppData {
  if (!data || typeof data !== "object") return DEFAULT_DATA;
  const profile = data.profile
    ? {
        ...data.profile,
        // El hábito principal "Free of weed" siempre presente (fijo)
        habits: withMainHabit(
          Array.isArray(data.profile.habits)
            ? data.profile.habits
            : DEFAULT_HABITS
        ),
        avoids: Array.isArray(data.profile.avoids)
          ? data.profile.avoids
          : DEFAULT_AVOIDS,
      }
    : null;
  return {
    profile,
    records: data.records ?? {},
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { value: rawData, ready, set: setData } = useLocalStorage<AppData>(
    STORAGE_KEY,
    DEFAULT_DATA
  );

  // Los datos siempre normalizados (habits/avoids siempre presentes)
  const data = useMemo(() => normalizeData(rawData), [rawData]);


  const setProfile = useCallback(
    (profile: Profile) => {
      setData((prev) => ({ ...prev, profile }));
    },
    [setData]
  );

  const saveHabits = useCallback(
    (habits: HabitItem[]) => {
      setData((prev) => {
        if (!prev.profile) return prev;
        // El hábito principal "Free of weed" no puede eliminarse desde Ajustes
        return {
          ...prev,
          profile: { ...prev.profile, habits: withMainHabit(habits) },
        };
      });
    },
    [setData]
  );

  const saveAvoids = useCallback(
    (avoids: HabitItem[]) => {
      setData((prev) => {
        if (!prev.profile) return prev;
        return { ...prev, profile: { ...prev.profile, avoids } };
      });
    },
    [setData]
  );

  const saveMorning = useCallback(
    (log: MorningLog) => {
      setData((prev) => {
        const existing = prev.records[log.date] ?? { date: log.date };
        return {
          ...prev,
          records: {
            ...prev.records,
            [log.date]: { ...existing, morning: log },
          },
        };
      });
    },
    [setData]
  );

  const saveNight = useCallback(
    (log: NightLog) => {
      setData((prev) => {
        const existing = prev.records[log.date] ?? { date: log.date };
        return {
          ...prev,
          records: {
            ...prev.records,
            [log.date]: { ...existing, night: log },
          },
        };
      });
    },
    [setData]
  );

  const importData = useCallback(
    (incoming: AppData) => {
      // Compatibilidad: perfiles v1 sin hábitos/evitaciones personalizados
      const profile = incoming.profile
        ? {
            ...incoming.profile,
            habits: withMainHabit(
              incoming.profile.habits ?? DEFAULT_HABITS
            ),
            avoids: incoming.profile.avoids ?? DEFAULT_AVOIDS,
          }
        : null;
      setData({
        profile,
        records: incoming.records ?? {},
      });
    },
    [setData]
  );

  const resetAll = useCallback(() => {
    setData(DEFAULT_DATA);
  }, [setData]);

  const resetProgress = useCallback(() => {
    setData((prev) => {
      if (!prev.profile) return prev;
      // Reinicia el progreso de cero: borra el historial (registros diarios),
      // pone el contador de "Días de libertad" en 0 y reinicia la fecha de
      // inicio a hoy. Conserva perfil, hábitos y evitaciones configurados.
      return {
        ...prev,
        profile: {
          ...prev.profile,
          sobrietyStartDate: todayKey(),
        },
        records: {},
      };
    });
  }, [setData]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      data,
      setProfile,
      saveHabits,
      saveAvoids,
      saveMorning,
      saveNight,
      importData,
      resetAll,
      resetProgress,
    }),
    [
      ready,
      data,
      setProfile,
      saveHabits,
      saveAvoids,
      saveMorning,
      saveNight,
      importData,
      resetAll,
      resetProgress,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp debe usarse dentro de <AppProvider>");
  }
  return ctx;
}

/** Fecha de hoy como clave yyyy-mm-dd (helper de conveniencia) */
export function useTodayKey(): string {
  return todayKey();
}
