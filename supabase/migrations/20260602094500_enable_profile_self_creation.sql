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
  profile_name text;
  role_type text;
  role_value text;
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

  profile_name := nullif(
    trim(
      coalesce(
        auth_user.raw_user_meta_data->>'nom',
        auth_user.raw_user_meta_data->>'name',
        auth_user.raw_user_meta_data->>'full_name',
        ''
      )
    ),
    ''
  );

  select atttypid::regtype::text
  into role_type
  from pg_attribute
  where attrelid = 'public.profiles'::regclass
    and attname = 'role'
    and not attisdropped;

  if role_type is null then
    raise exception 'profiles.role column not found';
  end if;

  if exists (
    select 1
    from pg_type
    where oid = role_type::regtype
      and typtype = 'e'
  ) then
    select enumlabel
    into role_value
    from pg_enum
    where enumtypid = role_type::regtype
    order by case enumlabel
      when 'citoyen' then 1
      when 'benevole' then 2
      when 'association' then 3
      else 99
    end
    limit 1;
  else
    role_value := 'citoyen';
  end if;

  if role_value is null then
    raise exception 'No valid role value found for profiles.role';
  end if;

  execute format(
    'insert into public.profiles (id, email, nom, role, statut_compte)
     values ($1, $2, $3, $4::%s, $5)
     on conflict (id) do update
     set
       email = excluded.email,
       nom = coalesce(public.profiles.nom, excluded.nom),
       updated_at = now()
     returning *',
    role_type
  )
  using
    auth_user.id,
    coalesce(auth_user.email, ''),
    profile_name,
    role_value,
    'actif'
  into current_profile;

  return current_profile;
end;
$$;

revoke all on function public.ensure_current_profile() from public;
grant execute on function public.ensure_current_profile() to authenticated;

notify pgrst, 'reload schema';
