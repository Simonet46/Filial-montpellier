"use client";

import { LinkButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="bg-grid flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[9rem] font-extrabold leading-none text-gradient-orange">404</p>
      <p className="label mt-2">
        {t.brand.club} · {t.brand.filial}
      </p>
      <LinkButton href={routes.home} variant="secondary" className="mt-8">
        {t.common.back}
      </LinkButton>
    </div>
  );
}
