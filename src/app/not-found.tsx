import { LinkButton } from "@/components/ui";
import { getI18n } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="bg-grid flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[9rem] font-extrabold italic leading-none text-gradient-orange">404</p>
      <p className="label mt-2">{t.brand.club} · {t.brand.filial}</p>
      <LinkButton href="/" variant="secondary" className="mt-8">
        {t.common.back}
      </LinkButton>
    </div>
  );
}
