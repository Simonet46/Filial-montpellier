import type { Metadata, Viewport } from "next";
import { getI18n } from "@/lib/i18n";
import { barlow, barlowCondensed, jetbrains } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: `${t.brand.filial} · ${t.brand.club}`, template: `%s · ${t.brand.filial}` },
    description: t.brand.tagline,
  };
}

export const viewport: Viewport = {
  themeColor: "#040815",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();
  return (
    <html
      lang={locale}
      className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
