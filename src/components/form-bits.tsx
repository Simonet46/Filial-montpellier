"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/types";
import { buttonClass } from "./ui";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  disabled,
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending || disabled} className={buttonClass(variant)}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state, success }: { state: ActionState; success?: ReactNode }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-300">
        {state.error}
      </p>
    );
  if (state?.ok && success)
    return (
      <p role="status" className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
        {success}
      </p>
    );
  return null;
}

export function FormSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="glass rounded-2xl p-5">
      <legend className="px-2 font-display text-lg font-bold uppercase tracking-wide text-mhb-orange-light">
        {title}
      </legend>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}
