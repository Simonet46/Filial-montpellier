# Filial Argentina · Montpellier Handball

Plataforma de detección y seguimiento de talentos de la filial argentina del **Montpellier Handball**.

Los entrenadores de la filial cargan jugadores, concentraciones (una vez por mes o cada dos meses), videos de entrenamientos, cortes individuales y evaluaciones. El club y su centro de formación entran a **analizar, comparar, marcar favoritos e invitar a probarse** a los jugadores que les interesan.

Interfaz bilingüe **español / francés**, estética futurista con los colores del MHB (azul y naranja) y un guiño celeste y sol de Argentina.

---

## Qué incluye

| Sección | Qué hace |
|---|---|
| **Portada** (`/`) | Presentación pública del programa con cifras agregadas (sin datos personales). |
| **Panel** (`/dashboard`) | Indicadores, próxima concentración, plantel por puesto, mejor valorados, últimos videos, favoritos y pruebas en curso. |
| **Jugadores** (`/players`) | Explorador con búsqueda y filtros: puesto, mano hábil, generación, estado, altura mínima, pasaporte UE, selección y favoritos. |
| **Ficha** (`/players/[id]`) | Pasaportes (con detección de **pasaporte comunitario UE**), altura, peso, envergadura, mano hábil, puesto (mapa de cancha), club, selección, radar de evaluación, tests físicos con evolución, historial de evaluaciones, videos, asistencia y pruebas. Contacto privado solo para entrenadores. |
| **Comparar** (`/compare`) | Hasta 3 jugadores lado a lado, con el radar superpuesto y el mejor valor resaltado. |
| **Concentraciones** (`/trainings`) | Línea de tiempo con lugar, cuerpo técnico, convocados y videos. |
| **Videos** (`/videos`) | Entrenamientos completos, cortes individuales y partidos. Se suben como **archivo** o con **link** de YouTube/Vimeo. |
| **Pruebas** (`/trials`) | Tablero de invitaciones del club: Solicitada → Programada → Realizada / Descartada. |
| **Usuarios** (`/admin/users`) | Asignación de roles e invitaciones por correo (solo admin). |

### Roles

| Rol | Puede |
|---|---|
| `coach` · Entrenador filial | Crear y editar jugadores, concentraciones, videos y evaluaciones. Ve los contactos privados. |
| `club` · Club Montpellier | Ver y analizar todo (excepto contactos privados), marcar favoritos e invitar a pruebas. No puede editar jugadores. |
| `admin` | Todo lo anterior, más gestión de usuarios y roles. |
| `pending` | Cuenta creada sin acceso hasta que un admin le asigne un rol. |

Los permisos se aplican **en el servidor** (cada acción verifica el rol) y **en la base de datos** con Row Level Security. La migración `supabase/migrations/` se probó contra Postgres simulando cada rol: el club no puede editar jugadores ni ver contactos, nadie puede asignarse un rol a sí mismo, y los usuarios nuevos siempre quedan `pending`.

---

## Correr en local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. **Sin variables de Supabase la plataforma arranca en modo demo**: datos de ejemplo (jugadores ficticios), un selector para entrar como entrenador, club o admin, y cambios guardados solo en memoria hasta reiniciar el servidor. En modo demo los videos se agregan solo por link.

Otros comandos: `npm run build`, `npm run start`, `npm run lint`.

---

## Conectar Supabase (producción)

1. **Crear el proyecto** en Supabase. Región recomendada: **São Paulo (`sa-east-1`)**, la más cercana a Argentina, así los videos suben más rápido.
2. **Aplicar el esquema**: pegá el contenido de `supabase/migrations/20261106000000_init.sql` en el *SQL Editor* y ejecutalo, o con la CLI:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
   Esto crea las tablas, las políticas RLS, los triggers y los buckets privados `videos` y `player-photos`.
3. **Variables de entorno**: copiá `.env.example` a `.env.local` (o cargalas en Vercel) con la URL y la *publishable key* del proyecto. `SUPABASE_SERVICE_ROLE_KEY` es opcional y solo habilita el botón "Invitar usuario".
4. **Auth → Providers → Email**: desactivá *Allow new users to sign up*. Solo se entra por invitación.
5. **Auth → URL Configuration**: *Site URL* = la URL pública de la web. Agregá `https://<tu-dominio>/auth/callback` y `https://<tu-dominio>/auth/confirm` a *Redirect URLs*.
6. **Auth → Email Templates**: en *Invite user* y *Magic Link* reemplazá el enlace por:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
   ```
7. **Primer administrador**: invitá tu correo desde *Auth → Users → Invite* y después ejecutá:
   ```sql
   update public.profiles set role = 'admin', full_name = 'DS CONNECT' where email = 'tu@correo.com';
   ```
   Desde ahí, los demás usuarios se gestionan en `/admin/users`.
8. **Tamaño de videos**: en *Storage → Settings* subí el límite global de archivo (el plan Free permite 50 MB; Pro permite mucho más). El bucket `videos` no tiene límite propio y acepta `video/*`.

Los videos y fotos son **privados**: se reproducen con URLs firmadas que vencen a la hora.

## Deploy

Recomendado: **Vercel**. Importá el repositorio, cargá las variables de entorno y listo. Si se despliega sin variables, queda en modo demo, útil para mostrarle la plataforma al club. Ojo: en modo demo cada instancia guarda los cambios en su propia memoria.

---

## Marca

- **Colores**: tokens en `src/app/globals.css` (bloque `@theme`): `mhb-blue`, `mhb-orange`, `celeste`, `sol`.
- **Tipografías**: `src/app/fonts.ts` (Barlow Condensed, Barlow y JetBrains Mono). Si el club comparte su tipografía oficial, se reemplaza ahí con `next/font/local`.
- **Logo**: `Logo` en `src/components/visuals.tsx` es un isotipo provisorio. Para usar el escudo oficial, poné el archivo en `public/brand/` y reemplazá el SVG por un `<img>`.

## Estructura

```
src/
  app/
    page.tsx                 Portada pública
    login/                   Acceso (selector demo o email + contraseña / enlace mágico)
    auth/                    Callbacks de Supabase (callback, confirm)
    (platform)/              Área autenticada: dashboard, players, compare, trainings, videos, trials, admin
  components/                UI: shell, tarjetas, radar, mapa de cancha, formularios
  lib/
    actions/                 Server Actions (validan el rol en el servidor)
    data/                    Repositorio: supabase-repo (prod) y demo-repo + demo-seed
    i18n/                    Diccionarios es / fr
    supabase/                Clientes de Supabase (servidor y navegador)
  proxy.ts                   Refresco de sesión (Next.js 16: proxy reemplaza a middleware)
supabase/migrations/         Esquema, RLS, triggers y Storage
```

## Privacidad

Muchos jugadores son menores de edad. Por eso los datos de contacto (jugador y tutor) están en una tabla separada (`player_contacts`) que **solo** ven entrenadores y administradores, los archivos son privados y el acceso es solo por invitación. Antes de cargar datos reales conviene tener el consentimiento de las familias, en línea con la Ley 25.326 (Argentina) y el RGPD (Francia).

---

Plataforma desarrollada por **DS CONNECT**.
