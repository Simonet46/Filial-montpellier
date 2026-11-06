import { redirect } from "next/navigation";
import { PlayerForm } from "@/components/player-form";
import { PageHeader } from "@/components/ui";
import { canEdit, requireUser } from "@/lib/auth";
import { IS_DEMO } from "@/lib/env";
import { getI18n } from "@/lib/i18n";

export default async function NewPlayerPage() {
  const user = await requireUser();
  if (!canEdit(user.role)) redirect("/players");
  const { t, locale } = await getI18n();
  return (
    <>
      <PageHeader kicker={t.players.title} title={t.players.newTitle} />
      <PlayerForm t={t} locale={locale} isDemo={IS_DEMO} />
    </>
  );
}
