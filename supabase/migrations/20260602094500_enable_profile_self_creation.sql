create or replace function public.ensure_current_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  auth_user auth.users%rowtype;
  current_profile public.profiles;
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select *
  into auth_user
  from auth.users
  where id = current_user_id;

  if not found then
    raise exception 'Authenticated user not found' using errcode = '28000';
  end if;

  insert into public.profiles (id, email, nom)
  values (
    auth_user.id,
    coalesce(auth_user.email, ''),
    nullif(
      trim(
        coalesce(
          auth_user.raw_user_meta_data->>'nom',
          auth_user.raw_user_meta_data->>'name',
          auth_user.raw_user_meta_data->>'full_name',
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
    updated_at = now()
  returning *
  into current_profile;

  return current_profile;
end;
$$;

revoke all on function public.ensure_current_profile() from public;
grant execute on function public.ensure_current_profile() to authenticated;

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
