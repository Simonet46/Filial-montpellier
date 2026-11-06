import { Big_Shoulders, DM_Sans } from "next/font/google";

/**
 * Tipografías del Montpellier Handball (montpellierhandball.com):
 * - Texto: DM Sans → la misma que usa el club (licencia libre OFL).
 * - Títulos: el club usa "Formula Condensed", una fuente comercial con licencia
 *   para su sitio. No se puede redistribuir en un repo público, así que usamos
 *   Big Shoulders (OFL, variable con tamaño óptico → corte "Display" en títulos),
 *   la alternativa libre más parecida.
 *   Si el club cede los archivos, se reemplaza acá con next/font/local.
 */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
});

export const display = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display-face",
  fallback: ["Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
});
