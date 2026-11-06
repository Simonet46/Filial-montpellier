// Edge Function de Supabase: invita usuarios por correo y les asigna un rol.
// Deploy:  supabase functions deploy invite-user
// Solo un admin de la plataforma puede usarla (se verifica con su sesión).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ROLES = ["admin", "coach", "club"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1. ¿Quién llama? Debe ser admin según la tabla profiles.
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: isAdmin, error: roleError } = await caller.rpc("is_admin");
  if (roleError || !isAdmin) return json({ error: "forbidden" }, 403);

  // 2. Datos de la invitación.
  const { email, role, full_name, organization, redirect_to } = await req.json();
  if (typeof email !== "string" || !email.includes("@")) return json({ error: "email" }, 400);
  if (!ROLES.includes(role)) return json({ error: "role" }, 400);

  // 3. Invitar con la service role y asignar el rol al perfil creado por el trigger.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name ?? "" },
    redirectTo: typeof redirect_to === "string" ? redirect_to : undefined,
  });
  if (error) return json({ error: error.message }, 400);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role, full_name: full_name ?? "", organization: organization ?? null })
    .eq("id", data.user.id);
  if (profileError) return json({ error: profileError.message }, 400);

  return json({ ok: true });
});
