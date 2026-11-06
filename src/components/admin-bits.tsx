"use client";

import { useActionState, useState, useTransition } from "react";
import { ROLES, TRIAL_STATUSES } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/es";
import { inviteUser, updateTrialStatus, updateUserRole } from "@/lib/mutations";
import { useUser } from "@/lib/session";
import type { ActionState, Role, TrialStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FormMessage, SubmitButton } from "./form-bits";
import { FormField } from "./ui";

export function TrialStatusMenu({ id, status, t }: { id: string; status: TrialStatus; t: Dictionary }) {
  const user = useUser();
  const [pending, start] = useTransition();
  return (
    <div className={cn("flex flex-wrap gap-1", pending && "opacity-50")}>
      {TRIAL_STATUSES.filter((s) => s !== status).map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await updateTrialStatus(user, t, id, s);
            })
          }
          className="rounded-md border border-line px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted transition hover:border-mhb-blue-light hover:text-text"
        >
          → {t.trials.status[s]}
        </button>
      ))}
    </div>
  );
}

export function RoleSelect({ id, role, t, disabled }: { id: string; role: Role; t: Dictionary; disabled?: boolean }) {
  const user = useUser();
  const [value, setValue] = useState(role);
  const [pending, start] = useTransition();
  return (
    <select
      value={value}
      disabled={disabled || pending}
      onChange={(e) => {
        const next = e.target.value as Role;
        setValue(next);
        start(async () => {
          const res = await updateUserRole(user, t, id, next);
          if (res?.error) setValue(role);
        });
      }}
      className={cn("field !w-auto !py-1.5 text-sm", value === "pending" && "!border-sol/50 text-sol")}
      aria-label={t.users.role}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{t.roles[r]}</option>
      ))}
    </select>
  );
}

export function InviteForm({ t, enabled }: { t: Dictionary; enabled: boolean }) {
  const user = useUser();
  const [state, action] = useActionState(
    (_prev: ActionState, form: FormData) => inviteUser(user, t, form),
    null,
  );
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-muted">{enabled ? t.users.inviteHelp : t.users.inviteUnavailable}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={`${t.users.email} *`} htmlFor="inv_email">
          <input id="inv_email" name="email" type="email" required disabled={!enabled} className="field" />
        </FormField>
        <FormField label={t.users.name} htmlFor="inv_name">
          <input id="inv_name" name="full_name" disabled={!enabled} className="field" />
        </FormField>
        <FormField label={t.users.organization} htmlFor="inv_org">
          <input id="inv_org" name="organization" disabled={!enabled} placeholder="Montpellier Handball" className="field" />
        </FormField>
        <FormField label={t.users.role} htmlFor="inv_role">
          <select id="inv_role" name="role" defaultValue="club" disabled={!enabled} className="field">
            {ROLES.filter((r) => r !== "pending").map((r) => (
              <option key={r} value={r}>{t.roles[r]}</option>
            ))}
          </select>
        </FormField>
      </div>
      <FormMessage state={state} success={t.users.inviteSent} />
      <div className="flex justify-end">
        <SubmitButton pendingLabel={t.common.saving} disabled={!enabled}>{t.users.invite}</SubmitButton>
      </div>
    </form>
  );
}
