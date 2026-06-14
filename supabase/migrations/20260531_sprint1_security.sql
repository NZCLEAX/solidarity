-- Sprint 1 security hardening
-- SEC-02: prevent role escalation (only admin can change role)
-- SEC-04: backend rate limit for signalements (points inserts)

-- 1) Helper role function (safe re-create)
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
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
  select coalesce(public.current_user_role() = 'admin'::public.app_role, false)
$$;

-- 2) Role escalation protection
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Role change forbidden: admin only';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
before update on public.profiles
for each row
execute function public.prevent_role_escalation();

-- 3) Backend anti-spam for points (3 inserts per minute per authenticated user)
create or replace function public.enforce_points_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select count(*)
  into recent_count
  from public.points p
  where p.created_by = auth.uid()
    and p.created_at >= now() - interval '1 minute';

  if recent_count >= 3 then
    raise exception 'Rate limit exceeded: max 3 signalements par minute';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_points_rate_limit on public.points;
create trigger trg_points_rate_limit
before insert on public.points
for each row
execute function public.enforce_points_rate_limit();
