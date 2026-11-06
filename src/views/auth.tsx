"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "@/components/shell";
import { IS_DEMO } from "@/lib/env";
import { routes } from "@/lib/routes";
import { useSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/client";

/** Destino del enlace mágico (flujo PKCE): supabase-js canjea el ?code= solo al cargar. */
export function AuthCallbackView() {
  const { session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (IS_DEMO) router.replace(routes.login);
    else if (session.status === "authed") router.replace(routes.dashboard);
    else if (session.status === "anon") {
      const timer = setTimeout(() => router.replace(routes.login), 4000);
      return () => clearTimeout(timer);
    }
  }, [session, router]);
  return <FullScreenLoader />;
}

/** Enlaces de invitación / acceso con token_hash (plantillas de correo de Supabase). */
export function AuthConfirmView() {
  const params = useSearchParams();
  const router = useRouter();
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  useEffect(() => {
    if (IS_DEMO || !tokenHash || !type) {
      router.replace(routes.login);
      return;
    }
    getSupabase()
      .auth.verifyOtp({ type, token_hash: tokenHash })
      .then(({ error }) => router.replace(error ? routes.login : routes.dashboard));
  }, [tokenHash, type, router]);
  return <FullScreenLoader />;
}
