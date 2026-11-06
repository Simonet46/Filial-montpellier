"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { EmptyState, LinkButton, PageHeader, PageLoading } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { VideoFilters } from "@/components/video-form";
import { VIDEO_KINDS } from "@/lib/constants";
import { repo, withPlayableUrls } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";

export function VideosView() {
  const params = useSearchParams();
  const kind = params.get("kind") ?? "";
  const player = params.get("player") ?? "";
  const user = useUser();
  const { t, locale } = useI18n();
  useDocumentTitle(t.videos.title);
  const { data } = useData(async () => {
    const [players, sessions, all] = await Promise.all([
      repo.listPlayers(),
      repo.listSessions(),
      repo.listVideos(player ? { playerId: player } : undefined),
    ]);
    const filtered = all
      .filter((v) => !(kind && VIDEO_KINDS.includes(kind as never)) || v.kind === kind)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { players, sessions, videos: await withPlayableUrls(filtered) };
  }, [kind, player]);
  if (!data) return <PageLoading />;
  const { players, sessions, videos } = data;
  const byId = new Map(players.map((p) => [p.id, p]));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const editor = canEdit(user.role);
  return (
    <>
      <PageHeader
        kicker={t.brand.filial}
        title={t.videos.title}
        subtitle={t.videos.subtitle}
        actions={
          editor && (
            <LinkButton href={routes.newVideo()}>
              <Plus className="h-4 w-4" /> {t.videos.new}
            </LinkButton>
          )
        }
      />
      <Suspense>
        <VideoFilters
          t={t}
          players={[...players]
            .sort((a, b) => a.last_name.localeCompare(b.last_name))
            .map((p) => ({ id: p.id, label: `${p.last_name}, ${p.first_name}` }))}
        />
      </Suspense>
      {videos.length === 0 ? (
        <EmptyState>{t.videos.noResults}</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((v) => {
            const pl = v.player_id ? byId.get(v.player_id) : null;
            return (
              <VideoCard
                key={v.id}
                video={v}
                t={t}
                locale={locale}
                playerName={pl ? `${pl.first_name} ${pl.last_name}` : null}
                sessionTitle={v.session_id ? sessionById.get(v.session_id)?.title : null}
                canDelete={editor}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
