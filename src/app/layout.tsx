import type { Metadata, Viewport } from "next";
import { display, dmSans } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Filial Argentina · Montpellier Handball",
  description:
    "Proyecto de detección y formación de talentos en Argentina para el Montpellier Handball. Propuesta de DS CONNECT.",
};

export const viewport: Viewport = {
  themeColor: "#001025",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${dmSans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
