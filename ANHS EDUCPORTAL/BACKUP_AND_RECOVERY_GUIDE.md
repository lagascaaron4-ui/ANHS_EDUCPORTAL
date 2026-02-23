# Backup and Recovery Guide

## Prerequisites
- MongoDB Database Tools installed (`mongodump`, `mongorestore`).
- `MONGODB_URI` set to target database.

## Create Backup
1. `cd backend`
2. Optional: set `BACKUP_DIR` for output location.
3. Run `npm run backup:db`
4. Store generated backup folder securely.

## Restore Backup
1. `cd backend`
2. Set `MONGODB_URI` to restore target.
3. Run `npm run restore:db -- <backup-folder>`
4. Verify key data after restore.

## Recommended Cadence
- Daily automated backup.
- Weekly restore drill on a staging clone.
- Monthly verification of retention policy and storage health.

## Recovery Targets
- Suggested RPO: 24 hours.
- Suggested RTO: 4 hours.
