"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/es";
import { routes } from "@/lib/routes";
import { useSession } from "@/lib/session";
import type { ActionState } from "@/lib/types";
import { FormMessage, SubmitButton } from "./form-bits";
import { FormField } from "./ui";

export function LoginForm({ t }: { t: Dictionary }) {
  const { signInWithPassword, sendMagicLink } = useSession();
  const router = useRouter();
  const [state, action] = useActionState(async (_prev: ActionState, form: FormData): Promise<ActionState> => {
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email) return { error: t.common.required };
    if (form.get("intent") === "magic") {
      const error = await sendMagicLink(email);
      return error ? { error } : { ok: true };
    }
    if (!password) return { error: t.common.required };
    const error = await signInWithPassword(email, password);
    if (error) return { error: t.login.invalid };
    router.replace(routes.dashboard);
    return null;
  }, null);

  return (
    <form action={action} className="space-y-4">
      <FormField label={t.login.email} htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </FormField>
      <FormField label={t.login.password} htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" className="field" />
      </FormField>
      <FormMessage state={state} success={t.login.magicSent} />
      <div className="flex flex-col gap-2">
        <SubmitButton pendingLabel={t.common.saving} name="intent" value="password">
          {t.login.submit}
        </SubmitButton>
        <SubmitButton pendingLabel={t.common.saving} variant="secondary" name="intent" value="magic">
          {t.login.magicLink}
        </SubmitButton>
      </div>
    </form>
  );
}
