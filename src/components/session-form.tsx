"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSession, saveSession } from "@/lib/actions/trainings";
import type { Dictionary } from "@/lib/i18n/es";
import type { Player, TrainingSession } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FormMessage, FormSection, SubmitButton } from "./form-bits";
import { Button, FormField, LinkButton } from "./ui";

export function SessionForm({
  t,
  session,
  players,
}: {
  t: Dictionary;
  session?: TrainingSession | null;
  players: Pick<Player, "id" | "first_name" | "last_name" | "position">[];
}) {
  const [state, action] = useActionState(saveSession, null);
  const [attendees, setAttendees] = useState<string[]>(session?.attendee_ids ?? []);
  const f = t.trainings.fields;
  const toggle = (id: string) =>
    setAttendees((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <form action={action} className="space-y-6">
      {session && <input type="hidden" name="id" value={session.id} />}
      <FormSection title={t.trainings.newTitle}>
        <FormField label={`${f.title} *`} htmlFor="title">
          <input id="title" name="title" required defaultValue={session?.title} placeholder={f.titlePh} className="field" />
        </FormField>
        <FormField label={`${f.date} *`} htmlFor="date">
          <input id="date" name="date" type="date" required defaultValue={session?.date} className="field" />
        </FormField>
        <FormField label={`${f.location} *`} htmlFor="location">
          <input id="location" name="location" required defaultValue={session?.location} placeholder={f.locationPh} className="field" />
        </FormField>
        <FormField label={f.coaches} htmlFor="coaches" hint={f.coachesPh}>
          <input id="coaches" name="coaches" defaultValue={session?.coaches.join(", ")} className="field" />
        </FormField>
        <FormField label={f.description} htmlFor="description" className="md:col-span-2">
          <textarea id="description" name="description" rows={4} defaultValue={session?.description ?? ""} placeholder={f.descriptionPh} className="field" />
        </FormField>
      </FormSection>

      <fieldset className="glass rounded-2xl p-5">
        <legend className="px-2 font-display text-lg font-bold uppercase tracking-wide text-mhb-orange-light">
          {f.attendees} · {attendees.length}
        </legend>
        <div className="mb-3 flex gap-3">
          <button type="button" className="label hover:text-text" onClick={() => setAttendees(players.map((p) => p.id))}>
            {t.common.all}
          </button>
          <button type="button" className="label hover:text-text" onClick={() => setAttendees([])}>
            {t.common.none}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                attendees.includes(p.id) ? "border-mhb-blue-light bg-mhb-blue/20" : "border-line text-muted hover:text-text",
              )}
            >
              <input
                type="checkbox"
                name="attendee_ids"
                value={p.id}
                checked={attendees.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="accent-[var(--color-mhb-orange)]"
              />
              <span className="flex-1">
                {p.first_name} {p.last_name}
              </span>
              <span className="font-mono text-xs text-muted">{t.positionsShort[p.position]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormMessage state={state} />
      <div className="flex flex-wrap justify-end gap-2">
        <LinkButton href={session ? `/trainings/${session.id}` : "/trainings"} variant="ghost">
          {t.common.cancel}
        </LinkButton>
        <SubmitButton pendingLabel={t.common.saving}>{t.common.save}</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteSessionButton({ id, t }: { id: string; t: Dictionary }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (confirm(t.common.confirmDelete))
          start(async () => {
            await deleteSession(id);
          });
      }}
    >
      <Trash2 className="h-4 w-4" /> {t.common.delete}
    </Button>
  );
}
