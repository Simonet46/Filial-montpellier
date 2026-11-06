"use client";

import { useSyncExternalStore } from "react";

/* -------- Versión global de datos: cada mutación la incrementa y las vistas recargan -------- */

let version = 0;
const listeners = new Set<() => void>();

export function notifyChange() {
  version += 1;
  for (const l of listeners) l();
}

function subscribeVersion(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDataVersion() {
  return useSyncExternalStore(subscribeVersion, () => version, () => 0);
}

/* -------- Valores persistidos en localStorage, reactivos entre componentes y pestañas -------- */

export function persistedValue<T>(key: string, parse: (raw: string | null) => T) {
  let cachedRaw: string | null | undefined;
  let cached: T;
  const local = new Set<() => void>();

  const read = (): T => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cached = parse(raw);
    }
    return cached;
  };

  const subscribe = (listener: () => void) => {
    local.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      local.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const write = (value: string | null) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* almacenamiento no disponible (modo privado): se ignora */
    }
    for (const l of local) l();
  };

  return { read, subscribe, write };
}
