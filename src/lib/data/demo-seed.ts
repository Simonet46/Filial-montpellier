import {
  RATING_KEYS,
  type Evaluation,
  type Player,
  type PlayerContact,
  type Profile,
  type TrainingSession,
  type Trial,
  type Video,
} from "../types";

/**
 * Datos de ejemplo para el modo demo. Personas ficticias: no corresponden a jugadores reales.
 */
const COACHES = ["Martín Ferreyra", "Lucía Gómez", "Diego Sosa"];
const T0 = "2026-01-10T12:00:00.000Z";

export const demoSessions: TrainingSession[] = [
  {
    id: "s1",
    title: "Concentración Marzo",
    date: "2026-03-14",
    location: "CeNARD, Buenos Aires",
    coaches: COACHES.slice(0, 2),
    description:
      "Primera concentración del año. Evaluación inicial, tests físicos y sistema defensivo 6:0.",
    attendee_ids: [],
    created_at: T0,
  },
  {
    id: "s2",
    title: "Concentración Mayo",
    date: "2026-05-16",
    location: "Polideportivo SAG Villa Ballester, Buenos Aires",
    coaches: COACHES,
    description: "Contraataque y transición rápida. Trabajo específico de arqueros.",
    attendee_ids: [],
    created_at: T0,
  },
  {
    id: "s3",
    title: "Concentración Julio",
    date: "2026-07-11",
    location: "Estadio Polideportivo, Córdoba",
    coaches: COACHES,
    description:
      "Juego posicional en ataque 6c6, cruces y bloqueos de pivote. Lanzamientos de 9 metros.",
    attendee_ids: [],
    created_at: T0,
  },
  {
    id: "s4",
    title: "Concentración Septiembre",
    date: "2026-09-12",
    location: "CeNARD, Buenos Aires",
    coaches: COACHES.slice(0, 2),
    description: "Defensa 5:1 y 3:2:1. Segundos tests físicos del año.",
    attendee_ids: [],
    created_at: T0,
  },
  {
    id: "s5",
    title: "Concentración Octubre",
    date: "2026-10-24",
    location: "Club Atlético Provincial, Rosario",
    coaches: COACHES,
    description:
      "Partidos de práctica con metodología Montpellier. Toma de decisión en superioridad numérica.",
    attendee_ids: [],
    created_at: T0,
  },
  {
    id: "s6",
    title: "Concentración Diciembre",
    date: "2026-12-12",
    location: "CeNARD, Buenos Aires",
    coaches: COACHES,
    description: "Cierre de temporada: evaluación final y entrevistas individuales.",
    attendee_ids: [],
    created_at: T0,
  },
];

type Seed = {
  p: Omit<Player, "created_at" | "updated_at" | "photo_path" | "nationality" | "joined_at"> & {
    joined_at?: string;
  };
  base: number[]; // técnica, táctica, físico, velocidad, lanzamiento, defensa, mentalidad
  tests: [number, number, number]; // sprint 20m (s), salto (cm), lanzamiento (km/h)
};

const seeds: Seed[] = [
  {
    p: {
      id: "p01", first_name: "Tomás", last_name: "Benítez", birth_date: "2008-04-12",
      passports: ["AR"], height_cm: 192, weight_kg: 86, wingspan_cm: 196,
      dominant_hand: "left", position: "RB", secondary_position: "RW",
      club: "SAG Villa Ballester", city: "Villa Ballester, Buenos Aires",
      national_team: "national", national_team_detail: "Selección Argentina Juvenil",
      status: "followup",
      scouting_notes:
        "Zurdo con lanzamiento de 9 m muy potente y buena lectura del juego. Debe mejorar el retorno defensivo.",
    },
    base: [8, 7, 8, 7, 9, 6, 8], tests: [3.12, 58, 96],
  },
  {
    p: {
      id: "p02", first_name: "Joaquín", last_name: "Rossi", birth_date: "2008-09-03",
      passports: ["AR", "IT"], height_cm: 188, weight_kg: 82, wingspan_cm: 191,
      dominant_hand: "right", position: "LB", secondary_position: "CB",
      club: "River Plate", city: "CABA",
      national_team: "national", national_team_detail: "Selección Argentina Juvenil",
      status: "invited",
      scouting_notes:
        "Lateral completo, inteligente en el 1c1 y con muy buena conducción. Pasaporte italiano.",
    },
    base: [8, 8, 7, 7, 8, 7, 9], tests: [3.18, 55, 91],
  },
  {
    p: {
      id: "p03", first_name: "Santiago", last_name: "Ferraro", birth_date: "2009-01-22",
      passports: ["AR", "IT"], height_cm: 182, weight_kg: 74, wingspan_cm: 185,
      dominant_hand: "right", position: "CB", secondary_position: "LB",
      club: "Ferro Carril Oeste", city: "CABA",
      national_team: "provincial", national_team_detail: "Selección de Buenos Aires Cadetes",
      status: "active",
      scouting_notes: "Central organizador, gran visión de juego. Necesita ganar masa muscular.",
    },
    base: [8, 8, 6, 7, 6, 6, 8], tests: [3.24, 51, 84],
  },
  {
    p: {
      id: "p04", first_name: "Valentín", last_name: "Acosta", birth_date: "2007-11-30",
      passports: ["AR"], height_cm: 197, weight_kg: 98, wingspan_cm: 202,
      dominant_hand: "right", position: "PV", secondary_position: null,
      club: "GEBA", city: "CABA",
      national_team: "national", national_team_detail: "Selección Argentina Junior",
      status: "followup",
      scouting_notes:
        "Pivote de gran físico, muy fuerte en el bloqueo y en la defensa central. Buen último pase recibido.",
    },
    base: [7, 7, 9, 6, 7, 8, 8], tests: [3.35, 49, 88],
  },
  {
    p: {
      id: "p05", first_name: "Bautista", last_name: "Moreno", birth_date: "2008-06-18",
      passports: ["AR", "ES"], height_cm: 191, weight_kg: 88, wingspan_cm: 197,
      dominant_hand: "right", position: "GK", secondary_position: null,
      club: "Club Atlético Lanús", city: "Lanús, Buenos Aires",
      national_team: "national", national_team_detail: "Selección Argentina Juvenil",
      status: "trial",
      scouting_notes: "Arquero de reflejos excelentes y muy buen juego de piernas. Líder vocal.",
    },
    base: [8, 7, 8, 8, 5, 8, 9], tests: [3.2, 54, 72],
  },
  {
    p: {
      id: "p06", first_name: "Lautaro", last_name: "Giménez", birth_date: "2009-08-07",
      passports: ["AR"], height_cm: 176, weight_kg: 68, wingspan_cm: 178,
      dominant_hand: "right", position: "LW", secondary_position: null,
      club: "Club Mendoza de Regatas", city: "Mendoza",
      national_team: "provincial", national_team_detail: "Selección de Mendoza Cadetes",
      status: "active",
      scouting_notes: "Extremo muy veloz, excelente en contraataque. Variedad de lanzamientos desde el ángulo.",
    },
    base: [7, 6, 6, 9, 7, 6, 7], tests: [2.98, 57, 80],
  },
  {
    p: {
      id: "p07", first_name: "Facundo", last_name: "Herrera", birth_date: "2008-02-14",
      passports: ["AR"], height_cm: 179, weight_kg: 72, wingspan_cm: 182,
      dominant_hand: "left", position: "RW", secondary_position: null,
      club: "Club Italiano", city: "CABA",
      national_team: "none", national_team_detail: null,
      status: "active",
      scouting_notes: "Extremo zurdo con buena técnica de vaselina y giro. Irregular en defensa.",
    },
    base: [7, 6, 6, 8, 7, 5, 6], tests: [3.05, 53, 82],
  },
  {
    p: {
      id: "p08", first_name: "Ignacio", last_name: "Pereyra", birth_date: "2010-05-25",
      passports: ["AR", "ES"], height_cm: 186, weight_kg: 75, wingspan_cm: 190,
      dominant_hand: "left", position: "RB", secondary_position: "RW",
      club: "UNLu", city: "Luján, Buenos Aires",
      national_team: "provincial", national_team_detail: "Selección de Buenos Aires Menores",
      status: "active",
      scouting_notes: "Zurdo de 16 años con gran proyección física. Muy coachable.",
    },
    base: [7, 6, 6, 7, 7, 6, 8], tests: [3.22, 50, 85],
  },
  {
    p: {
      id: "p09", first_name: "Mateo", last_name: "Bianchi", birth_date: "2009-10-10",
      passports: ["AR", "IT"], height_cm: 194, weight_kg: 85, wingspan_cm: 199,
      dominant_hand: "right", position: "LB", secondary_position: null,
      club: "Sociedad Hebraica Argentina", city: "CABA",
      national_team: "national", national_team_detail: "Selección Argentina Cadetes",
      status: "followup",
      scouting_notes: "Lateral alto con lanzamiento en suspensión de larga distancia. Pasaporte italiano.",
    },
    base: [7, 7, 8, 6, 9, 7, 7], tests: [3.28, 56, 94],
  },
  {
    p: {
      id: "p10", first_name: "Thiago", last_name: "Romero", birth_date: "2010-03-02",
      passports: ["AR"], height_cm: 181, weight_kg: 70, wingspan_cm: 183,
      dominant_hand: "right", position: "CB", secondary_position: null,
      club: "Estudiantes de La Plata", city: "La Plata, Buenos Aires",
      national_team: "none", national_team_detail: null,
      status: "active",
      scouting_notes: "Central rápido de mente, buen pase de ruptura. Todavía en desarrollo físico.",
    },
    base: [7, 7, 5, 7, 6, 5, 7], tests: [3.21, 48, 78],
  },
  {
    p: {
      id: "p11", first_name: "Agustín", last_name: "Medina", birth_date: "2007-07-19",
      passports: ["AR"], height_cm: 200, weight_kg: 102, wingspan_cm: 205,
      dominant_hand: "right", position: "PV", secondary_position: null,
      club: "Club Ciudad de Buenos Aires", city: "CABA",
      national_team: "provincial", national_team_detail: "Selección de Buenos Aires Juveniles",
      status: "active",
      scouting_notes: "Pivote muy alto, dominante en la defensa central. Debe mejorar movilidad.",
    },
    base: [6, 6, 9, 5, 6, 8, 7], tests: [3.45, 45, 86],
  },
  {
    p: {
      id: "p12", first_name: "Nicolás", last_name: "Castro", birth_date: "2009-12-01",
      passports: ["AR", "DE"], height_cm: 187, weight_kg: 79, wingspan_cm: 192,
      dominant_hand: "right", position: "GK", secondary_position: null,
      club: "Club Atlético San Fernando", city: "San Fernando, Buenos Aires",
      national_team: "none", national_team_detail: null,
      status: "active",
      scouting_notes: "Arquero joven con buena colocación. Pasaporte alemán.",
    },
    base: [6, 6, 7, 7, 5, 7, 7], tests: [3.26, 50, 70],
  },
  {
    p: {
      id: "p13", first_name: "Franco", last_name: "Domínguez", birth_date: "2008-11-11",
      passports: ["AR"], height_cm: 185, weight_kg: 80, wingspan_cm: 188,
      dominant_hand: "both", position: "CB", secondary_position: "RB",
      club: "Universitario de Córdoba", city: "Córdoba",
      national_team: "provincial", national_team_detail: "Selección de Córdoba Juveniles",
      status: "active",
      scouting_notes: "Ambidiestro poco habitual: puede jugar de central o lateral derecho.",
    },
    base: [8, 7, 7, 7, 7, 6, 7], tests: [3.15, 52, 87],
  },
  {
    p: {
      id: "p14", first_name: "Benjamín", last_name: "Ríos", birth_date: "2010-09-27",
      passports: ["AR", "IT"], height_cm: 178, weight_kg: 66, wingspan_cm: 180,
      dominant_hand: "right", position: "LW", secondary_position: null,
      club: "Quilmes Atlético Club", city: "Quilmes, Buenos Aires",
      national_team: "none", national_team_detail: null,
      status: "active",
      scouting_notes: "El más joven del grupo. Muy explosivo, gran actitud.",
    },
    base: [6, 6, 5, 8, 6, 5, 8], tests: [3.02, 52, 76],
  },
];

// Asistencia: los jugadores se fueron sumando a lo largo del año.
const attendanceBySession: Record<string, number> = { s1: 9, s2: 11, s3: 12, s4: 13, s5: 14, s6: 14 };
for (const s of demoSessions) {
  s.attendee_ids = seeds.slice(0, attendanceBySession[s.id]).map((x) => x.p.id);
}

export const demoPlayers: Player[] = seeds.map(({ p }) => ({
  ...p,
  photo_path: null,
  nationality: "AR",
  joined_at: demoSessions.find((s) => s.attendee_ids.includes(p.id))?.date ?? null,
  created_at: T0,
  updated_at: T0,
}));

const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)));

export const demoEvaluations: Evaluation[] = seeds.flatMap(({ p, base, tests }, i) => {
  const evalSessions = ["s3", "s4", "s5"].filter((sid) =>
    demoSessions.find((s) => s.id === sid)!.attendee_ids.includes(p.id),
  );
  return evalSessions.map((sid, k) => {
    const session = demoSessions.find((s) => s.id === sid)!;
    const progress = k - (evalSessions.length - 1); // la última = base
    const ratings = Object.fromEntries(
      RATING_KEYS.map((key, j) => [key, clamp(base[j] + (progress < 0 && (i + j) % 2 === 0 ? -1 : 0))]),
    ) as Record<(typeof RATING_KEYS)[number], number>;
    return {
      id: `e-${p.id}-${sid}`,
      player_id: p.id,
      session_id: sid,
      author_id: "demo-coach",
      author_name: session.coaches[k % session.coaches.length],
      date: session.date,
      ...ratings,
      sprint_20m_s: Math.round((tests[0] - progress * 0.04) * 100) / 100,
      vertical_jump_cm: tests[1] + progress,
      throw_speed_kmh: tests[2] + progress * 2,
      comment:
        k === evalSessions.length - 1
          ? "Buena evolución respecto de la concentración anterior."
          : "Cumple con los objetivos de la concentración.",
      created_at: session.date + "T20:00:00.000Z",
    };
  });
});

const highlight = (id: string, playerId: string, sessionId: string, title: string): Video => ({
  id, title, kind: "highlight", source: "link", url: null, storage_path: null,
  player_id: playerId, session_id: sessionId, description: null,
  created_by: "demo-coach",
  created_at: demoSessions.find((s) => s.id === sessionId)!.date + "T21:00:00.000Z",
});

export const demoVideos: Video[] = [
  ...["s3", "s4", "s5"].map((sid): Video => {
    const s = demoSessions.find((x) => x.id === sid)!;
    return {
      id: `v-${sid}`, title: `Entrenamiento completo · ${s.title}`, kind: "training",
      source: "link", url: null, storage_path: null, player_id: null, session_id: sid,
      description: s.description, created_by: "demo-coach", created_at: s.date + "T20:30:00.000Z",
    };
  }),
  highlight("v-01", "p01", "s5", "Lanzamientos de 9 m en suspensión"),
  highlight("v-02", "p01", "s4", "Penetraciones y pase al pivote"),
  highlight("v-03", "p02", "s5", "1c1 y finalización desde lateral izquierdo"),
  highlight("v-04", "p04", "s5", "Bloqueos y continuación de pivote"),
  highlight("v-05", "p05", "s5", "Atajadas: lanzamientos de 6 m y extremos"),
  highlight("v-06", "p05", "s4", "Salida rápida y pase de contraataque"),
  highlight("v-07", "p06", "s4", "Contraataques y lanzamiento de ángulo"),
  highlight("v-08", "p09", "s5", "Lanzamiento de larga distancia"),
  highlight("v-09", "p13", "s5", "Dirección de juego como central"),
  highlight("v-10", "p03", "s3", "Circulación y cruces en 6c6"),
  {
    id: "v-m1", title: "Partido de práctica · Filial vs. Selección de Rosario", kind: "match",
    source: "link", url: null, storage_path: null, player_id: null, session_id: "s5",
    description: "Partido completo con cámara táctica.", created_by: "demo-coach",
    created_at: "2026-10-25T18:00:00.000Z",
  },
];

export const demoTrials: Trial[] = [
  {
    id: "t1", player_id: "p05", requested_by: "demo-club",
    requested_by_name: "Centre de Formation", status: "scheduled", proposed_date: "2027-01-11",
    notes: "Semana de prueba con el grupo U19 y sesiones específicas con el entrenador de arqueros.",
    created_at: "2026-10-28T10:00:00.000Z", updated_at: "2026-10-30T10:00:00.000Z",
  },
  {
    id: "t2", player_id: "p02", requested_by: "demo-club",
    requested_by_name: "Centre de Formation", status: "requested", proposed_date: "2027-02-08",
    notes: "Nos interesa verlo en el sistema ofensivo del centro de formación.",
    created_at: "2026-11-02T10:00:00.000Z", updated_at: "2026-11-02T10:00:00.000Z",
  },
];

export const demoFavorites: { user_id: string; player_id: string }[] = ["p01", "p02", "p04", "p09"].map(
  (player_id) => ({ user_id: "demo-club", player_id }),
);

export const demoContacts: PlayerContact[] = demoPlayers.slice(0, 6).map((p, i) => ({
  player_id: p.id,
  email: `${p.first_name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.demo@example.com`,
  phone: `+54 11 5555-01${String(i).padStart(2, "0")}`,
  guardian_name: `Familia ${p.last_name}`,
  guardian_phone: `+54 11 5555-02${String(i).padStart(2, "0")}`,
}));

export const demoProfiles: Profile[] = [
  { id: "demo-admin", email: "admin@dsconnect-demo.com", full_name: "DS CONNECT", role: "admin", organization: "DS CONNECT", created_at: T0 },
  { id: "demo-coach", email: "entrenador@filial-demo.ar", full_name: "Entrenador Demo", role: "coach", organization: "Filial Argentina", created_at: T0 },
  { id: "demo-coach-2", email: "lucia@filial-demo.ar", full_name: "Lucía Gómez", role: "coach", organization: "Filial Argentina", created_at: T0 },
  { id: "demo-coach-3", email: "diego@filial-demo.ar", full_name: "Diego Sosa", role: "coach", organization: "Filial Argentina", created_at: T0 },
  { id: "demo-club", email: "formation@mhb-demo.fr", full_name: "Centre de Formation", role: "club", organization: "Montpellier Handball", created_at: T0 },
  { id: "demo-pending", email: "nouveau@mhb-demo.fr", full_name: "Recrutement", role: "pending", organization: "Montpellier Handball", created_at: T0 },
];
