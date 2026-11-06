"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/session";
import type { Dictionary } from "@/lib/i18n/es";
import { FormMessage, SubmitButton } from "./form-bits";
import { FormField } from "./ui";

export function LoginForm({ t }: { t: Dictionary }) {
  const [state, action] = useActionState(signIn, null);
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
