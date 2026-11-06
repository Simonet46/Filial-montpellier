import type { NextConfig } from "next";

/**
 * Sitio 100% estático (HTML/CSS/JS): se publica en GitHub Pages y, más adelante,
 * habla directo con Supabase desde el navegador (la seguridad la da RLS).
 *
 * NEXT_PUBLIC_BASE_PATH: subcarpeta donde se publica, p. ej. "/Filial-montpellier"
 * en https://<usuario>.github.io/Filial-montpellier/. Vacío en local o con dominio propio.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
