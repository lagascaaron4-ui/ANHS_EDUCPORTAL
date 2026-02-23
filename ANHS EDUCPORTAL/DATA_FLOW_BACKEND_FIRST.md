# ANHS EduPortal Backend-First Data Flow

## Source Of Truth
- All school/business data must come from MongoDB via backend APIs.
- Frontend must not persist business records in browser storage.
- Frontend auth is cookie-based with backend session validation.

## Request Flow
1. User action in page UI.
2. Page script calls `window.API` (`ANHS EDUCPORTAL/js/api.js`).
3. `API.request()` sends HTTP request to backend (`/api/...`) with:
   - `credentials: 'include'`
   - `Authorization: Bearer <token>` when present
4. Express routes validate auth/role middleware.
5. Controllers read/write Mongoose models.
6. MongoDB stores final state.
7. Backend returns JSON.
8. Frontend renders response; no business data cache is written locally.

## Auth Flow
1. Login/Register returns `{ user, token }`.
2. Backend also sets `anhs_token` HTTP-only cookie.
3. Frontend hydrates current user from `GET /api/auth/me`.
4. Protected backend requests accept either Bearer token or `anhs_token` cookie.
5. `POST /api/auth/logout` clears cookie.

## CSRF Flow
- Backend issues a readable CSRF cookie: `anhs_csrf`.
- Frontend gets token from:
  - login/register response, or
  - `GET /api/auth/csrf`
- Frontend sends `x-csrf-token` for state-changing API calls.
- Backend middleware validates cookie token equals header token for cookie-auth write requests.

## UI Preferences Flow
- User UI preferences are stored in `User.preferences` in MongoDB.
- API endpoints:
  - `GET /api/auth/preferences`
  - `PUT /api/auth/preferences`
- Dark mode, high contrast, and remember-user values now sync through backend DB.

## Enrollment Draft Flow
- Draft autosave is server-only (`/api/enrollments/drafts...`).
- Local draft payload persistence was removed.
- Draft ID is kept in-memory during active session.

## Files Updated For Backend-First Behavior
- `ANHS EDUCPORTAL/js/api.js`
- `ANHS EDUCPORTAL/js/includes.js`
- `ANHS EDUCPORTAL/js/dashboard.js`
- `ANHS EDUCPORTAL/js/file-upload.js`
- `ANHS EDUCPORTAL/js/enrollment.js`
- `ANHS EDUCPORTAL/backend/src/controllers/auth.js`
- `ANHS EDUCPORTAL/backend/src/middleware/auth.js`
- `ANHS EDUCPORTAL/backend/src/routes/auth.js`
