import Link from "next/link";
import { Star } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/es";
import type { Locale, PlayerStatus, PlayerSummary } from "@/lib/types";
import { cn, countryName } from "@/lib/utils";
import { EU_COUNTRIES } from "@/lib/constants";
import { Badge } from "./ui";
import { Avatar, RatingHex } from "./visuals";

export function statusTone(status: PlayerStatus) {
  return (
    {
      active: "blue",
      followup: "celeste",
      invited: "sol",
      trial: "orange",
      signed: "green",
      inactive: "neutral",
    } as const
  )[status];
}

export function PassportChips({
  passports,
  locale,
  t,
}: {
  passports: string[];
  locale: Locale;
  t: Dictionary;
}) {
  const eu = passports.some((p) => EU_COUNTRIES.has(p));
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {passports.map((p) => (
        <Badge key={p} tone={EU_COUNTRIES.has(p) ? "blue" : "neutral"} title={countryName(p, locale)}>
          {p}
        </Badge>
      ))}
      {eu && <Badge tone="sol">{t.players.euPassport}</Badge>}
    </div>
  );
}

export function PlayerCard({
  player,
  t,
  locale,
  selectable,
  selected,
  onSelect,
}: {
  player: PlayerSummary;
  t: Dictionary;
  locale: Locale;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const p = player;
  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-0.5 hover:border-mhb-blue-light/50 hover:shadow-[0_10px_40px_-12px_rgb(27_77_255/0.5)]",
        selected && "border-mhb-orange/70 shadow-[0_0_0_1px_var(--color-mhb-orange)]",
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mhb-blue/20 blur-2xl transition group-hover:bg-mhb-orange/20" />
      <Link href={`/players/${p.id}`} className="relative block p-4">
        <div className="flex items-start gap-3">
          <Avatar first={p.first_name} last={p.last_name} url={p.photo_url} />
          <div className="min-w-0 flex-1">
            <p className="label truncate">{p.club}</p>
            <h3 className="truncate font-display text-2xl font-bold uppercase italic leading-tight">
              {p.first_name} <span className="text-gradient-blue">{p.last_name}</span>
            </h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge tone="orange">{t.positionsShort[p.position]}</Badge>
              <Badge tone={p.dominant_hand === "left" ? "sol" : "neutral"}>{t.hand[p.dominant_hand]}</Badge>
              {p.national_team === "national" && <Badge tone="celeste">★ ARG</Badge>}
            </div>
          </div>
          <RatingHex overall={p.overall} label={t.players.overallShort} />
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            [t.players.fields.height.split(" ")[0], p.height_cm ? `${p.height_cm}` : "—", "cm"],
            [t.players.age, `${p.age}`, t.common.years],
            [t.players.fields.weight.split(" ")[0], p.weight_kg ? `${p.weight_kg}` : "—", "kg"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-lg border border-line bg-ink/40 py-2">
              <dt className="label !text-[0.55rem]">{label}</dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {value}
                <span className="ml-0.5 text-xs font-medium text-muted">{unit}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex items-center justify-between gap-2">
          <PassportChips passports={p.passports} locale={locale} t={t} />
          <Badge tone={statusTone(p.status)}>{t.playerStatus[p.status]}</Badge>
        </div>
      </Link>

      <div className="relative flex items-center justify-between border-t border-line px-4 py-2 text-xs text-muted">
        <span className="font-mono uppercase tracking-wider">
          {p.video_count} {t.players.videosCount}
        </span>
        <div className="flex items-center gap-3">
          {p.favorite && <Star className="h-4 w-4 fill-sol text-sol" aria-label={t.players.favorite} />}
          {selectable && (
            <label className="flex cursor-pointer items-center gap-1.5 font-mono uppercase tracking-wider hover:text-text">
              <input
                type="checkbox"
                checked={selected}
                onChange={onSelect}
                className="h-3.5 w-3.5 accent-[var(--color-mhb-orange)]"
              />
              {t.nav.compare}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
