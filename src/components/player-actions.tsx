"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plane, Star, Trash2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/es";
import { createEvaluation, createTrial, deleteEvaluation, deletePlayer, toggleFavorite } from "@/lib/mutations";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { RATING_KEYS, type ActionState, type Ratings, type TrainingSession } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";
import { FormMessage, SubmitButton } from "./form-bits";
import { Button, FormField } from "./ui";

export function FavoriteButton({ playerId, initial, t }: { playerId: string; initial: boolean; t: Dictionary }) {
  const user = useUser();
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOn(!on);
          const res = await toggleFavorite(user, t, playerId, !on);
          if (res?.error) setOn(on);
        })
      }
      className={cn(on && "border-sol/60 bg-sol/10 text-sol hover:bg-sol/20")}
    >
      <Star className={cn("h-4 w-4", on && "fill-sol")} />
      {on ? t.players.removeFavorite : t.players.addFavorite}
    </Button>
  );
}

export function DeletePlayerButton({ playerId, t }: { playerId: string; t: Dictionary }) {
  const user = useUser();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (confirm(t.common.confirmDelete))
          start(async () => {
            const res = await deletePlayer(user, t, playerId);
            if (res?.ok) router.push(routes.players);
          });
      }}
    >
      <Trash2 className="h-4 w-4" /> {t.common.delete}
    </Button>
  );
}

/** Panel desplegable con un formulario; se cierra solo al guardar con éxito. */
function useCloseOnSuccess(state: ActionState) {
  const ref = useRef<HTMLDetailsElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      ref.current?.removeAttribute("open");
      formRef.current?.reset();
    }
  }, [state]);
  return { ref, formRef };
}

export function TrialRequest({ playerId, t }: { playerId: string; t: Dictionary }) {
  const user = useUser();
  const [state, action] = useActionState(
    (_prev: ActionState, form: FormData) => createTrial(user, t, form),
    null,
  );
  const { ref, formRef } = useCloseOnSuccess(state);
  return (
    <details ref={ref} className="group relative">
      <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-lg bg-gradient-to-r from-mhb-orange to-mhb-orange-light px-4 font-display text-lg font-bold uppercase tracking-wider text-white shadow-[0_0_24px_-6px_var(--color-mhb-orange)] hover:brightness-110">
        <Plane className="h-4 w-4" /> {t.players.inviteTrial}
      </summary>
      <form
        ref={formRef}
        action={action}
        className="glass hud absolute left-0 z-20 mt-2 w-[min(92vw,22rem)] space-y-3 rounded-2xl bg-night p-4 shadow-2xl sm:left-auto sm:right-0"
      >
        <input type="hidden" name="player_id" value={playerId} />
        <FormField label={t.trials.proposedDate} htmlFor="proposed_date">
          <input id="proposed_date" name="proposed_date" type="date" min={todayISO()} className="field" />
        </FormField>
        <FormField label={t.trials.notes} htmlFor="trial_notes">
          <textarea id="trial_notes" name="notes" rows={3} placeholder={t.trials.notesPh} className="field" />
        </FormField>
        <FormMessage state={state} />
        <div className="flex justify-end">
          <SubmitButton pendingLabel={t.common.saving}>{t.trials.send}</SubmitButton>
        </div>
      </form>
    </details>
  );
}

export function EvaluationForm({
  playerId,
  sessions,
  defaults,
  t,
}: {
  playerId: string;
  sessions: TrainingSession[];
  defaults: Ratings | null;
  t: Dictionary;
}) {
  const user = useUser();
  const [state, action] = useActionState(
    (_prev: ActionState, form: FormData) => createEvaluation(user, t, form),
    null,
  );
  const { ref, formRef } = useCloseOnSuccess(state);
  const initial = Object.fromEntries(
    RATING_KEYS.map((k) => [k, defaults ? Math.round(defaults[k]) : 6]),
  ) as Ratings;
  const [values, setValues] = useState<Ratings>(initial);
  const e = t.evaluation;

  return (
    <details ref={ref} className="glass rounded-2xl">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-display text-xl font-bold uppercase tracking-wide text-mhb-orange-light">
        + {e.new}
        <span className="label">{e.scale}</span>
      </summary>
      <form ref={formRef} action={action} className="space-y-5 border-t border-line p-5">
        <input type="hidden" name="player_id" value={playerId} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={e.date} htmlFor="ev_date">
            <input id="ev_date" name="date" type="date" defaultValue={todayISO()} className="field" />
          </FormField>
          <FormField label={e.session} htmlFor="ev_session">
            <select id="ev_session" name="session_id" className="field" defaultValue={sessions[0]?.id ?? ""}>
              <option value="">{e.noSession}</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          {RATING_KEYS.map((k) => (
            <div key={k}>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor={`ev_${k}`} className="label">{t.ratings[k]}</label>
                <span className="font-display text-2xl font-bold tabular-nums text-text">{values[k]}</span>
              </div>
              <input
                id={`ev_${k}`}
                name={k}
                type="range"
                min={1}
                max={10}
                value={values[k]}
                onChange={(ev) => setValues((v) => ({ ...v, [k]: Number(ev.target.value) }))}
                className="slider w-full"
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label={e.sprint} htmlFor="ev_sprint">
            <input id="ev_sprint" name="sprint_20m_s" type="number" step="0.01" min={2} max={6} className="field" />
          </FormField>
          <FormField label={e.jump} htmlFor="ev_jump">
            <input id="ev_jump" name="vertical_jump_cm" type="number" step="0.5" min={10} max={100} className="field" />
          </FormField>
          <FormField label={e.throw} htmlFor="ev_throw">
            <input id="ev_throw" name="throw_speed_kmh" type="number" step="0.5" min={30} max={150} className="field" />
          </FormField>
        </div>
        <FormField label={e.comment} htmlFor="ev_comment">
          <textarea id="ev_comment" name="comment" rows={3} placeholder={e.commentPh} className="field" />
        </FormField>
        <FormMessage state={state} />
        <div className="flex justify-end">
          <SubmitButton pendingLabel={t.common.saving}>{t.common.save}</SubmitButton>
        </div>
      </form>
    </details>
  );
}

export function DeleteEvaluationButton({ id, t }: { id: string; t: Dictionary }) {
  const user = useUser();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title={t.common.delete}
      onClick={() => {
        if (confirm(t.common.confirmDelete))
          start(async () => {
            await deleteEvaluation(user, t, id);
          });
      }}
      className="rounded p-1 text-muted hover:bg-red-500/10 hover:text-red-300"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
