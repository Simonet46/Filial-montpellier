import { POSITION_COORDS, POSITIONS } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/es";
import { RATING_KEYS, type Position, type Ratings } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

/* ------------------------------------------------------------------ Logo -- */

export function Logo({ t, compact = false }: { t: Dictionary; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="lg-ball" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-mhb-orange)" />
            <stop offset="1" stopColor="var(--color-sol)" />
          </linearGradient>
        </defs>
        <polygon
          points="24,2 43,13 43,35 24,46 5,35 5,13"
          fill="var(--color-mhb-blue-deep)"
          stroke="var(--color-mhb-blue-light)"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="24" r="11" fill="url(#lg-ball)" />
        <path
          d="M13.5 21c4 2.5 17 2.5 21 0M13.5 27c4-2.5 17-2.5 21 0M24 13c-3 3.5-3 18.5 0 22"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-lg font-extrabold uppercase italic tracking-wide">
            {t.brand.club}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="arg-stripe h-1.5 w-6 rounded-full" />
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.25em] text-celeste">
              {t.brand.filial}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Avatar -- */

export function Avatar({
  first,
  last,
  url,
  size = "md",
}: {
  first: string;
  last: string;
  url: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "h-9 w-9 text-sm",
    md: "h-14 w-14 text-xl",
    lg: "h-20 w-20 text-3xl",
    xl: "h-32 w-32 text-5xl md:h-40 md:w-40 md:text-6xl",
  };
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-mhb-blue via-mhb-blue-deep to-ink p-[2px]",
        sizes[size],
      )}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-night">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL firmada de Storage
          <img src={url} alt={`${first} ${last}`} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display font-extrabold italic text-gradient-blue">
            {initials(first, last)}
          </span>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Rating --- */

export function ratingTone(overall: number | null) {
  if (overall === null) return "text-muted";
  if (overall >= 80) return "text-gradient-orange";
  if (overall >= 70) return "text-mhb-orange-light";
  if (overall >= 60) return "text-mhb-blue-light";
  return "text-muted";
}

export function RatingHex({
  overall,
  label,
  size = "md",
}: {
  overall: number | null;
  label: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-gradient-to-b from-mhb-blue/40 to-mhb-orange/20",
        size === "md" ? "h-16 w-14" : "h-28 w-24",
      )}
      style={{ clipPath: "polygon(50% 0, 100% 22%, 100% 78%, 50% 100%, 0 78%, 0 22%)" }}
    >
      <div
        className="absolute inset-[2px] bg-night"
        style={{ clipPath: "polygon(50% 0, 100% 22%, 100% 78%, 50% 100%, 0 78%, 0 22%)" }}
      />
      <span
        className={cn(
          "relative font-display font-extrabold leading-none tabular-nums",
          size === "md" ? "text-2xl" : "text-5xl",
          ratingTone(overall),
        )}
      >
        {overall ?? "–"}
      </span>
      <span className={cn("label relative", size === "md" ? "!text-[0.5rem]" : "")}>{label}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Radar --- */

export type RadarSeries = { label: string; color: string; values: Ratings };

export function RadarChart({
  series,
  t,
  size = 300,
}: {
  series: RadarSeries[];
  t: Dictionary;
  size?: number;
}) {
  const c = size / 2;
  const r = size / 2 - 46;
  const n = RATING_KEYS.length;
  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (value / 10) * r;
    return [c + rr * Math.cos(angle), c + rr * Math.sin(angle)] as const;
  };
  const poly = (value: (i: number) => number) =>
    RATING_KEYS.map((_, i) => point(i, value(i)).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[340px]" role="img">
      {[2, 4, 6, 8, 10].map((lvl) => (
        <polygon
          key={lvl}
          points={poly(() => lvl)}
          fill={lvl === 10 ? "rgb(27 77 255 / 0.06)" : "none"}
          stroke="rgb(120 150 255 / 0.18)"
          strokeWidth={1}
        />
      ))}
      {RATING_KEYS.map((key, i) => {
        const [x, y] = point(i, 10);
        const [lx, ly] = point(i, 12.6);
        return (
          <g key={key}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="rgb(120 150 255 / 0.18)" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted font-mono text-[9px] uppercase tracking-wider"
            >
              {t.ratings[key]}
            </text>
          </g>
        );
      })}
      {series.map((s) => (
        <g key={s.label}>
          <polygon
            points={poly((i) => s.values[RATING_KEYS[i]])}
            fill={s.color}
            fillOpacity={0.18}
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {RATING_KEYS.map((key, i) => {
            const [x, y] = point(i, s.values[key]);
            return <circle key={key} cx={x} cy={y} r={3} fill={s.color} />;
          })}
        </g>
      ))}
      {series.length === 1 &&
        RATING_KEYS.map((key, i) => {
          const [x, y] = point(i, series[0].values[key]);
          return (
            <text
              key={key}
              x={x}
              y={y - 9}
              textAnchor="middle"
              className="fill-text font-display text-[11px] font-bold"
            >
              {series[0].values[key]}
            </text>
          );
        })}
    </svg>
  );
}

/* ---------------------------------------------------------------- Court --- */

export function CourtMap({
  primary,
  secondary,
  t,
  className,
}: {
  primary: Position;
  secondary?: Position | null;
  t: Dictionary;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 120" className={cn("h-auto w-full", className)} role="img" aria-label={t.positions[primary]}>
      <defs>
        <radialGradient id="court-glow">
          <stop offset="0" stopColor="var(--color-mhb-orange)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-mhb-orange)" stopOpacity="0" />
        </radialGradient>
        <clipPath id="court-clip">
          <rect x="0" y="0" width="200" height="120" rx="6" />
        </clipPath>
      </defs>
      <g clipPath="url(#court-clip)">
        <rect x="0" y="0" width="200" height="120" fill="rgb(27 77 255 / 0.08)" />
        <path
          d="M25 0 A60 60 0 0 0 85 60 L115 60 A60 60 0 0 0 175 0 Z"
          fill="rgb(116 172 223 / 0.10)"
          stroke="var(--color-celeste)"
          strokeOpacity="0.6"
        />
        <path
          d="M-5 0 A90 90 0 0 0 85 90 L115 90 A90 90 0 0 0 205 0"
          fill="none"
          stroke="var(--color-celeste)"
          strokeOpacity="0.4"
          strokeDasharray="4 4"
        />
        <line x1="95" y1="70" x2="105" y2="70" stroke="var(--color-celeste)" strokeOpacity="0.5" />
        <rect x="85" y="0" width="30" height="3" fill="var(--color-text)" opacity="0.8" />
      </g>
      <rect x="0.5" y="0.5" width="199" height="119" rx="6" fill="none" stroke="rgb(120 150 255 / 0.25)" />
      {POSITIONS.map((pos) => {
        const { x, y } = POSITION_COORDS[pos];
        const isPrimary = pos === primary;
        const isSecondary = pos === secondary;
        return (
          <g key={pos}>
            {isPrimary && <circle cx={x} cy={y} r={16} fill="url(#court-glow)" className="animate-pulse-glow" />}
            <circle
              cx={x}
              cy={y}
              r={isPrimary ? 6 : 4}
              fill={isPrimary ? "var(--color-mhb-orange)" : isSecondary ? "var(--color-celeste)" : "rgb(141 154 194 / 0.35)"}
              stroke={isPrimary ? "#fff" : "none"}
              strokeWidth={1.2}
            />
            <text
              x={x}
              y={y + (y > 100 ? -10 : 14)}
              textAnchor="middle"
              className={cn(
                "font-mono text-[7px] uppercase",
                isPrimary ? "fill-text" : isSecondary ? "fill-celeste" : "fill-muted",
              )}
            >
              {t.positionsShort[pos]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- Bars ------- */

export function RatingBars({ ratings, t }: { ratings: Ratings; t: Dictionary }) {
  return (
    <div className="space-y-2.5">
      {RATING_KEYS.map((key) => (
        <div key={key} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3">
          <span className="label">{t.ratings[key]}</span>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mhb-blue to-mhb-orange"
              style={{ width: `${ratings[key] * 10}%` }}
            />
          </div>
          <span className="text-right font-display text-lg font-bold tabular-nums">{ratings[key]}</span>
        </div>
      ))}
    </div>
  );
}
