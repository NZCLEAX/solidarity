-- Security hardening for release/version-2
-- Sprint 1: role protection, RLS, anti-spam
-- Sprint 2: audit logging, traceability, password policy support
-- Sprint 3: security center data and least-privilege controls
-- MFA is intentionally excluded from this release branch.

create extension if not exists pgcrypto;

create or replace function public.normalize_role_label(role_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when lower(coalesce(role_value, '')) in ('administrateur', 'admin') then 'admin'
    when lower(coalesce(role_value, '')) in ('moderator', 'moderateur') then 'moderateur'
    else lower(coalesce(role_value, ''))
  end
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.normalize_role_label(p.role::text)
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_user_role() in ('moderateur', 'admin'),
    false
  )
$$;

create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid null,
  actor_email text null,
  actor_name text null,
  actor_role text null,
  action text not null,
  resource_type text null,
  resource_id text null,
  severity text not null default 'info',
  success boolean not null default true,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_audit_logs_created_at_idx
  on public.security_audit_logs (created_at desc);

create index if not exists security_audit_logs_actor_id_idx
  on public.security_audit_logs (actor_id);

create index if not exists security_audit_logs_action_idx
  on public.security_audit_logs (action);

create or replace function public.record_security_event(
  p_action text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_severity text default 'info',
  p_success boolean default true,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_email text := null;
  v_actor_name text := null;
  v_actor_role text := null;
  v_log_id uuid;
begin
  if v_actor_id is not null then
    select
      p.email,
      p.nom,
      public.normalize_role_label(p.role::text)
    into v_actor_email, v_actor_name, v_actor_role
    from public.profiles p
    where p.id = v_actor_id
    limit 1;
  end if;

  insert into public.security_audit_logs (
    actor_id,
    actor_email,
    actor_name,
    actor_role,
    action,
    resource_type,
    resource_id,
    severity,
    success,
    details
  )
  values (
    v_actor_id,
    v_actor_email,
    v_actor_name,
    v_actor_role,
    p_action,
    p_resource_type,
    p_resource_id,
    coalesce(p_severity, 'info'),
    coalesce(p_success, true),
    coalesce(p_details, '{}'::jsonb)
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_moderator_or_admin() to authenticated;
grant execute on function public.record_security_event(text, text, text, text, boolean, jsonb) to authenticated;

alter table public.security_audit_logs enable row level security;

drop policy if exists "audit_logs_select_admin_or_moderator" on public.security_audit_logs;
create policy "audit_logs_select_admin_or_moderator"
on public.security_audit_logs
for select
to authenticated
using (public.is_moderator_or_admin());

drop policy if exists "audit_logs_insert_authenticated" on public.security_audit_logs;
create policy "audit_logs_insert_authenticated"
on public.security_audit_logs
for insert
to authenticated
with check (auth.uid() is not null);

do $$
begin
  if to_regclass('public.profiles') is not null then
    execute 'alter table public.profiles enable row level security';

    execute 'drop policy if exists "profiles_select_own_or_admin" on public.profiles';
    execute '
      create policy "profiles_select_own_or_admin"
      on public.profiles
      for select
      to authenticated
      using (id = auth.uid() or public.is_moderator_or_admin())
    ';

    execute 'drop policy if exists "profiles_update_own_or_admin" on public.profiles';
    execute '
      create policy "profiles_update_own_or_admin"
      on public.profiles
      for update
      to authenticated
      using (id = auth.uid() or public.is_admin())
      with check (id = auth.uid() or public.is_admin())
    ';

    execute 'create or replace function public.prevent_role_escalation() returns trigger language plpgsql security definer set search_path = public as $fn$
    begin
      if public.normalize_role_label(new.role::text) is distinct from public.normalize_role_label(old.role::text)
         and not public.is_admin() then
        raise exception ''Role change forbidden: admin only'';
      end if;
      return new;
    end;
    $fn$';

    execute 'drop trigger if exists trg_prevent_role_escalation on public.profiles';
    execute '
      create trigger trg_prevent_role_escalation
      before update on public.profiles
      for each row
      execute function public.prevent_role_escalation()
    ';

    execute 'create or replace function public.log_profile_changes() returns trigger language plpgsql security definer set search_path = public as $fn$
    begin
      if public.normalize_role_label(new.role::text) is distinct from public.normalize_role_label(old.role::text)
         or coalesce(new.statut_compte::text, '''') is distinct from coalesce(old.statut_compte::text, '''')
         or coalesce(new.association_id::text, '''') is distinct from coalesce(old.association_id::text, '''') then
        perform public.record_security_event(
          ''profile.updated'',
          ''profile'',
          new.id::text,
          ''warning'',
          true,
          jsonb_build_object(
            ''old_role'', public.normalize_role_label(old.role::text),
            ''new_role'', public.normalize_role_label(new.role::text),
            ''old_status'', old.statut_compte::text,
            ''new_status'', new.statut_compte::text,
            ''old_association_id'', old.association_id::text,
            ''new_association_id'', new.association_id::text
          )
        );
      end if;
      return new;
    end;
    $fn$';

    execute 'drop trigger if exists trg_log_profile_changes on public.profiles';
    execute '
      create trigger trg_log_profile_changes
      after update on public.profiles
      for each row
      execute function public.log_profile_changes()
    ';
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.points') is not null then
    execute 'alter table public.points enable row level security';

    execute 'alter table public.points add column if not exists created_by uuid';
    execute 'alter table public.points add column if not exists is_sensitive boolean not null default false';

    execute 'create or replace function public.enforce_points_owner() returns trigger language plpgsql security definer set search_path = public as $fn$
    begin
      if new.created_by is null then
        new.created_by := auth.uid();
      end if;

      if auth.uid() is null then
        raise exception ''Authentication required'';
      end if;

      return new;
    end;
    $fn$';

    execute 'drop trigger if exists trg_points_owner on public.points';
    execute '
      create trigger trg_points_owner
      before insert on public.points
      for each row
      execute function public.enforce_points_owner()
    ';

    execute 'create or replace function public.enforce_points_rate_limit() returns trigger language plpgsql security definer set search_path = public as $fn$
    declare
      recent_count integer;
    begin
      if auth.uid() is null then
        raise exception ''Authentication required'';
      end if;

      select count(*)
      into recent_count
      from public.points p
      where p.created_by = auth.uid()
        and p.created_at >= now() - interval ''1 minute'';

      if recent_count >= 3 then
        raise exception ''Rate limit exceeded: max 3 signalements par minute'';
      end if;

      return new;
    end;
    $fn$';

    execute 'drop trigger if exists trg_points_rate_limit on public.points';
    execute '
      create trigger trg_points_rate_limit
      before insert on public.points
      for each row
      execute function public.enforce_points_rate_limit()
    ';

    execute 'drop policy if exists "points_select_by_role" on public.points';
    execute '
      create policy "points_select_by_role"
      on public.points
      for select
      to authenticated
      using (
        public.is_moderator_or_admin()
        or (public.current_user_role() = ''association'' and coalesce(is_sensitive, false) = false)
        or (public.current_user_role() = ''benevole'' and coalesce(is_sensitive, false) = false)
        or (created_by = auth.uid())
      )
    ';

    execute 'drop policy if exists "points_insert_authenticated" on public.points';
    execute '
      create policy "points_insert_authenticated"
      on public.points
      for insert
      to authenticated
      with check (created_by = auth.uid())
    ';

    execute 'drop policy if exists "points_update_own_or_admin" on public.points';
    execute '
      create policy "points_update_own_or_admin"
      on public.points
      for update
      to authenticated
      using (created_by = auth.uid() or public.is_admin() or public.is_moderator_or_admin())
      with check (created_by = auth.uid() or public.is_admin() or public.is_moderator_or_admin())
    ';
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.interventions') is not null then
    execute 'alter table public.interventions enable row level security';

    execute 'alter table public.interventions add column if not exists created_by uuid';
    execute 'alter table public.interventions add column if not exists assigned_to uuid';
    execute 'alter table public.interventions add column if not exists is_sensitive boolean not null default false';

    execute 'create or replace function public.enforce_intervention_owner() returns trigger language plpgsql security definer set search_path = public as $fn$
    begin
      if new.created_by is null then
        new.created_by := auth.uid();
      end if;

      if auth.uid() is null then
        raise exception ''Authentication required'';
      end if;

      return new;
    end;
    $fn$';

    execute 'drop trigger if exists trg_interventions_owner on public.interventions';
    execute '
      create trigger trg_interventions_owner
      before insert on public.interventions
      for each row
      execute function public.enforce_intervention_owner()
    ';

    execute 'drop policy if exists "interventions_select_by_role" on public.interventions';
    execute '
      create policy "interventions_select_by_role"
      on public.interventions
      for select
      to authenticated
      using (
        public.is_moderator_or_admin()
        or (public.current_user_role() = ''association'' and association_id in (
          select p.association_id
          from public.profiles p
          where p.id = auth.uid()
        ))
        or (public.current_user_role() = ''benevole'' and assigned_to = auth.uid())
        or (created_by = auth.uid())
      )
    ';

    execute 'drop policy if exists "interventions_insert_by_role" on public.interventions';
    execute '
      create policy "interventions_insert_by_role"
      on public.interventions
      for insert
      to authenticated
      with check (
        created_by = auth.uid()
        and public.current_user_role() in (''benevole'', ''association'', ''moderateur'', ''admin'')
      )
    ';

    execute 'drop policy if exists "interventions_update_by_role" on public.interventions';
    execute '
      create policy "interventions_update_by_role"
      on public.interventions
      for update
      to authenticated
      using (
        public.is_moderator_or_admin()
        or (public.current_user_role() = ''benevole'' and assigned_to = auth.uid())
        or (public.current_user_role() = ''association'' and association_id in (
          select p.association_id
          from public.profiles p
          where p.id = auth.uid()
        ))
      )
      with check (
        public.is_moderator_or_admin()
        or (public.current_user_role() = ''benevole'' and assigned_to = auth.uid())
        or (public.current_user_role() = ''association'' and association_id in (
          select p.association_id
          from public.profiles p
          where p.id = auth.uid()
        ))
      )
    ';
  end if;
end;
$$;

