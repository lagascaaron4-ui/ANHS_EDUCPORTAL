# ANHS EduPortal Operations Runbook

## Daily Checks
- Verify backend health: `GET /api/health`.
- Verify metrics endpoint: `GET /api/ops/metrics` (admin/staff token required).
- Review error logs for spikes in 4xx/5xx responses.

## Deployment
1. Run backend tests: `cd backend && npm test`.
2. Deploy backend and frontend to staging.
3. Execute `STAGING_UAT_CHECKLIST_2026-02-13.md`.
4. Promote to production after sign-off.

## Backup
1. Set `MONGODB_URI` in environment.
2. Run: `cd backend && npm run backup:db`.
3. Archive generated folder from `BACKUP_DIR` (or `backend/backups` by default).

## Restore Drill
1. Use non-production target first.
2. Set `MONGODB_URI` to restore target.
3. Run: `cd backend && npm run restore:db -- <backup-folder>`.
4. Validate counts and key records after restore.

## Incident Response
1. Assign incident owner and create a timeline.
2. Capture failing endpoint, request ID, and affected role(s).
3. Mitigate impact (rollback/config update/hotfix).
4. Verify recovery via tests + targeted UAT.
5. Publish post-incident summary with root cause and prevention actions.

## Access Management
- Use least privilege for admin/staff accounts.
- Deactivate accounts immediately when personnel changes.
- Rotate secrets on schedule and after incidents.
