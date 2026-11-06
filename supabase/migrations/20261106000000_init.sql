-- =============================================================================
-- Filial Argentina · Montpellier Handball — esquema inicial
-- Roles: admin (gestión total) · coach (entrenadores de la filial, cargan datos)
--        club (Montpellier HB: lectura, favoritos, invitaciones a prueba)
--        pending (cuenta creada sin acceso hasta que un admin la habilite)
-- =============================================================================

-- ---------- Tipos ------------------------------------------------------------
create type public.app_role as enum ('admin', 'coach', 'club', 'pending');
create type public.handball_position as enum ('GK', 'LW', 'LB', 'CB', 'RB', 'RW', 'PV');
create type public.dominant_hand as enum ('right', 'left', 'both');
create type public.national_team_level as enum ('none', 'provincial', 'national');
create type public.player_status as enum ('active', 'followup', 'invited', 'trial', 'signed', 'inactive');
create type public.video_kind as enum ('training', 'highlight', 'match');
create type public.video_source as enum ('upload', 'youtube', 'vimeo', 'link');
create type public.trial_status as enum ('requested', 'scheduled', 'completed', 'declined');

-- ---------- Perfiles ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role public.app_role not null default 'pending',
  organization text,
  created_at timestamptz not null default now()
);

-- Helpers de autorización (security definer para evitar recursión en RLS).
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid())) in ('admin', 'coach', 'club'),
    false
  )
$$;

create or replace function public.can_edit()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid())) in ('admin', 'coach'),
    false
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select role from public.profiles where id = (select auth.uid())) = 'admin',
    false
  )
$$;

-- Cada usuario nuevo de Auth recibe un perfil "pending". El rol NUNCA se toma de los
-- metadatos que envía el cliente: lo asigna un admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Jugadores --------------------------------------------------------
create table public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  photo_path text,
  nationality char(2) not null default 'AR',
  passports text[] not null default '{AR}',
  height_cm numeric(5, 1) check (height_cm between 100 and 250),
  weight_kg numeric(5, 1) check (weight_kg between 30 and 200),
  wingspan_cm numeric(5, 1) check (wingspan_cm between 100 and 260),
  dominant_hand public.dominant_hand not null default 'right',
  position public.handball_position not null,
  secondary_position public.handball_position,
  club text not null,
  city text,
  national_team public.national_team_level not null default 'none',
  national_team_detail text,
  status public.player_status not null default 'active',
  scouting_notes text,
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger players_touch_updated_at
  before update on public.players
  for each row execute function public.touch_updated_at();

-- Datos de contacto (muchos jugadores son menores): solo entrenadores y admins.
create table public.player_contacts (
  player_id uuid primary key references public.players (id) on delete cascade,
  email text,
  phone text,
  guardian_name text,
  guardian_phone text
);

-- ---------- Concentraciones --------------------------------------------------
create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  location text not null,
  coaches text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);

create table public.session_attendance (
  session_id uuid not null references public.training_sessions (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  primary key (session_id, player_id)
);
create index session_attendance_player_idx on public.session_attendance (player_id);

-- ---------- Evaluaciones -----------------------------------------------------
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  session_id uuid references public.training_sessions (id) on delete set null,
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  author_name text not null default '',
  date date not null default current_date,
  technique smallint not null check (technique between 1 and 10),
  tactics smallint not null check (tactics between 1 and 10),
  physical smallint not null check (physical between 1 and 10),
  speed smallint not null check (speed between 1 and 10),
  shooting smallint not null check (shooting between 1 and 10),
  defense smallint not null check (defense between 1 and 10),
  mentality smallint not null check (mentality between 1 and 10),
  sprint_20m_s numeric(4, 2),
  vertical_jump_cm numeric(5, 1),
  throw_speed_kmh numeric(5, 1),
  comment text,
  created_at timestamptz not null default now()
);
create index evaluations_player_date_idx on public.evaluations (player_id, date desc);
create index evaluations_session_idx on public.evaluations (session_id);
create index evaluations_author_idx on public.evaluations (author_id);

-- ---------- Videos -----------------------------------------------------------
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind public.video_kind not null default 'highlight',
  source public.video_source not null,
  url text,
  storage_path text,
  player_id uuid references public.players (id) on delete cascade,
  session_id uuid references public.training_sessions (id) on delete set null,
  description text,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint videos_has_media check (url is not null or storage_path is not null)
);
create index videos_player_idx on public.videos (player_id);
create index videos_session_idx on public.videos (session_id);
create index videos_created_by_idx on public.videos (created_by);

-- ---------- Favoritos (seguimiento del club) ---------------------------------
create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, player_id)
);
create index favorites_player_idx on public.favorites (player_id);

-- ---------- Pruebas en Montpellier -------------------------------------------
create table public.trials (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  requested_by uuid default auth.uid() references public.profiles (id) on delete set null,
  requested_by_name text not null default '',
  status public.trial_status not null default 'requested',
  proposed_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index trials_player_idx on public.trials (player_id);
create index trials_requested_by_idx on public.trials (requested_by);

create trigger trials_touch_updated_at
  before update on public.trials
  for each row execute function public.touch_updated_at();

-- Al invitar a un jugador, pasa a "invitado" si estaba activo o en seguimiento.
create or replace function public.handle_new_trial()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.players
     set status = 'invited'
   where id = new.player_id and status in ('active', 'followup');
  return new;
end;
$$;

create trigger on_trial_created
  after insert on public.trials
  for each row execute function public.handle_new_trial();

-- ---------- Permisos y RLS ---------------------------------------------------
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.current_app_role(), public.is_staff(), public.can_edit(), public.is_admin()
  to authenticated;

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.player_contacts enable row level security;
alter table public.training_sessions enable row level security;
alter table public.session_attendance enable row level security;
alter table public.evaluations enable row level security;
alter table public.videos enable row level security;
alter table public.favorites enable row level security;
alter table public.trials enable row level security;

-- profiles
create policy "profiles: ver el propio o admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: admin actualiza" on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "profiles: admin elimina" on public.profiles
  for delete to authenticated using ((select public.is_admin()));

-- Tablas de lectura para todo el staff y escritura para entrenadores/admins.
do $$
declare t text;
begin
  foreach t in array array['players', 'training_sessions', 'session_attendance', 'evaluations', 'videos']
  loop
    execute format(
      'create policy "%1$s: staff lee" on public.%1$I for select to authenticated using ((select public.is_staff()))', t);
    execute format(
      'create policy "%1$s: editores insertan" on public.%1$I for insert to authenticated with check ((select public.can_edit()))', t);
    execute format(
      'create policy "%1$s: editores actualizan" on public.%1$I for update to authenticated using ((select public.can_edit())) with check ((select public.can_edit()))', t);
    execute format(
      'create policy "%1$s: editores eliminan" on public.%1$I for delete to authenticated using ((select public.can_edit()))', t);
  end loop;
end $$;

-- player_contacts: solo entrenadores y admins (ni siquiera lectura para el club).
create policy "player_contacts: editores" on public.player_contacts
  for all to authenticated using ((select public.can_edit())) with check ((select public.can_edit()));

-- favorites: cada usuario gestiona los suyos.
create policy "favorites: propios" on public.favorites
  for all to authenticated
  using (user_id = (select auth.uid()) and (select public.is_staff()))
  with check (user_id = (select auth.uid()) and (select public.is_staff()));

-- trials: todo el staff lee y actualiza el estado; solo club/admin crean; admin elimina.
create policy "trials: staff lee" on public.trials
  for select to authenticated using ((select public.is_staff()));
create policy "trials: club o admin crean" on public.trials
  for insert to authenticated
  with check (
    requested_by = (select auth.uid())
    and (select public.current_app_role()) in ('club', 'admin')
  );
create policy "trials: staff actualiza" on public.trials
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "trials: admin elimina" on public.trials
  for delete to authenticated using ((select public.is_admin()));

-- Cifras agregadas para la portada pública (sin datos personales).
create or replace function public.public_stats()
returns json
language sql stable security definer set search_path = ''
as $$
  select json_build_object(
    'players', (select count(*) from public.players where status <> 'inactive'),
    'sessions', (select count(*) from public.training_sessions where date <= current_date),
    'videos', (select count(*) from public.videos),
    'eu', (
      select count(*) from public.players
       where status <> 'inactive'
         and passports && array['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
                                'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']
    )
  )
$$;
revoke execute on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;

-- ---------- Storage (privado, URLs firmadas) ---------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', false, null, array['video/*']),
  ('player-photos', 'player-photos', false, 10485760, array['image/*'])
on conflict (id) do nothing;

create policy "filial: staff ve archivos" on storage.objects
  for select to authenticated
  using (bucket_id in ('videos', 'player-photos') and (select public.is_staff()));
create policy "filial: editores suben archivos" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('videos', 'player-photos') and (select public.can_edit()));
create policy "filial: editores actualizan archivos" on storage.objects
  for update to authenticated
  using (bucket_id in ('videos', 'player-photos') and (select public.can_edit()));
create policy "filial: editores eliminan archivos" on storage.objects
  for delete to authenticated
  using (bucket_id in ('videos', 'player-photos') and (select public.can_edit()));
