do $$
begin
  create type public.user_role as enum (
    'citoyen',
    'benevole',
    'association',
    'moderateur',
    'administrateur'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.account_status as enum (
    'actif',
    'inactif',
    'suspendu'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key,
  nom text,
  email text,
  role public.user_role not null default 'citoyen',
  association_id uuid,
  statut_compte public.account_status not null default 'actif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists nom text,
  add column if not exists email text,
  add column if not exists role public.user_role not null default 'citoyen',
  add column if not exists association_id uuid,
  add column if not exists statut_compte public.account_status not null default 'actif',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id
  and (profile.email is null or profile.email = '');

update public.profiles
set email = ''
where email is null;

update public.profiles
set role = 'citoyen'
where role is null;

update public.profiles
set statut_compte = 'actif'
where statut_compte is null;

alter table public.profiles
  alter column email set not null,
  alter column role set default 'citoyen',
  alter column role set not null,
  alter column statut_compte set default 'actif',
  alter column statut_compte set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_pkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_pkey primary key (id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id)
      references auth.users(id)
      on delete cascade;
  end if;
end;
$$;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_association_id_idx on public.profiles(association_id);
create index if not exists profiles_statut_compte_idx on public.profiles(statut_compte);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'citoyen'
  and statut_compte = 'actif'
  and association_id is null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nom)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data->>'nom',
          new.raw_user_meta_data->>'name',
          new.raw_user_meta_data->>'full_name',
          ''
        )
      ),
      ''
    )
  )
  on conflict (id) do update
  set
    email = excluded.email,
    nom = coalesce(public.profiles.nom, excluded.nom),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
