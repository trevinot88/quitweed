"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEY } from "@/lib/constants";
import { todayKey } from "@/lib/date";
import type { AppData, MorningLog, NightLog, Profile } from "@/lib/types";

interface AppContextValue {
  /** true cuando los datos ya fueron cargados del localStorage */
  ready: boolean;
  data: AppData | null;
  setProfile: (profile: Profile) => void;
  saveMorning: (log: MorningLog) => void;
  saveNight: (log: NightLog) => void;
  importData: (data: AppData) => void;
  resetAll: () => void;
}

const DEFAULT_DATA: AppData = {
  profile: null,
  records: {},
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { value: data, ready, set: setData } = useLocalStorage<AppData>(
    STORAGE_KEY,
    DEFAULT_DATA
  );

  const setProfile = useCallback(
    (profile: Profile) => {
      setData((prev) => ({ ...prev, profile }));
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
      setData({
        profile: incoming.profile,
        records: incoming.records ?? {},
      });
    },
    [setData]
  );

  const resetAll = useCallback(() => {
    setData(DEFAULT_DATA);
  }, [setData]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      data,
      setProfile,
      saveMorning,
      saveNight,
      importData,
      resetAll,
    }),
    [ready, data, setProfile, saveMorning, saveNight, importData, resetAll]
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
