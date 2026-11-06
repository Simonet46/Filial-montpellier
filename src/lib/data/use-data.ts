"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useDataVersion } from "../store";

/**
 * Carga datos en el navegador y los vuelve a pedir cuando cambia algo
 * (cada mutación llama a notifyChange). Mientras recarga muestra los datos anteriores.
 */
export function useData<T>(load: () => Promise<T>, deps: readonly (string | number | boolean | null | undefined)[] = []) {
  const version = useDataVersion();
  const depsKey = JSON.stringify(deps);
  const requestKey = `${version}|${depsKey}`;
  const [state, setState] = useState<{ depsKey: string; data?: T; error?: string } | null>(null);
  const run = useEffectEvent(load);

  useEffect(() => {
    let active = true;
    const key = depsKey;
    run().then(
      (data) => {
        if (active) setState({ depsKey: key, data });
      },
      (err: unknown) => {
        if (active) setState({ depsKey: key, error: err instanceof Error ? err.message : String(err) });
      },
    );
    return () => {
      active = false;
    };
    // requestKey incluye la versión de datos: recarga después de cada mutación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const ready = !!state && state.depsKey === depsKey && !state.error;
  return {
    data: ready ? (state.data as T) : undefined,
    ready,
    error: state && state.depsKey === depsKey ? (state.error ?? null) : null,
  };
}
