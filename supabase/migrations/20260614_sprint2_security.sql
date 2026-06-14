-- Sprint 2 security hardening
-- SEC-05: strict validation support + auditability
-- SEC-06: security audit logs
-- SEC-07: security headers are handled in the frontend config, but this migration
--          provides the database audit trail that complements them.

create extension if not exists pgcrypto;

-- Security audit trail
create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null references auth.users (id) on delete set null,
  actor_email text null,
  actor_role public.app_role null,
  target_user_id uuid null references auth.users (id) on delete set null,
  action text not null,
  resource text null,
  outcome text not null default 'success',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.security_audit_logs enable row level security;

drop policy if exists "security_audit_logs_select_moderator_or_admin" on public.security_audit_logs;
create policy "security_audit_logs_select_moderator_or_admin"
on public.security_audit_logs
for select
to authenticated
using (
  public.current_user_role() in (
    'moderateur'::public.app_role,
    'admin'::public.app_role
  )
);

drop policy if exists "security_audit_logs_insert_authenticated" on public.security_audit_logs;
create policy "security_audit_logs_insert_authenticated"
on public.security_audit_logs
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
);

drop policy if exists "security_audit_logs_delete_admin_only" on public.security_audit_logs;
create policy "security_audit_logs_delete_admin_only"
on public.security_audit_logs
for delete
to authenticated
using (public.is_admin());

-- Audit role changes on profiles
create or replace function public.audit_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    insert into public.security_audit_logs (
      actor_user_id,
      actor_email,
      actor_role,
      target_user_id,
      action,
      resource,
      outcome,
      details
    )
    values (
      auth.uid(),
      coalesce(auth.jwt() ->> 'email', new.email),
      public.current_user_role(),
      new.id,
      'profile.role.changed',
      'profiles',
      'success',
      jsonb_build_object(
        'old_role',
        old.role,
        'new_role',
        new.role
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_audit_profile_role_change on public.profiles;
create trigger trg_audit_profile_role_change
after update on public.profiles
for each row
execute function public.audit_profile_role_change();
