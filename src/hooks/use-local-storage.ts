"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Caché de snapshots: guarda el valor parseado junto con su raw string.
 * Permite que `getSnapshot` devuelva la MISMA referencia mientras
 * localStorage no cambie (requisito de useSyncExternalStore).
 */
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

/** Listeners registrados por clave (para notificar escrituras propias). */
const keyListeners = new Map<string, Set<() => void>>();

function readSnapshot<T>(key: string, initialValue: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    /* localStorage no disponible */
  }
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  let value: T = initialValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      /* JSON corrupto: usar valor inicial */
    }
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

function emit(key: string) {
  keyListeners.get(key)?.forEach((listener) => listener());
}

/**
 * Hook de persistencia con localStorage a prueba de hidratación.
 * - Usa `useSyncExternalStore`: sin errores de hidratación en Next.js.
 * - Se sincroniza entre pestañas vía el evento `storage`.
 * - Devuelve `ready` para mostrar una pantalla de carga en el primer render.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [ready, setReady] = useState(false);

  const value = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        // Suscriptores de esta instancia
        if (!keyListeners.has(key)) keyListeners.set(key, new Set());
        keyListeners.get(key)!.add(onStoreChange);

        // Sincronización entre pestañas / cambios externos
        const onStorage = (e: StorageEvent) => {
          if (e.key === key || e.key === null) onStoreChange();
        };
        window.addEventListener("storage", onStorage);

        return () => {
          keyListeners.get(key)?.delete(onStoreChange);
          window.removeEventListener("storage", onStorage);
        };
      },
      [key]
    ),
    () => readSnapshot(key, initialValue),
    () => initialValue
  );

  // `ready` se activa tras el primer render del cliente (callback asíncrono),
  // evitando mostrar el onboarding durante la hidratación.
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readSnapshot(key, initialValue);
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      const raw = JSON.stringify(resolved);
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        /* localStorage lleno o no disponible */
      }
      snapshotCache.set(key, { raw, value: resolved });
      emit(key);
    },
    [key, initialValue]
  );

  return { value, ready, set };
}
