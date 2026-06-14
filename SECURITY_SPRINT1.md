# Sprint 1 Security - Done

## Scope implemented in codebase

- SEC-01: Admin MFA gate in frontend session flow
- SEC-02: Role escalation guard (database trigger)
- SEC-04: Server-side signalement rate limit (database trigger)
- SEC-09: Secret hygiene baseline (env + repo safeguards)

## What to run in Supabase SQL Editor

Run:

- `supabase/migrations/20260531_sprint1_security.sql`

This enables:

- `trg_prevent_role_escalation` on `public.profiles`
- `trg_points_rate_limit` on `public.points` (3 inserts/min per user)

## Manual platform step required (SEC-03)

Login brute-force rate limiting is managed by Supabase Auth settings.
Configure it in dashboard:

1. `Authentication` -> `Rate Limits`
2. Set limits for sign-in attempts per IP/email
3. Save and test lockout behavior

## Frontend behavior

- Admin users without MFA (`AAL2`) are redirected to `/mfa-required`
- Non-admin roles are unaffected

## Secret hygiene reminders

- Keep only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Never expose `service_role` / secret keys in frontend code
- `.env` remains gitignored
