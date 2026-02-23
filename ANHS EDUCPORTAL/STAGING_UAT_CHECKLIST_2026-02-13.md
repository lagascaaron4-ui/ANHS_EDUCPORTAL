# Staging UAT Checklist (February 13, 2026)

## Goal
Validate role-based portal behavior in a deployed staging environment before public launch.

## Preconditions
- Staging frontend and backend deployed with production-like env vars.
- Seed accounts created for: `admin`, `staff`, `teacher`, `student`, `parent`.
- Sample records loaded: students, classes, schedules, grades, announcements, admissions.

## Role Flow Tests
- [ ] Admin login, dashboard load, users CRUD, announcements/news/events CRUD.
- [ ] Staff login, teachers/students listing, admissions/contacts review.
- [ ] Teacher login, assignments CRUD, submissions grading, attendance/grade entry.
- [ ] Student login, `my` schedule/grades/attendance visibility, assignment submit.
- [ ] Parent login, profile update, parent-link request, parent-messages send/read.

## Cross-Role Authorization Tests
- [ ] Student denied access to `/api/users`.
- [ ] Teacher denied access to `/api/teachers` management route.
- [ ] Admin allowed access to `/api/users`.
- [ ] Staff allowed access to `/api/teachers` list.
- [ ] Anonymous user blocked on protected endpoints.

## Public Flow Tests
- [ ] Admissions form submission works without login.
- [ ] Contact form submission works without login.

## Security Tests
- [ ] CSRF failures return 403 on cookie-auth writes.
- [ ] Login/register are rate-limited after repeated attempts.
- [ ] CORS only allows approved staging frontend origin.
- [ ] Upload restrictions block unsupported file types.

## Observability and Ops
- [ ] `/api/ops/metrics` available for admin/staff and blocked for anonymous users.
- [ ] Structured logs contain `requestId`.
- [ ] Backup script test run successful.
- [ ] Restore drill test run successful on staging clone.

## Exit Criteria
- [ ] No high-severity defects open.
- [ ] Medium defects accepted with mitigation plan.
- [ ] Product owner and engineering lead sign-off recorded.
