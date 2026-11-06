"use client";

import { useSearchParams } from "next/navigation";
import { PlayerForm } from "@/components/player-form";
import { NotFoundState, PageHeader, PageLoading } from "@/components/ui";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { repo } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { IS_DEMO } from "@/lib/env";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { useGuard } from "@/lib/use-guard";

export function NewPlayerView() {
  const user = useUser();
  const { t, locale } = useI18n();
  useDocumentTitle(t.players.newTitle);
  const allowed = useGuard(canEdit(user.role), routes.players);
  if (!allowed) return <PageLoading />;
  return (
    <>
      <PageHeader kicker={t.players.title} title={t.players.newTitle} />
      <PlayerForm t={t} locale={locale} isDemo={IS_DEMO} />
    </>
  );
}

export function EditPlayerView() {
  const id = useSearchParams().get("id") ?? "";
  return <EditPlayer key={id} id={id} />;
}

function EditPlayer({ id }: { id: string }) {
  const user = useUser();
  const { t, locale } = useI18n();
  const allowed = useGuard(canEdit(user.role), routes.player(id));
  const { data, ready } = useData(async () => {
    const [player, contact] = await Promise.all([repo.getPlayer(id), repo.getContact(id)]);
    if (!player) return null;
    const photoUrl = !player.photo_path
      ? null
      : player.photo_path.startsWith("data:")
        ? player.photo_path
        : await repo.signedUrl(STORAGE_BUCKETS.photos, player.photo_path);
    return { player, contact, photoUrl };
  }, [id]);
  useDocumentTitle(t.players.editTitle);
  if (!allowed || !ready) return <PageLoading />;
  if (!data) return <NotFoundState t={t} />;
  const { player, contact, photoUrl } = data;
  return (
    <>
      <PageHeader kicker={t.players.editTitle} title={`${player.first_name} ${player.last_name}`} />
      <PlayerForm t={t} locale={locale} player={player} contact={contact} photoUrl={photoUrl} isDemo={IS_DEMO} />
    </>
  );
}
