import { Suspense } from "react";
import { Plus } from "lucide-react";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { VideoFilters } from "@/components/video-form";
import { canEdit, requireUser } from "@/lib/auth";
import { VIDEO_KINDS } from "@/lib/constants";
import { repo, withPlayableUrls } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.videos.title };
}

export default async function VideosPage({ searchParams }: PageProps<"/videos">) {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const { kind, player } = await searchParams;
  const [players, sessions, all] = await Promise.all([
    repo.listPlayers(),
    repo.listSessions(),
    repo.listVideos(typeof player === "string" && player ? { playerId: player } : undefined),
  ]);
  const filtered = all
    .filter((v) => !(typeof kind === "string" && VIDEO_KINDS.includes(kind as never)) || v.kind === kind)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const videos = await withPlayableUrls(filtered);
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
            <LinkButton href="/videos/new">
              <Plus className="h-4 w-4" /> {t.videos.new}
            </LinkButton>
          )
        }
      />
      <Suspense>
        <VideoFilters
          t={t}
          players={players
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
