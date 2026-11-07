# Filial Argentina · Montpellier Handball

Proyecto para el **Montpellier Handball**: un programa de detección y formación de talentos en Argentina y la plataforma donde los entrenadores de la filial cargan jugadores, concentraciones, videos y evaluaciones. El club y su centro de formación los analizan, comparan e invitan a probarse.

**Sitio publicado:** <https://simonet46.github.io/Filial-montpellier/>

| Link | Para qué |
|---|---|
| [`/`](https://simonet46.github.io/Filial-montpellier/) | Presentación del proyecto (en español) |
| [`/?lang=fr`](https://simonet46.github.io/Filial-montpellier/?lang=fr) | La misma presentación en francés, para el club |
| [`/login/?as=coach`](https://simonet46.github.io/Filial-montpellier/login/?as=coach) | Entra directo a la plataforma como entrenador de la filial (demo) |
| [`/login/?as=club`](https://simonet46.github.io/Filial-montpellier/login/?as=club) | Entra directo como Montpellier Handball (demo) |

---

## Qué incluye

**Presentación (inicio):** 12 diapositivas en español y francés: el proyecto, por qué Argentina, cómo funciona la filial, la plataforma, roles, recorrido hasta la prueba, beneficios, seguridad, hoja de ruta, quiénes somos y próximos pasos. Se navega con las flechas del teclado, la barra espaciadora o los puntos laterales. El botón ⤢ activa la pantalla completa para presentar.

**Plataforma:**

| Sección | Qué hace |
|---|---|
| Panel | Indicadores, próxima concentración, plantel por puesto, mejor valorados, últimos videos, favoritos y pruebas. |
| Jugadores | Búsqueda y filtros por puesto, mano hábil, generación, estado, altura, pasaporte UE, selección y favoritos. |
| Ficha | Pasaportes (detecta el **pasaporte comunitario UE**), físico, mano hábil, puesto en cancha, club, selección, radar de evaluación, tests físicos con evolución, videos, asistencia y pruebas. El contacto privado solo lo ven los entrenadores. |
| Comparar | Hasta 3 jugadores lado a lado. |
| Concentraciones | Línea de tiempo con lugar, cuerpo técnico, convocados y videos. |
| Videos | Entrenamientos, cortes individuales y partidos, subidos como archivo o por link (YouTube/Vimeo). |
| Pruebas | Tablero de invitaciones del club: Solicitada → Programada → Realizada / Descartada. |
| Usuarios | Roles e invitaciones (solo admin). |

**Roles:** `coach` (entrenador filial: carga y edita), `club` (Montpellier: analiza, favoritos, invita a pruebas), `admin` (todo + usuarios), `pending` (sin acceso hasta que un admin lo habilite).

---

## Modo demo (cómo está publicado hoy)

Mientras no se conecte una base de datos, el sitio funciona en **modo demo**:

- Arranca con **jugadores ficticios** de ejemplo.
- Lo que cada persona carga se guarda **solo en su navegador** (localStorage). No se comparte con otros ni se envía a ningún servidor.
- El botón **«Restablecer demo»** vuelve a los datos de ejemplo.
- En demo los videos se agregan por link. La subida de archivos se habilita con Supabase.

Sirve para mostrar y probar la plataforma. **No cargues datos reales de jugadores en la demo.**

---

## Arquitectura

Sitio **100% estático** (Next.js 16 con `output: "export"`), publicado en **GitHub Pages**. Todo corre en el navegador:

- Modo demo: datos en `localStorage` (`src/lib/data/local-repo.ts`).
- Producción: **Supabase** directo desde el navegador (`src/lib/data/supabase-repo.ts`). La seguridad la aplican las políticas **RLS** de la base (`supabase/migrations/`), que se probaron contra Postgres simulando cada rol.

### Correr en local

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. Para generar el sitio estático: `npm run build` (queda en `out/`).

### Publicación

Cada push a la rama principal ejecuta `.github/workflows/deploy-pages.yml`: lint, build con la ruta `/Filial-montpellier` y publicación en la rama `gh-pages`. GitHub Pages sirve esa rama (Settings → Pages → Deploy from a branch → `gh-pages` / root).

---

## Conectar Supabase (cuando quieras pasar a datos reales)

1. **Crear el proyecto** en Supabase. Región recomendada: **São Paulo (`sa-east-1`)**.
2. **Aplicar el esquema**: pegá `supabase/migrations/20261106000000_init.sql` en el *SQL Editor* y ejecutalo (o `supabase db push`).
3. **Variables en GitHub**: en el repo, *Settings → Secrets and variables → Actions → Variables*, creá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Son claves públicas (se ven en el navegador por diseño). Nunca pongas la *service role* acá. Después volvé a ejecutar el workflow.
4. **Auth → Providers → Email**: desactivá *Allow new users to sign up* (solo se entra por invitación).
5. **Auth → URL Configuration**: *Site URL* = `https://simonet46.github.io/Filial-montpellier`. En *Redirect URLs* agregá `…/auth/callback/` y `…/auth/confirm/`.
6. **Auth → Email Templates** (Invite y Magic Link):
   ```
   {{ .SiteURL }}/auth/confirm/?token_hash={{ .TokenHash }}&type=invite
   {{ .SiteURL }}/auth/confirm/?token_hash={{ .TokenHash }}&type=magiclink
   ```
7. **Primer administrador**: invitá tu correo desde *Auth → Users* y ejecutá:
   ```sql
   update public.profiles set role = 'admin', full_name = 'Coordinación' where email = 'tu@correo.com';
   ```
8. **Invitaciones desde la plataforma** (opcional): `supabase functions deploy invite-user` (código en `supabase/functions/invite-user/`). Sin eso, se invita desde el panel de Supabase y el rol se asigna en `/admin/users/`.
9. **Videos**: en *Storage → Settings* ajustá el tamaño máximo de archivo. Los videos y fotos son privados y se ven con URLs firmadas.

---

## Marca

Colores y tipografía tomados del tema oficial de [montpellierhandball.com](https://www.montpellierhandball.com/) (`variables.css` / `fonts.css`):

| Token | Valor | Uso en el club |
|---|---|---|
| `--color-mhb-navy` | `#1a365d` | primary |
| `--color-mhb-blue` | `#007AC1` | secondary |
| `--color-mhb-orange` | `#E95323` | accent |
| `--color-ink` / `--color-night` | `#001025` / `#010E1E` | fondos |
| `--color-muted` | `#a0aec0` | texto gris |
| `--color-gold` | `#BB9860` | dorado trofeos |

Guiño argentino: celeste `#74ACDF` y sol `#F6B40E`.

- **Texto: DM Sans**, la misma del club (licencia libre).
- **Títulos:** el club usa **Formula Condensed**, una fuente **comercial** con licencia para su propio sitio. No se puede redistribuir en un repositorio público, así que usamos **Big Shoulders** (libre), la alternativa más parecida. Si el club cede la fuente con una licencia que permita usarla acá, se reemplaza en `src/app/fonts.ts`.
- **Logo:** `Logo` en `src/components/visuals.tsx` es un isotipo provisorio. El escudo oficial requiere autorización del club.

## Estructura

```
src/
  app/                 Rutas (páginas estáticas) y layout
  views/               Pantallas: presentación, panel, jugadores, ficha, comparar, etc.
  components/          UI: shell, tarjetas, radar, mapa de cancha, formularios
  lib/
    data/              Repositorios (demo y Supabase), carga de datos
    i18n/              Textos en español y francés
    mutations.ts       Altas, ediciones y bajas
    session.tsx        Sesión (demo o Supabase)
supabase/
  migrations/          Esquema, RLS, triggers y Storage
  functions/           Edge Function para invitar usuarios
.github/workflows/     Publicación en GitHub Pages
```

## Privacidad

Muchos jugadores son menores de edad. Los datos de contacto están en una tabla separada que **solo** ven entrenadores y administradores, los archivos son privados y el acceso es solo por invitación. Antes de cargar datos reales conviene tener el consentimiento de las familias (Ley 25.326 en Argentina, RGPD en Francia).

