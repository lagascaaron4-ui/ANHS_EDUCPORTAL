# ANHS School Portal Product Roadmap (MVP -> V2 -> V3)

## Current State (as of February 13, 2026)
- Backend already has role-aware routes for students, teachers, parents, admin, and staff.
- Core academic modules exist: enrollments, attendance, grades, schedule, assignments.
- Communication modules exist: announcements, news, events, parent messages.
- Security baseline exists: JWT + cookie auth, CSRF middleware, helmet, rate limit, role middleware.
- Gaps: no project test suite, no `npm test` script, no observability/backup automation, and some endpoint behavior/docs are inconsistent.

## Product Goal
Deliver a reliable Junior High School (Grades 7-10) portal that supports daily operations for admin, teachers, students, and parents before adding advanced automation.

## Phase 1: MVP Stabilization (4-6 weeks)

### Scope
1. Lock role-based dashboards and navigation for `admin`, `teacher`, `student`, `parent`, `staff`.
2. Complete day-to-day workflows:
- Attendance taking and student attendance view.
- Grade encoding and student grade view.
- Class schedule management and student schedule view.
- Enrollment and student record maintenance.
3. Communication baseline:
- Announcements/events/news read flows.
- Parent-teacher messaging basic inbox/reply.
4. Security and reliability hardening:
- Password reset flow verification.
- Input validation consistency for all write endpoints.
- Central audit log for sensitive actions (create/update/delete for core records).
5. JHS-only data cleanup (remove remaining SHS content flagged in `TODO.md`).

### Engineering Deliverables
- Add backend test stack (Jest or Vitest + supertest) and create smoke tests for auth + critical routes.
- Add `npm test` script in `backend/package.json` so `.github/workflows/ci.yml` can pass.
- Define and enforce API contract for currently inconsistent endpoints (for example whether admissions/contacts are public or authenticated).
- Create seed script for initial roles/users/classes.

### MVP Exit Criteria
- 95% of core flows (login, attendance, grades, schedule, enrollment, announcements) pass UAT.
- CI green on every PR (install + tests).
- Zero high-severity auth/authorization issues in internal testing.

## Phase 2: Operations + Parent Experience (4-5 weeks)

### Scope
1. Parent module expansion:
- Parent-student link approval workflow in admin/teacher UI.
- Parent summary page: attendance trend, grade snapshot, announcements/events.
2. Teacher productivity:
- Assignment publishing + submission grading UX improvements.
- Bulk grade/attendance import (CSV) with validation report.
3. Admin operations:
- Dashboard KPIs by grade level, section, and term.
- Export reports (CSV/PDF-ready JSON) for attendance and grades.
4. Notification layer:
- Email notifications for major events (new announcement, parent message, overdue assignment).

### Engineering Deliverables
- Background job mechanism for email + recurring tasks.
- Audit log browsing endpoint and admin page.
- Pagination/filtering standardization for list endpoints.

### V2 Exit Criteria
- Parents can self-serve student progress without staff intervention for routine requests.
- Teachers can complete weekly grading/attendance tasks faster than manual spreadsheet workflow.
- Admin can export required reports without direct database access.

## Phase 3: Scale, Governance, and Smart Features (5-8 weeks)

### Scope
1. Data governance:
- Backup/restore automation and tested recovery runbook.
- Data retention policies and archival for old terms.
2. Advanced analytics:
- At-risk student indicators (attendance + grade thresholds).
- Cohort and section performance trends.
3. Integrations:
- SMS gateway for urgent alerts.
- Optional LMS/payment/identity integration depending on school policy.
4. Non-functional upgrades:
- Performance tuning, caching strategy, and query indexing review.
- SLOs: uptime, API latency, error budgets.

### Engineering Deliverables
- Production monitoring stack (error tracking + API metrics + uptime checks).
- Incident response checklist and role ownership.
- Security review cycle (dependency, auth, and permission audits).

### V3 Exit Criteria
- Recovery drill succeeds within agreed RTO/RPO.
- Decision-makers can use analytics for intervention planning.
- Platform remains stable under expected enrollment growth.

## Immediate Next Sprint (start here)
1. Implement backend test harness and add `npm test` script.
2. Resolve admissions/contacts auth policy and align docs + frontend behavior.
3. Finish JHS-only content cleanup from `TODO.md`.
4. Add audit logging for core record mutations.
5. Run end-to-end MVP UAT checklist and log defects by severity.

## Suggested Ownership
- Product/School Admin: scope acceptance and policy decisions.
- Backend Lead: security, API contracts, data integrity.
- Frontend Lead: role dashboards, workflow UX, accessibility.
- QA: UAT scripts, regression runs, release sign-off.
