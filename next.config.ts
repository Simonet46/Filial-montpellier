import type { NextConfig } from "next";

// La plataforma es 100% autenticada y dinámica (sesión + idioma por cookie),
// por eso usamos el modelo de render dinámico clásico en vez de Cache Components.
const nextConfig: NextConfig = {
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
