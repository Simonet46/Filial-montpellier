import { notFound, redirect } from "next/navigation";
import { PlayerForm } from "@/components/player-form";
import { PageHeader } from "@/components/ui";
import { canEdit, requireUser } from "@/lib/auth";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { repo } from "@/lib/data";
import { IS_DEMO } from "@/lib/env";
import { getI18n } from "@/lib/i18n";

export default async function EditPlayerPage({ params }: PageProps<"/players/[id]/edit">) {
  const { id } = await params;
  const user = await requireUser();
  if (!canEdit(user.role)) redirect(`/players/${id}`);
  const { t, locale } = await getI18n();
  const [player, contact] = await Promise.all([repo.getPlayer(id), repo.getContact(id)]);
  if (!player) notFound();
  const photoUrl = player.photo_path ? await repo.signedUrl(STORAGE_BUCKETS.photos, player.photo_path) : null;

  return (
    <>
      <PageHeader kicker={t.players.editTitle} title={`${player.first_name} ${player.last_name}`} />
      <PlayerForm t={t} locale={locale} player={player} contact={contact} photoUrl={photoUrl} isDemo={IS_DEMO} />
    </>
  );
}
