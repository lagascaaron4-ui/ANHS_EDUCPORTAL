# ANHS EduPortal Data Flow Illustration

## 1) Context-Level Data Flow (High Level)
```mermaid
flowchart LR
    U[Users<br/>Student / Parent / Teacher / Admin / Staff]
    FE[Frontend Pages<br/>HTML + JS + API Client]
    BE[Backend API<br/>Express Routes + Middleware]
    DB[(MongoDB)]
    FS[(File Storage<br/>Uploads Directory)]

    U -->|Login / Forms / Actions| FE
    FE -->|HTTPS Requests + Cookies + CSRF Header| BE
    BE -->|JSON Responses| FE
    FE -->|Rendered UI| U

    BE <--> |Read/Write| DB
    BE <--> |Upload/Download| FS
```

## 2) Backend-First Detailed Flow
```mermaid
flowchart TD
    A[User Action<br/>click submit / load page / update profile]
    B[Frontend API Client<br/>js/api.js]
    C{Method Type}
    D[GET/HEAD/OPTIONS]
    E[POST/PUT/PATCH/DELETE]

    F[Attach credentials: include]
    G[Ensure CSRF Token<br/>from /api/auth/csrf or login/me response]
    H[Attach x-csrf-token header]

    I[Express App<br/>helmet + cors + rateLimit]
    J[CSRF Middleware]
    K[Auth Middleware<br/>Bearer or anhs_token cookie]
    L[Role Middleware]
    M[Route Handler / Controller]
    N[(MongoDB Collections)]
    O[(Uploads Storage)]
    P[JSON Response]
    Q[Frontend UI Update]

    A --> B
    B --> C
    C --> D
    C --> E

    D --> F
    E --> F
    E --> G --> H

    F --> I
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    M --> O
    N --> M
    O --> M
    M --> P
    P --> B
    B --> Q
```

## 3) Authentication + Session Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Submit login/register
    Frontend->>Backend: POST /api/auth/login or /register
    Backend->>DB: Validate/create user
    Backend-->>Frontend: user + token + csrfToken\nSet-Cookie: anhs_token, anhs_csrf

    Frontend->>Backend: GET /api/auth/me (credentials include)
    Backend->>DB: Load current user by token
    Backend-->>Frontend: user + csrfToken

    Frontend->>Backend: POST/PUT/PATCH/DELETE + x-csrf-token
    Backend->>Backend: CSRF check + auth + role check
    Backend->>DB: Perform operation
    Backend-->>Frontend: Result JSON
```

## 4) Core Data Stores (Current)
- `users` (includes role + UI preferences)
- `students`
- `parents`
- `teachers`
- `classes`
- `enrollments`
- `grades`
- `attendance`
- `assignments` and `assignmentsubmissions`
- `announcements`, `news`, `events`, `programs`
- `invites`, `parentlinks`, `parentmessages`
- uploads directory for files (metadata in DB, binary on storage)

## 5) Notes
- Business and profile data are backend/database driven.
- UI preferences are persisted in backend user preferences.
- Browser storage for business data is removed.
- CSRF is enforced for cookie-auth state-changing requests.
