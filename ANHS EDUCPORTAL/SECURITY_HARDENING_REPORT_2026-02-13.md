# Security Hardening Report (February 13, 2026)

## Completed
- Added centralized request-body validation with Zod across write endpoints.
- Added stricter auth rate limiting for:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- Kept CSRF protection for cookie-authenticated write requests.
- Added structured audit logging for successful write operations on core resources.
- Disabled `x-powered-by` header in Express.

## Existing Controls
- Helmet enabled.
- CORS allowlist policy using `CORS_ORIGIN`.
- JWT + role middleware for protected routes.
- File upload type and size restrictions.

## Remaining Recommendations
- Add dependency vulnerability scanning in CI (npm audit or SCA tool).
- Add account lockout or progressive delay for repeated failed logins.
- Add secret rotation schedule and checklist.
- Add dedicated WAF/rate limiting at edge/load balancer.
- Add automated regression tests for CSRF failure paths and invite misuse.
