"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Si el usuario no tiene permiso para esta vista, lo manda a `fallback`. */
export function useGuard(allowed: boolean, fallback: string) {
  const router = useRouter();
  useEffect(() => {
    if (!allowed) router.replace(fallback);
  }, [allowed, fallback, router]);
  return allowed;
}
