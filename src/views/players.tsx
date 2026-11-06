"use client";

import { Plus } from "lucide-react";
import { PlayersExplorer } from "@/components/players-explorer";
import { LinkButton, PageHeader, PageLoading } from "@/components/ui";
import { loadPlayerSummaries } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";

export function PlayersView() {
  const user = useUser();
  const { t, locale } = useI18n();
  useDocumentTitle(t.players.title);
  const { data: players } = useData(() => loadPlayerSummaries(user), [user.id]);

  return (
    <>
      <PageHeader
        kicker={t.brand.filial}
        title={t.players.title}
        subtitle={t.players.subtitle}
        actions={
          canEdit(user.role) && (
            <LinkButton href={routes.newPlayer}>
              <Plus className="h-4 w-4" /> {t.players.new}
            </LinkButton>
          )
        }
      />
      {players ? <PlayersExplorer players={players} t={t} locale={locale} /> : <PageLoading />}
    </>
  );
}
