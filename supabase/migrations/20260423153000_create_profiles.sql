create type public.user_role as enum (
  'citoyen',
  'benevole',
  'association',
  'moderateur',
  'administrateur'
);

create type public.account_status as enum (
  'actif',
  'inactif',
  'suspendu'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text,
  email text not null,
  role public.user_role not null default 'citoyen',
  association_id uuid,
  statut_compte public.account_status not null default 'actif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_association_id_idx on public.profiles(association_id);
create index profiles_statut_compte_idx on public.profiles(statut_compte);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
    new.email,
    coalesce(
      new.raw_user_meta_data->>'nom',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name'
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
