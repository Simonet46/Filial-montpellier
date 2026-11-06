/**
 * Rutas de la app. Las fichas usan ?id= porque el sitio es estático:
 * así funcionan también los jugadores y concentraciones creados después del build.
 */
const q = (id: string) => encodeURIComponent(id);

export const routes = {
  home: "/",
  login: "/login/",
  dashboard: "/dashboard/",
  players: "/players/",
  newPlayer: "/players/new/",
  player: (id: string) => `/players/view/?id=${q(id)}`,
  editPlayer: (id: string) => `/players/edit/?id=${q(id)}`,
  compare: (ids: string[] = []) => (ids.length ? `/compare/?ids=${ids.map(q).join(",")}` : "/compare/"),
  trainings: "/trainings/",
  newTraining: "/trainings/new/",
  training: (id: string) => `/trainings/view/?id=${q(id)}`,
  editTraining: (id: string) => `/trainings/edit/?id=${q(id)}`,
  videos: "/videos/",
  newVideo: (opts: { player?: string; session?: string } = {}) => {
    const p = new URLSearchParams();
    if (opts.player) p.set("player", opts.player);
    if (opts.session) p.set("session", opts.session);
    return `/videos/new/${p.size ? `?${p}` : ""}`;
  },
  trials: "/trials/",
  users: "/admin/users/",
} as const;
