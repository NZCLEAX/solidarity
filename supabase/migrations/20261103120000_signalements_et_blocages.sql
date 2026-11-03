-- =========================================================
-- PULSE — Signalement de contenu et blocage d'utilisateurs
-- Exigé par l'App Store (règle 1.2, contenu généré par les utilisateurs).
--
-- À exécuter une seule fois dans Supabase :
-- Dashboard > SQL Editor > New query > coller ce script > Run.
-- Le script peut être relancé sans risque (if not exists / drop policy).
-- =========================================================

-- Rôles autorisés à traiter les signalements.
create or replace function public.pulse_est_moderateur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('moderateur', 'admin', 'administrateur')
  );
$$;

-- ---------------------------------------------------------
-- 1. Signalements de contenu
-- point_id reprend automatiquement le type de points.id (uuid ou bigint).
-- ---------------------------------------------------------
do $$
declare
  point_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into point_id_type
  from pg_attribute a
  where a.attrelid = 'public.points'::regclass
    and a.attname = 'id'
    and not a.attisdropped;

  execute format($sql$
    create table if not exists public.signalements_contenu (
      id uuid primary key default gen_random_uuid(),
      point_id %s not null references public.points(id) on delete cascade,
      signale_par uuid not null default auth.uid()
        references auth.users(id) on delete cascade,
      motif text not null check (char_length(motif) between 1 and 120),
      details text check (details is null or char_length(details) <= 500),
      statut text not null default 'ouvert'
        check (statut in ('ouvert', 'traite', 'rejete')),
      traite_par uuid references auth.users(id) on delete set null,
      traite_le timestamptz,
      created_at timestamptz not null default now()
    )
  $sql$, point_id_type);
end
$$;

create index if not exists signalements_contenu_statut_idx
  on public.signalements_contenu (statut, created_at desc);

alter table public.signalements_contenu enable row level security;

grant select, insert, update on public.signalements_contenu to authenticated;

drop policy if exists "Signaler un contenu" on public.signalements_contenu;
create policy "Signaler un contenu"
on public.signalements_contenu
for insert
to authenticated
with check (signale_par = auth.uid());

drop policy if exists "Lire ses signalements ou modérer" on public.signalements_contenu;
create policy "Lire ses signalements ou modérer"
on public.signalements_contenu
for select
to authenticated
using (signale_par = auth.uid() or public.pulse_est_moderateur());

drop policy if exists "Traiter les signalements" on public.signalements_contenu;
create policy "Traiter les signalements"
on public.signalements_contenu
for update
to authenticated
using (public.pulse_est_moderateur())
with check (public.pulse_est_moderateur());

-- ---------------------------------------------------------
-- 2. Utilisateurs bloqués
-- Chacun ne voit et ne gère que ses propres blocages.
-- ---------------------------------------------------------
create table if not exists public.utilisateurs_bloques (
  bloqueur_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  bloque_id uuid not null
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (bloqueur_id, bloque_id),
  check (bloqueur_id <> bloque_id)
);

alter table public.utilisateurs_bloques enable row level security;

grant select, insert, delete on public.utilisateurs_bloques to authenticated;

drop policy if exists "Voir ses blocages" on public.utilisateurs_bloques;
create policy "Voir ses blocages"
on public.utilisateurs_bloques
for select
to authenticated
using (bloqueur_id = auth.uid());

drop policy if exists "Bloquer un utilisateur" on public.utilisateurs_bloques;
create policy "Bloquer un utilisateur"
on public.utilisateurs_bloques
for insert
to authenticated
with check (bloqueur_id = auth.uid());

drop policy if exists "Débloquer un utilisateur" on public.utilisateurs_bloques;
create policy "Débloquer un utilisateur"
on public.utilisateurs_bloques
for delete
to authenticated
using (bloqueur_id = auth.uid());
