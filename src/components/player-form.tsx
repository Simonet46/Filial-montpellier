"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { savePlayer } from "@/lib/actions/players";
import {
  HANDS,
  NATIONAL_TEAMS,
  PASSPORT_OPTIONS,
  PLAYER_STATUSES,
  POSITIONS,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/es";
import { createClient } from "@/lib/supabase/client";
import type { Locale, NationalTeam, Player, PlayerContact } from "@/lib/types";
import { cn, countryName, uid } from "@/lib/utils";
import { FormMessage, FormSection, SubmitButton } from "./form-bits";
import { FormField, LinkButton } from "./ui";
import { Avatar } from "./visuals";

export function PlayerForm({
  t,
  locale,
  player,
  contact,
  photoUrl,
  isDemo,
}: {
  t: Dictionary;
  locale: Locale;
  player?: Player | null;
  contact?: PlayerContact | null;
  photoUrl?: string | null;
  isDemo: boolean;
}) {
  const [state, action] = useActionState(savePlayer, null);
  const [passports, setPassports] = useState<string[]>(player?.passports ?? ["AR"]);
  const [nationalTeam, setNationalTeam] = useState<NationalTeam>(player?.national_team ?? "none");
  const [photoPath, setPhotoPath] = useState(player?.photo_path ?? "");
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const f = t.players.fields;

  const options = Array.from(new Set([...PASSPORT_OPTIONS, ...passports]));
  const togglePassport = (code: string) =>
    setPassports((cur) => (cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]));

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid()}.${ext}`;
      const { error } = await createClient().storage.from(STORAGE_BUCKETS.photos).upload(path, file, {
        contentType: file.type,
      });
      if (error) throw error;
      setPhotoPath(path);
      setPreview(URL.createObjectURL(file));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="space-y-6">
      {player && <input type="hidden" name="id" value={player.id} />}
      <input type="hidden" name="photo_path" value={photoPath} />

      <FormSection title={t.players.sections.identity}>
        <div className="flex items-center gap-4 md:col-span-2">
          <Avatar first={player?.first_name ?? "?"} last={player?.last_name ?? ""} url={preview} size="lg" />
          {isDemo ? (
            <p className="text-sm text-muted">{t.players.photoDemo}</p>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-4 py-3 text-sm text-muted transition hover:border-mhb-blue-light hover:text-text">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {f.photo}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          )}
          {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}
        </div>
        <FormField label={`${f.firstName} *`} htmlFor="first_name">
          <input id="first_name" name="first_name" required defaultValue={player?.first_name} className="field" />
        </FormField>
        <FormField label={`${f.lastName} *`} htmlFor="last_name">
          <input id="last_name" name="last_name" required defaultValue={player?.last_name} className="field" />
        </FormField>
        <FormField label={`${f.birthDate} *`} htmlFor="birth_date">
          <input id="birth_date" name="birth_date" type="date" required defaultValue={player?.birth_date} className="field" />
        </FormField>
        <FormField label={f.nationality} htmlFor="nationality">
          <select id="nationality" name="nationality" defaultValue={player?.nationality ?? "AR"} className="field">
            {options.map((c) => (
              <option key={c} value={c}>
                {countryName(c, locale)}
              </option>
            ))}
          </select>
        </FormField>
        <div className="md:col-span-2">
          <p className="label mb-2">{f.passports}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((code) => (
              <label
                key={code}
                className={cn(
                  "cursor-pointer rounded-md border px-2.5 py-1 text-sm transition",
                  passports.includes(code)
                    ? "border-mhb-blue-light bg-mhb-blue/25 text-text"
                    : "border-line text-muted hover:text-text",
                )}
              >
                <input
                  type="checkbox"
                  name="passports"
                  value={code}
                  checked={passports.includes(code)}
                  onChange={() => togglePassport(code)}
                  className="sr-only"
                />
                <span className="font-mono text-xs">{code}</span> {countryName(code, locale)}
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title={t.players.sections.physical}>
        <FormField label={f.height} htmlFor="height_cm">
          <input id="height_cm" name="height_cm" type="number" step="0.5" min={100} max={250} defaultValue={player?.height_cm ?? ""} className="field" />
        </FormField>
        <FormField label={f.weight} htmlFor="weight_kg">
          <input id="weight_kg" name="weight_kg" type="number" step="0.5" min={30} max={200} defaultValue={player?.weight_kg ?? ""} className="field" />
        </FormField>
        <FormField label={f.wingspan} htmlFor="wingspan_cm">
          <input id="wingspan_cm" name="wingspan_cm" type="number" step="0.5" min={100} max={260} defaultValue={player?.wingspan_cm ?? ""} className="field" />
        </FormField>
        <FormField label={f.hand} htmlFor="dominant_hand">
          <select id="dominant_hand" name="dominant_hand" defaultValue={player?.dominant_hand ?? "right"} className="field">
            {HANDS.map((h) => (
              <option key={h} value={h}>{t.hand[h]}</option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title={t.players.sections.game}>
        <FormField label={`${f.position} *`} htmlFor="position">
          <select id="position" name="position" required defaultValue={player?.position ?? ""} className="field">
            <option value="" disabled>—</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{t.positions[p]}</option>
            ))}
          </select>
        </FormField>
        <FormField label={f.secondaryPosition} htmlFor="secondary_position">
          <select id="secondary_position" name="secondary_position" defaultValue={player?.secondary_position ?? ""} className="field">
            <option value="">{t.common.none}</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{t.positions[p]}</option>
            ))}
          </select>
        </FormField>
        <FormField label={f.status} htmlFor="status">
          <select id="status" name="status" defaultValue={player?.status ?? "active"} className="field">
            {PLAYER_STATUSES.map((s) => (
              <option key={s} value={s}>{t.playerStatus[s]}</option>
            ))}
          </select>
        </FormField>
        <FormField label={f.joinedAt} htmlFor="joined_at">
          <input id="joined_at" name="joined_at" type="date" defaultValue={player?.joined_at ?? ""} className="field" />
        </FormField>
      </FormSection>

      <FormSection title={t.players.sections.club}>
        <FormField label={`${f.club} *`} htmlFor="club">
          <input id="club" name="club" required defaultValue={player?.club} className="field" />
        </FormField>
        <FormField label={f.city} htmlFor="city">
          <input id="city" name="city" defaultValue={player?.city ?? ""} className="field" />
        </FormField>
        <FormField label={f.nationalTeam} htmlFor="national_team">
          <select
            id="national_team"
            name="national_team"
            value={nationalTeam}
            onChange={(e) => setNationalTeam(e.target.value as NationalTeam)}
            className="field"
          >
            {NATIONAL_TEAMS.map((n) => (
              <option key={n} value={n}>{t.nationalTeam[n]}</option>
            ))}
          </select>
        </FormField>
        {nationalTeam !== "none" && (
          <FormField label={f.nationalTeamDetail} htmlFor="national_team_detail">
            <input
              id="national_team_detail"
              name="national_team_detail"
              defaultValue={player?.national_team_detail ?? ""}
              placeholder={f.nationalTeamDetailPh}
              className="field"
            />
          </FormField>
        )}
      </FormSection>

      <FormSection title={t.players.sections.scouting}>
        <FormField label={f.scoutingNotes} htmlFor="scouting_notes" className="md:col-span-2">
          <textarea
            id="scouting_notes"
            name="scouting_notes"
            rows={4}
            defaultValue={player?.scouting_notes ?? ""}
            placeholder={f.scoutingNotesPh}
            className="field"
          />
        </FormField>
      </FormSection>

      <FormSection title={t.players.sections.contact}>
        <p className="text-xs text-muted md:col-span-2">{t.players.contactPrivate}</p>
        <FormField label={f.email} htmlFor="contact_email">
          <input id="contact_email" name="contact_email" type="email" defaultValue={contact?.email ?? ""} className="field" />
        </FormField>
        <FormField label={f.phone} htmlFor="contact_phone">
          <input id="contact_phone" name="contact_phone" type="tel" defaultValue={contact?.phone ?? ""} className="field" />
        </FormField>
        <FormField label={f.guardianName} htmlFor="guardian_name">
          <input id="guardian_name" name="guardian_name" defaultValue={contact?.guardian_name ?? ""} className="field" />
        </FormField>
        <FormField label={f.guardianPhone} htmlFor="guardian_phone">
          <input id="guardian_phone" name="guardian_phone" type="tel" defaultValue={contact?.guardian_phone ?? ""} className="field" />
        </FormField>
      </FormSection>

      <FormMessage state={state} />
      <div className="flex flex-wrap justify-end gap-2">
        <LinkButton href={player ? `/players/${player.id}` : "/players"} variant="ghost">
          {t.common.cancel}
        </LinkButton>
        <SubmitButton pendingLabel={t.common.saving} disabled={uploading}>
          {t.common.save}
        </SubmitButton>
      </div>
    </form>
  );
}
