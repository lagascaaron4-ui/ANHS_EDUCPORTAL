# Launch Day Checklist

## Scope
Use this checklist to run ANHS EduPortal production go-live in a controlled, auditable way.

## Roles
- Release Lead: Coordinates timeline and go/no-go.
- Backend Lead: API, database, env vars, security checks.
- Frontend Lead: UI deploy and smoke tests.
- QA Lead: UAT evidence and defect verification.
- Incident Lead: Handles launch incidents and escalation.

## T-24h: Pre-Launch Freeze
- [ ] Code freeze announced and merged to release branch.
- [ ] Backend tests pass: `cd backend && npm test`.
- [ ] Staging is updated with release candidate.
- [ ] `STAGING_UAT_CHECKLIST_2026-02-13.md` fully executed.
- [ ] No open high-severity defects.

## T-12h: Infrastructure Readiness
- [ ] Production env vars verified:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `CORS_ORIGIN`
  - [ ] `UPLOAD_DIR`
  - [ ] `PUBLIC_UPLOADS`
  - [ ] `MAX_UPLOAD_SIZE_BYTES`
- [ ] HTTPS/TLS and domain routing verified.
- [ ] Database access reviewed for least privilege.

## T-8h: Security Gate
- [ ] Role boundaries validated (admin/staff/teacher/student/parent).
- [ ] Login/register rate limiting validated.
- [ ] CSRF checks validated on cookie-auth writes.
- [ ] Unsupported upload types rejected.

## T-6h: Backup and Recovery Gate
- [ ] Backup executed: `cd backend && npm run backup:db`.
- [ ] Backup artifact stored in approved location.
- [ ] Restore drill run on staging clone:
  - [ ] `cd backend && npm run restore:db -- <backup-folder>`
  - [ ] Key data integrity verified after restore.
- [ ] Recovery metrics recorded:
  - [ ] Actual RTO: `__________`
  - [ ] Actual RPO: `__________`

## T-4h: Observability Gate
- [ ] `GET /api/health` returns success.
- [ ] `GET /api/ops/metrics` verified with admin/staff account.
- [ ] Uptime monitor enabled.
- [ ] Alert channels configured and tested.
- [ ] Logs include request IDs.

## T-2h: Go/No-Go Decision
- [ ] UAT evidence reviewed.
- [ ] Security checks reviewed.
- [ ] Backup/restore checks reviewed.
- [ ] Rollback plan reviewed and approved.
- [ ] Decision captured:
  - [ ] GO
  - [ ] NO-GO
- [ ] Approvals:
  - [ ] Product Owner
  - [ ] Engineering Lead
  - [ ] QA Lead

## T-0: Production Deployment
- [ ] Backend deployed.
- [ ] Frontend deployed.
- [ ] Immediate smoke tests passed:
  - [ ] Login
  - [ ] Role dashboard load
  - [ ] Admissions submission (public)
  - [ ] Contact submission (public)
  - [ ] One protected admin action

## T+2h to T+24h: Hypercare
- [ ] Monitor errors, latency, and auth failures every 30-60 minutes.
- [ ] Record incidents and mitigations in runbook.
- [ ] Share status updates with stakeholders.

## T+24h: Launch Closure
- [ ] Publish launch summary (results, incidents, actions).
- [ ] Create follow-up tickets for medium/low issues.
- [ ] Remove release freeze after stability confirmation.

## Rollback Plan (Required)
- [ ] Previous stable backend release identified.
- [ ] Previous stable frontend artifact identified.
- [ ] DB rollback strategy documented (restore point + owner).
- [ ] Rollback communication template prepared.

## Sign-Off
- Release Lead: `________________` Date: `________________`
- Backend Lead: `_______________` Date: `________________`
- Frontend Lead: `______________` Date: `________________`
- QA Lead: `___________________` Date: `________________`
- Incident Lead: `______________` Date: `________________`
