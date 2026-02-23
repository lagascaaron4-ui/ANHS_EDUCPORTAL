# ANHS EduPortal Backend

## Quick start
1. Copy `.env.example` to `.env` and set values.
2. Install deps: `npm install`
3. Run: `npm run dev`

## Core endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/ops/metrics` (admin/staff)

Resource CRUD (protected unless noted):
- `users` (admin)
- `students`
- `teachers`
- `classes`
- `enrollments`
- `attendance`
- `grades`
- `announcements`
- `news`
- `events`
- `admissions` (POST public)
- `contacts` (POST public)
- `programs`
- `uploads` (POST/GET admin/staff/teacher; download via protected endpoint)

Uploads are private by default and downloaded via `GET /api/uploads/:id/download`.

## Operations
- Run tests: `npm test`
- Database backup: `npm run backup:db`
- Database restore: `npm run restore:db -- <backup-folder>`
- Metrics snapshot endpoint (protected): `GET /api/ops/metrics`
