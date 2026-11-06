import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";

// Tipografías deportivas condensadas, en línea con la estética del club.
// Reemplazables por la fuente oficial del MHB cuando esté disponible.
export const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
});

export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});
