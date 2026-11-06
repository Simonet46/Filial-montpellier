import { Plus } from "lucide-react";
import { PlayersExplorer } from "@/components/players-explorer";
import { LinkButton, PageHeader } from "@/components/ui";
import { canEdit, requireUser } from "@/lib/auth";
import { getPlayerSummaries } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.players.title };
}

export default async function PlayersPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const players = await getPlayerSummaries(user);

  return (
    <>
      <PageHeader
        kicker={t.brand.filial}
        title={t.players.title}
        subtitle={t.players.subtitle}
        actions={
          canEdit(user.role) && (
            <LinkButton href="/players/new">
              <Plus className="h-4 w-4" /> {t.players.new}
            </LinkButton>
          )
        }
      />
      <PlayersExplorer players={players} t={t} locale={locale} />
    </>
  );
}
