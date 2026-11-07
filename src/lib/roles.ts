import type { CurrentUser, Role } from "./types";

export const canEdit = (role: Role) => role === "coach" || role === "admin";
export const isAdmin = (role: Role) => role === "admin";
export const canRequestTrial = (role: Role) => role === "club" || role === "admin";

export type DemoRole = Exclude<Role, "pending">;

/** Usuarios del modo demo (ficticios). */
export const DEMO_USERS: Record<DemoRole, CurrentUser> = {
  coach: {
    id: "demo-coach",
    email: "entrenador@filial-demo.ar",
    name: "Entrenador Demo",
    role: "coach",
    organization: "Filial Argentina",
  },
  club: {
    id: "demo-club",
    email: "formation@mhb-demo.fr",
    name: "Centre de Formation",
    role: "club",
    organization: "Montpellier Handball",
  },
  admin: {
    id: "demo-admin",
    email: "admin@filial-demo.ar",
    name: "Coordinación",
    role: "admin",
    organization: "Filial Argentina",
  },
};

export const isDemoRole = (value: unknown): value is DemoRole =>
  typeof value === "string" && value in DEMO_USERS;
