"use client";

import { useActionState, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link2, Loader2, Upload } from "lucide-react";
import { STORAGE_BUCKETS, VIDEO_KINDS } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/es";
import { createVideo } from "@/lib/mutations";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/client";
import type { ActionState, VideoKind } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { FormMessage, FormSection, SubmitButton } from "./form-bits";
import { FormField, LinkButton } from "./ui";

type Option = { id: string; label: string };

export function VideoForm({
  t,
  players,
  sessions,
  defaultPlayer,
  defaultSession,
  isDemo,
}: {
  t: Dictionary;
  players: Option[];
  sessions: Option[];
  defaultPlayer?: string;
  defaultSession?: string;
  isDemo: boolean;
}) {
  const user = useUser();
  const router = useRouter();
  const [state, action] = useActionState(async (_prev: ActionState, form: FormData) => {
    const res = await createVideo(user, t, form);
    if (res?.ok) {
      const player = String(form.get("player_id") ?? "");
      const session = String(form.get("session_id") ?? "");
      router.push(player ? routes.player(player) : session ? routes.training(session) : routes.videos);
    }
    return res;
  }, null);
  const [mode, setMode] = useState<"upload" | "link">(isDemo ? "link" : "upload");
  const [storagePath, setStoragePath] = useState("");
  const [progress, setProgress] = useState<"idle" | "uploading" | "done">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const f = t.videos.fields;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setProgress("uploading");
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${new Date().toISOString().slice(0, 7)}/${uid()}.${ext}`;
      const { error } = await getSupabase()
        .storage.from(STORAGE_BUCKETS.videos)
        .upload(path, file, { contentType: file.type, cacheControl: "3600" });
      if (error) throw error;
      setStoragePath(path);
      setProgress("done");
    } catch (e) {
      setProgress("idle");
      setUploadError(e instanceof Error ? e.message : t.common.error);
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="storage_path" value={mode === "upload" ? storagePath : ""} />

      <FormSection title={t.videos.newTitle}>
        <FormField label={`${f.title} *`} htmlFor="title" className="md:col-span-2">
          <input id="title" name="title" required placeholder={f.titlePh} className="field" />
        </FormField>
        <FormField label={f.kind} htmlFor="kind">
          <select id="kind" name="kind" defaultValue={defaultPlayer ? "highlight" : "training"} className="field">
            {VIDEO_KINDS.map((k: VideoKind) => (
              <option key={k} value={k}>{t.videos.kind[k]}</option>
            ))}
          </select>
        </FormField>
        <FormField label={f.player} htmlFor="player_id">
          <select id="player_id" name="player_id" defaultValue={defaultPlayer ?? ""} className="field">
            <option value="">{t.videos.noPlayer}</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label={f.session} htmlFor="session_id">
          <select id="session_id" name="session_id" defaultValue={defaultSession ?? ""} className="field">
            <option value="">{t.evaluation.noSession}</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label={f.description} htmlFor="description" className="md:col-span-2">
          <textarea id="description" name="description" rows={3} className="field" />
        </FormField>
      </FormSection>

      <fieldset className="glass rounded-2xl p-5">
        <legend className="px-2 font-display text-lg font-bold uppercase tracking-wide text-mhb-orange-light">
          {f.sourceMode}
        </legend>
        <div className="mb-4 inline-flex rounded-lg border border-line p-1">
          {(["upload", "link"] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={m === "upload" && isDemo}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-1.5 font-display text-sm font-semibold uppercase tracking-wide transition disabled:opacity-40",
                mode === m ? "bg-mhb-blue text-white" : "text-muted hover:text-text",
              )}
            >
              {m === "upload" ? <Upload className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {m === "upload" ? t.videos.modeUpload : t.videos.modeLink}
            </button>
          ))}
        </div>
        {isDemo && <p className="mb-4 text-sm text-sol">{t.videos.uploadDemo}</p>}

        {mode === "upload" ? (
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
              progress === "done" ? "border-emerald-400/50 bg-emerald-400/5" : "border-line hover:border-mhb-blue-light",
            )}
          >
            {progress === "uploading" ? (
              <Loader2 className="h-8 w-8 animate-spin text-mhb-orange" />
            ) : (
              <Upload className="h-8 w-8 text-mhb-blue-light" />
            )}
            <span className="font-display text-lg font-bold uppercase">
              {progress === "uploading" ? t.videos.uploading : progress === "done" ? "✓" : f.file}
            </span>
            {storagePath && <span className="font-sans text-xs text-muted">{storagePath}</span>}
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        ) : (
          <FormField label={f.url} htmlFor="url">
            <input id="url" name="url" type="url" required placeholder={f.urlPh} className="field" />
          </FormField>
        )}
        {uploadError && <p className="mt-3 text-sm text-red-300">{uploadError}</p>}
      </fieldset>

      <FormMessage state={state} />
      <div className="flex flex-wrap justify-end gap-2">
        <LinkButton href={routes.videos} variant="ghost">
          {t.common.cancel}
        </LinkButton>
        <SubmitButton
          pendingLabel={t.common.saving}
          disabled={mode === "upload" && progress !== "done"}
        >
          {t.common.save}
        </SubmitButton>
      </div>
    </form>
  );
}

export function VideoFilters({
  t,
  players,
}: {
  t: Dictionary;
  players: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${routes.videos}${next.size ? `?${next}` : ""}`);
  };
  return (
    <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row">
      <select value={params.get("kind") ?? ""} onChange={(e) => set("kind", e.target.value)} className="field sm:w-56" aria-label={t.videos.filterKind}>
        <option value="">{t.videos.filterKind}: {t.common.all}</option>
        {VIDEO_KINDS.map((k) => (
          <option key={k} value={k}>{t.videos.kind[k]}</option>
        ))}
      </select>
      <select value={params.get("player") ?? ""} onChange={(e) => set("player", e.target.value)} className="field sm:w-72" aria-label={t.videos.filterPlayer}>
        <option value="">{t.videos.filterPlayer}: {t.common.all}</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
    </div>
  );
}
