# Sprint 2 Security

## Delivered in code

- Strict client-side validation with Zod for signalements and intervention comments
- Security audit logs surfaced in Supabase and visible in the admin screen
- Audit logging for login success, logout, denied role access, validation failures, and rate limits
- CSP and security headers in `index.html` and `vite.config.ts`

## Delivered in Supabase migration

- `security_audit_logs` table with RLS
- role-change audit trigger on `profiles`

## Manual Supabase step still recommended

- Review the `security_audit_logs` policy behavior in your project after migration
- Confirm the admin MFA and auth rate limits from Sprint 1 remain enabled

## Quick validation

- Try an invalid signalement message
- Try an unauthorized route for a role
- Login/logout and check audit rows from the admin page
