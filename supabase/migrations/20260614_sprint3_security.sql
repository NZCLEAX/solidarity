-- Sprint 3 security hardening
-- SEC-10: admin MFA / 2FA posture and auditability
-- SEC-11: password policy controls
-- SEC-12: security log retention and cleanup
-- SEC-13: data minimization policy settings
-- SEC-14: sensitive API hardening knobs
-- SEC-15: final security audit support

create extension if not exists pgcrypto;

-- Central security settings for the app
create table if not exists public.security_settings (
  id boolean primary key default true check (id),
  admin_2fa_required boolean not null default true,
  password_min_length integer not null default 12,
  password_require_uppercase boolean not null default true,
  password_require_number boolean not null default true,
  password_require_symbol boolean not null default true,
  security_audit_log_retention_days integer not null default 90,
  report_rate_limit_per_minute integer not null default 3,
  sensitive_api_rate_limit_per_minute integer not null default 30,
  data_minimization_note text not null default 'least privilege enforced by role and route guards',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.security_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function public.touch_security_settings_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_security_settings_updated_at on public.security_settings;
create trigger trg_touch_security_settings_updated_at
before update on public.security_settings
for each row
execute function public.touch_security_settings_updated_at();

alter table public.security_settings enable row level security;

drop policy if exists "security_settings_select_admin_only" on public.security_settings;
create policy "security_settings_select_admin_only"
on public.security_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "security_settings_update_admin_only" on public.security_settings;
create policy "security_settings_update_admin_only"
on public.security_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.purge_old_security_audit_logs(p_retention_days integer default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  retention_days integer;
  deleted_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select coalesce(
    p_retention_days,
    (select s.security_audit_log_retention_days from public.security_settings s where s.id = true limit 1),
    90
  )
  into retention_days;

  if retention_days < 1 then
    retention_days := 1;
  end if;

  delete from public.security_audit_logs
  where created_at < now() - make_interval(days => retention_days);

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

-- Keep a small audit trail for retention and policy changes
drop policy if exists "security_audit_logs_select_moderator_or_admin" on public.security_audit_logs;
drop policy if exists "security_audit_logs_select_admin_only" on public.security_audit_logs;
create policy "security_audit_logs_select_admin_only"
on public.security_audit_logs
for select
to authenticated
using (public.is_admin());
