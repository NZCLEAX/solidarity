# Security Release v2

This document summarizes the security work currently integrated in `release/version-2`.

## Main changes

- Sessions are handled through a backend flow with `HttpOnly` cookies.
- Session cookies use `SameSite=Lax` and `Secure` in production.
- A CSRF token flow is enabled for state-changing requests.
- The front-end uses a local proxy to reach Supabase without exposing tokens to browser JavaScript.
- Route guards protect pages based on the connected role.
- Supabase RLS and database-side permissions remain part of the access-control layer.
- Rate limiting and anti-abuse checks are in place for sensitive actions.
- Security headers are enabled in development and a stricter CSP is reserved for preview / production.

## What is covered

- Authentication and session handling
- Role-based access control
- CSRF protection
- Basic security headers
- Anti-spam on report creation
- MFA flow for admin access
- Security audit logging structure

## What still needs attention

- Complete validation of every sensitive table policy in Supabase.
- Final production checks for CSP and HTTPS.
- Password policy hardening if required by the product team.
- Extra monitoring and alerting for security events.
- Additional rate limiting on other sensitive endpoints if the app grows.

## Notes

- The current implementation is designed for the current MVP architecture.
- If the app later becomes cross-site, the CSRF layer is already prepared for it.
- The browser can still display cookies in DevTools, but the tokens are no longer readable from front-end JavaScript.
