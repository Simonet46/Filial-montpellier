"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExternalLink, Play, Trash2 } from "lucide-react";
import { deleteVideo } from "@/lib/actions/videos";
import type { PlayableVideo } from "@/lib/data";
import type { Dictionary } from "@/lib/i18n/es";
import type { Locale } from "@/lib/types";
import { cn, formatDate, parseVideoUrl } from "@/lib/utils";
import { Badge } from "./ui";

function youtubeId(embed: string | null) {
  return embed?.match(/embed\/([^/?]+)/)?.[1] ?? null;
}

export function VideoCard({
  video,
  t,
  locale,
  playerName,
  sessionTitle,
  canDelete,
}: {
  video: PlayableVideo;
  t: Dictionary;
  locale: Locale;
  playerName?: string | null;
  sessionTitle?: string | null;
  canDelete?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [pending, start] = useTransition();
  const parsed = video.url ? parseVideoUrl(video.url) : null;
  const embed = parsed?.embed ?? null;
  const ytId = youtubeId(embed);
  const isFile = video.source === "upload" && !!video.playable_url;
  const isExternalOnly = !!video.url && !embed;
  const hasMedia = isFile || !!embed;

  const kindTone = video.kind === "highlight" ? "orange" : video.kind === "match" ? "celeste" : "blue";

  return (
    <article className={cn("glass group overflow-hidden rounded-2xl", pending && "opacity-50")}>
      <div className="relative aspect-video overflow-hidden bg-ink">
        {playing && isFile ? (
          <video src={video.playable_url!} controls autoPlay className="h-full w-full bg-black" />
        ) : playing && embed ? (
          <iframe
            src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`}
            title={video.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => (hasMedia ? setPlaying(true) : isExternalOnly ? window.open(video.url!, "_blank") : null)}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={video.title}
          >
            {ytId ? (
              // eslint-disable-next-line @next/next/no-img-element -- miniatura pública de YouTube
              <img
                src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                alt=""
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-90"
              />
            ) : (
              <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <defs>
                  <linearGradient id={`vg-${video.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#0a2a8f" />
                    <stop offset="1" stopColor="#040815" />
                  </linearGradient>
                </defs>
                <rect width="160" height="90" fill={`url(#vg-${video.id})`} />
                <g fill="none" stroke="#74acdf" strokeOpacity="0.25">
                  <rect x="4" y="4" width="152" height="82" />
                  <line x1="80" y1="4" x2="80" y2="86" />
                  <path d="M4 25 A28 28 0 0 1 32 45 A28 28 0 0 1 4 65" />
                  <path d="M156 25 A28 28 0 0 0 128 45 A28 28 0 0 0 156 65" />
                  <path d="M4 15 A40 40 0 0 1 44 45 A40 40 0 0 1 4 75" strokeDasharray="3 3" />
                  <path d="M156 15 A40 40 0 0 0 116 45 A40 40 0 0 0 156 75" strokeDasharray="3 3" />
                </g>
                <rect y="0" width="160" height="12" fill="#ff6a13" opacity="0.06" className="animate-scan" />
              </svg>
            )}
            <span
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-mhb-orange/90 shadow-[0_0_30px_var(--color-mhb-orange)] transition group-hover:scale-110",
                !hasMedia && !isExternalOnly && "bg-white/10 shadow-none",
              )}
            >
              {isExternalOnly ? <ExternalLink className="h-5 w-5" /> : <Play className="ml-0.5 h-6 w-6 fill-white" />}
            </span>
            {!hasMedia && !isExternalOnly && (
              <span className="label absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                {t.videos.demoPlaceholder}
              </span>
            )}
          </button>
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          <Badge tone={kindTone} className="bg-ink/80">{t.videos.kind[video.kind]}</Badge>
          <Badge className="bg-ink/80">{t.videos.source[video.source]}</Badge>
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold uppercase leading-tight">{video.title}</h3>
          <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted">
            {playerName && video.player_id && (
              <Link href={`/players/${video.player_id}`} className="text-celeste hover:underline">
                {playerName}
              </Link>
            )}
            {sessionTitle && video.session_id && (
              <Link href={`/trainings/${video.session_id}`} className="hover:text-text hover:underline">
                {sessionTitle}
              </Link>
            )}
            <span>{formatDate(video.created_at, locale)}</span>
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            title={t.common.delete}
            onClick={() => {
              if (confirm(t.common.confirmDelete))
                start(async () => {
                  await deleteVideo(video.id);
                });
            }}
            className="rounded-md p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}
