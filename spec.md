# go-links — MVP Specification

## 1. Project Overview

**Name:** `go-links`  
**Type:** Open-source, self-hosted internal GoLinks management and redirect system.  
**Goal:** Provide “human” short links (`go/<name>`) for internal resources (docs, dashboards, tools), to speed up navigation, improve onboarding, and provide basic usage analytics.

---

## 2. High-Level Requirements

### 2.1 Functional Goals

- Users can:

  - Create, list, view, edit, and delete GoLinks.
  - Use short URLs like `http://go/<name>` to be redirected to the target URL.
  - Search and sort GoLinks from a dashboard.
  - See basic analytics:
    - Per-GoLink: click trends and recent events.
    - Global: most-clicked GoLinks in a time period.

- No authentication or authorization in MVP:

  - Anyone who can reach the service can do anything (create/edit/delete).

- Internal DNS-based usage:
  - Typical usage: user types `go/<name>` in the browser (where `go` is a DNS name pointing to the service).

### 2.2 Non-Goals (MVP)

- No browser extension (planned for v2).
- No LDAP/SSO/auth (planned later).
- No aliasing of old slugs after rename.
- No multi-language UI (English only).
- No rate limiting, no IP-based access control.
- No soft delete (we do physical delete with cascade).

---

## 3. Architecture

### 3.1 Components

- **Frontend**

  - Angular (latest stable version at time of dev).
  - Single Page Application (SPA).
  - English-only UI, with accessibility in mind.

- **Backend**

  - Spring Boot application (Java).
  - Exposes a REST API under `/api/...`.
  - Handles redirect logic at root paths (`/slug`).
  - Serves a dedicated HTML “GoLink not found” page for unknown slugs.

- **Database**

  - PostgreSQL (primary and only supported DB for MVP).
  - UUID primary keys.
  - Stores GoLinks and click events.

- **Deployment**
  - Docker Compose with 3 services:
    - `frontend`: Angular app served via e.g. Nginx (or other static server).
    - `backend`: Spring Boot app.
    - `db`: PostgreSQL.

### 3.2 Deployment / Networking Assumptions

- Internal DNS maps `go` (or `go.company.local`) to the frontend container.
- Requests:
  - `http://go/` → Angular app (dashboard).
  - `http://go/<slug>` → backend redirect endpoint (via reverse proxy / routing).
  - `http://go/api/...` → backend REST API.

Implementation detail: use Nginx (or similar) in `frontend` container to:

- Serve Angular at `/`.
- Proxy `/api/...` and `/[slug]` to backend.

---

## 4. Configuration

### 4.1 Environment Variables (Backend)

Minimal required configuration (via env vars or Spring `application.yml`):

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Optional (can be hard-coded for MVP or added as needed):

- `SERVER_PORT` (default 8080).
- `APP_BASE_URL` (e.g. `http://go`, used if needed in any generated links).

### 4.2 Docker Compose

Root `docker-compose.yml`:

- `db`:

  - Image: `postgres:XX` (e.g. 15).
  - Env: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
  - Volume for data persistence.
  - Init script: mount `sql/schema.sql` (if using `docker-entrypoint-initdb.d`).

- `backend`:

  - Image built from `/backend` Dockerfile.
  - Env: DB vars.
  - Depends on `db`.

- `frontend`:
  - Image built from `/frontend` Dockerfile (Angular build + static server).
  - Exposes port `80` (mapped to host if needed).
  - Reverse proxy to backend for `/api/...` and `/<slug>`.

---

## 5. Data Model

All timestamps stored in **UTC** with `TIMESTAMP WITH TIME ZONE`.

### 5.1 Table: `golink`

Represents a single GoLink.

- `id` – `UUID` PK
- `name` – `VARCHAR(100)` NOT NULL, UNIQUE
  - Slug used as `go/<name>`.
  - Lowercase, case-insensitive matching.
  - Allowed chars:
    - `[a-z0-9_-]` (no spaces).
- `target_url` – `VARCHAR(2000)` NOT NULL
  - Must start with `http://` or `https://`.
- `description` – `VARCHAR(255)` NULL
- `tags` – `VARCHAR(500)` NULL
  - Comma-separated tags, no spaces inside a tag.
  - Example: `"team,backend,urgent"`.
  - Tag rules:
    - 0..N tags.
    - Each tag: max ~30 chars (enforced in validation).
    - No spaces allowed in a tag.
    - Case preserved as entered by user.
- `created_at` – `TIMESTAMP WITH TIME ZONE` NOT NULL (UTC)
- `updated_at` – `TIMESTAMP WITH TIME ZONE` NOT NULL (UTC)

**Indices:**

- `UNIQUE (name)`
- Optional index on `created_at`.

**Notes:**

- On creation, backend converts `name` to lowercase.
- Matching is **case-insensitive** (treat `DOC-TEAM` and `doc-team` as same; only lowercase stored).

### 5.2 Table: `event`

Tracks a redirect (click) on a GoLink.

- `id` – `UUID` PK
- `golink_id` – `UUID` NOT NULL
  - FK → `golink(id)`
  - `ON DELETE CASCADE`
- `created_at` – `TIMESTAMP WITH TIME ZONE` NOT NULL (UTC)
  - Timestamp of the click.
- `ip_address` – `VARCHAR(45)` NOT NULL
  - Stores full IPv4/IPv6.
- `user_agent` – `TEXT` NULL
- `referrer` – `TEXT` NULL

**Indices:**

- Index on (`golink_id`, `created_at`).

**Retention:**

- No automatic retention in MVP. All events stored indefinitely.

### 5.3 SQL Initialization

- `sql/schema.sql`:
  - Creates `golink` and `event` with above structure.
  - Creates indices and unique constraints.

---

## 6. Redirect & Routing Behavior

### 6.1 Root & Application

- `GET /`
  - Returns Angular SPA (home/dashboard).
- API endpoints under `/api/...` (see section 7).

### 6.2 Redirect Endpoint

- Path: `GET /{slug}`
  - `{slug}` is the GoLink name; no sub-paths supported in MVP.

**Slug Matching:**

- Extract first path segment as slug:
  - Valid: `/doc-team`, `/doc-team?foo=1`
  - Invalid (MVP): `/doc-team/subpage` → treated as slug `doc-team/subpage` (and will 404).
- Backend:
  - Lowercases the incoming slug.
  - Looks up `golink.name = lower(slug)`.

**If GoLink exists:**

- Register event in `event` table:
  - `golink_id`: ID of the GoLink.
  - `created_at`: now (UTC).
  - `ip_address`: client IP.
  - `user_agent`: request `User-Agent`.
  - `referrer`: request `Referer` header.
- Build final redirect URL:
  - Start from `golink.target_url`.
  - Merge query parameters:
    - If the request to `go/<name>` includes query params, **pass them through** to the target.
    - If target URL already has query params:
      - Merge sets; for conflicting keys, **values from the incoming request win**.
- Respond with:
  - Status: `302 Found`.
  - `Location: <final-merged-target-url>`.

**If GoLink doesn’t exist:**

- Respond with:
  - Status: `404 Not Found`.
  - Body: Simple HTML page “GoLink not found” (served directly by backend, not Angular).

---

## 7. REST API Specification

All responses: JSON, except for redirect & not-found HTML pages.

Timestamps in JSON: ISO 8601 in UTC, e.g. `2025-11-24T10:30:00Z`.

### 7.1 Common JSON Shapes

#### 7.1.1 GoLink JSON

Used in list and detail:

```json
{
  "id": "uuid",
  "name": "doc-team",
  "targetUrl": "https://example.com/path",
  "description": "Some description",
  "tags": ["team", "backend"],
  "createdAt": "2025-11-24T10:30:00Z",
  "updatedAt": "2025-11-24T10:45:00Z"
}
```

#### 7.1.2 Error JSON

Generic structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

Examples of error:

`VALIDATION_ERROR`
`NOT_FOUND`
`CONFLICT`
`INTERNAL_ERROR`

### 7.2 GoLinks CRUD

#### 7.2.1 GET /api/golinks

Returns all GoLinks.

Request params (MVP): none required.
Pagination is handled client-side for now; the API can return all GoLinks in one response.

Response:

```
    200 OK
    Body: GoLink[] (array of objects described above).
```

#### 7.2.2 GET /api/golinks/{id}

Returns details of a single GoLink.

Request: {id}: GoLink UUID.

Response:

```
    200 OK
    Headers:
        ETag: "<uuidLock>"
    Body: GoLink JSON.

    404 Not Found if not exists.
    Body: error JSON.
```

> Internal note: uuidLock is a field created/stored in backend; can be separate DB column or derived. For MVP, treat it as a stored UUID updated on each change.

#### 7.2.3 POST /api/golinks

Create a new GoLink.

Request body:

```json
{
  "name": "doc-team",
  "targetUrl": "https://example.com/docs",
  "description": "Docs for the team",
  "tags": ["team", "docs"]
}
```

Behavior:

    - Validate:
        - name:
            - Required, 1–100 chars.
            - Allowed chars: [a-zA-Z0-9_-].
            - Converted to lowercase before save.
            - Must be unique (case-insensitive).
        - targetUrl:
            - Required.
            - Must start with http:// or https://.
            - Max 2000 chars.
        - description:
            - Optional, max 255 chars.
        - tags:
            - Optional array of strings.
            - Each tag:
                - No spaces.
                - Max ~30 chars.
    - Store:
        - tags stored as comma-separated string (e.g. team,docs).
        - created_at, updated_at set to now (UTC).
        - Generate id and initial lock UUID.

    - Response:

```
    201 Created
    Headers:
    Location: /api/golinks/{id}
    ETag: "<uuidLock>"
    Body: full GoLink JSON (with id, timestamps, tags array).

    400 Bad Request for validation errors (with error JSON).
    409 Conflict if name already exists.
```

#### 7.2.4 PUT /api/golinks/{id}

Update an existing GoLink (full update).

Request:

```
Path: {id} GoLink UUID.
Header: If-Match: "<uuidLock>" (required for optimistic locking).
Body: same shape as POST (name, targetUrl, description, tags).
```

Behavior:

- Check existence.
- Validate If-Match:
  - If missing:
    - Return 400 Bad Request (error code MISSING_IF_MATCH).
  - If provided but not equal to current ETag:
    - Return 409 Conflict (error code CONFLICT).
- Validate fields as in POST.
- If name changed:
  - Enforce uniqueness (lowercase).
  - Old slug stops working immediately.
- Update DB:
  - updated_at = now (UTC).
  - Generate new lock UUID.

Response:

```
200 OK
Headers:
ETag: "<newUuidLock>"
Body: updated GoLink.

404 Not Found if not exists.
400 Bad Request (validation or missing If-Match).
409 Conflict (ETag mismatch or slug uniqueness conflict).
```

#### 7.2.5 DELETE /api/golinks/{id}

Delete a GoLink and its events.

Behavior:

- Physical delete:
  - DELETE from golink → cascades to event via FK ON DELETE CASCADE.
  - After delete, name becomes available for reuse.

Response:

```
204 No Content on success.
404 Not Found if id doesn’t exist.
```

## 8. Analytics API

### 8.1 Per-GoLink Stats

GET `/api/golinks/{id}/stats?from=...&to=...`

Query params:

```
from: ISO 8601 UTC, inclusive start.
to: ISO 8601 UTC, inclusive end.
Both required for MVP.
```

Behavior:

- Aggregate event rows for this golink_id where created_at in [from, to].
- Group by date (UTC day).

Response:

```
{
  "golinkId": "uuid",
  "from": "2025-11-01T00:00:00Z",
  "to": "2025-11-30T23:59:59Z",
  "totalClicks": 123,
  "daily": [
    { "date": "2025-11-01", "count": 10 },
    { "date": "2025-11-02", "count": 5 }
  ]
}
```

Errors:

- 404 Not Found if GoLink missing.
- 400 Bad Request if invalid dates.

### 8.2 Global Top GoLinks

GET `/api/analytics/top?from=...&to=...&limit=10`

Query params:

```
from, to: as above.
limit: optional, default e.g. 10.
```

Behavior:

- Aggregate event over all GoLinks between from and to.
- Sum counts per golink_id.
- Order by totalClicks DESC.
- Take top limit.

Response:

```json
{
  "from": "2025-11-01T00:00:00Z",
  "to": "2025-11-30T23:59:59Z",
  "items": [
    {
      "golinkId": "uuid",
      "name": "doc-team",
      "targetUrl": "https://example.com/doc",
      "totalClicks": 50
    }
  ]
}
```

Errors:

- 400 Bad Request if invalid dates.

### 8.3 Raw Events for a GoLink

GET `/api/golinks/{id}/events?from=...&to=...&limit=100`

Query params:

```
from, to as above.
limit: optional (e.g. default 100, max 1000).
```

Behavior:

- Fetch events for golink_id in date range.
- Order by created_at DESC.
- Limit rows.
- Mask IP address in the response (never expose full IP).

IP masking (example strategy):

- For IPv4: a.b.c.d → a.b.c.xxx.
- For IPv6: truncate after some segments.

Response:

```json
{
  "golinkId": "uuid",
  "from": "2025-11-01T00:00:00Z",
  "to": "2025-11-30T23:59:59Z",
  "events": [
    {
      "id": "uuid",
      "timestamp": "2025-11-24T10:30:00Z",
      "ipMasked": "192.168.1.xxx",
      "userAgent": "Mozilla/5.0 ...",
      "referrer": "https://example.com/page"
    }
  ]
}
```

Errors:

- 404 Not Found if GoLink missing.
- 400 Bad Request if invalid dates.

## 9. Health & Monitoring

### 9.1 Health Endpoint

GET `/actuator/health` (or `/api/health` if simpler).
Returns app and DB status.
Used by Docker/infra to check service liveness.

## 10. Frontend (Angular) Behavior

### 10.1 Pages & Navigation

#### Home (/):

- “All GoLinks” list.
- Search input (client-side full-text search).
- Table with columns:
  - Name
  - Target URL
  - Description (truncated to a certain length, e.g. ~80 chars)
  - Tags (e.g. display as small chips/badges)
  - Created At
  - Updated At
- Actions per row:
  - View / Edit (links to detail).
  - Delete (with confirmation dialog).

#### GoLink Detail (/golinks/:id):

Show GoLink info: Name, target URL (clickable), description, tags, created/updated timestamps.

Buttons: “Open”, “Copy go/<name>”, “Edit”, “Delete”.

Analytics section:

    - Period selector:
        - Last 1 day.
        - Last 7 days.
        - Last 30 days.
        - Custom (date-from, date-to).
    - Chart: Clicks per day over selected period.
    - Summary: total clicks in period.
    - Table of recent events:
        - Columns: timestamp, masked IP, user agent, referrer.
        - Limit N rows (e.g. 100).

#### Global Analytics (/analytics):

Period selector (same as above).
Table:

    - Columns: Name, Target URL, Total Clicks in period.
    - Sorted by Total Clicks DESC by default.
    - No filters, no CSV export in MVP.

### 10.2 List Behavior

Default sort: by Name ASC.
Clicking on a column header toggles sort on that column (ASC/DESC).
Pagination:

- Client-side pagination: e.g. 20 items per page.
- “Previous / Next” controls.
- All GoLinks are fetched once from backend and held in memory (assumption: not thousands).

### 10.3 Search

One input on Home:

- Client-side filter over:
  - name
  - targetUrl
  - description
  - tags
- Case-insensitive match.

### 10.4 Tag Input

On create/edit form:

- Text input with autocomplete:
  - UI builds a unique set of all existing tags by scanning loaded GoLinks’ tags arrays.
  - As user types, suggest existing tags.
  - No spaces allowed in a tag.
  - Tags shown as chips/tokens.

### 10.5 Optimistic Locking UI Flow

Detail page loads:

- GET /api/golinks/{id} → receives ETag.

When user saves changes:

- PUT /api/golinks/{id} with If-Match header.

If backend returns 409 Conflict:

- Show friendly message: resource changed by someone else.
- Offer:
  - “Reload and lose my changes” (reload from server).
- MVP: it’s enough to reload and inform user.

### 10.6 Error Handling (UI)

For known API errors:

- 400: show validation errors near fields.
- 404:
  - For detail: show “GoLink not found” page in app.
- 409:
  - Show specific optimistic locking message.

For generic errors (500, network):
Display a friendly error view with a short message (“Something went wrong”) and an image/illustration.

### 10.7 Accessibility

English-only text, but:

- Proper semantic HTML.
- Keyboard navigability.
- ARIA attributes where appropriate.
- Sufficient color contrast.

## 11. Validation Rules Summary

Backend must enforce:

- name:
  - Required, 1–100 chars.
  - Pattern: ^[A-Za-z0-9_-]+$.
  - Normalized to lowercase before save.
  - Unique.
- targetUrl:
  - Required.
  - Starts with http:// or https://.
  - Max 2000 chars.
- description:
  - Optional.
  - Max 255 chars.
- tags (API):
  - Optional array of strings.
  - Each:
    - No spaces.
    - Max ~30 chars.
  - Also: reject any redirect target that does not use http/https.

## 12. Logging

Output to stdout (for Docker).
Levels:

    - INFO:
        - App startup.
        - GoLink CRUD:
            - Created: id, name.
            - Updated: id, name.
            - Deleted: id, name.
    - ERROR:
        - Exceptions, DB errors, failed requests.

Avoid logging full IPs repeatedly if not necessary; at minimum, don’t log sensitive data beyond what’s stored.

## 13. Security (MVP)

- No authentication/authorization.
- Trust assumption: internal network only.
- No rate limiting in MVP.
- Target URLs restricted to http:// or https:// only (to avoid javascript: or other dangerous schemes).

## 14. Testing Plan

### 14.1 Backend Unit Tests

Validation tests:

- name pattern, length, uniqueness.
- targetUrl scheme validation.
- tags parsing and formatting.

Redirect logic:

- Slug case-insensitive lookup.
- 302 redirect.

Query param merge:

- No params.
- Only on target.
- Only on request.
- Both with overlaps → request wins.
- 404 when no GoLink.

Analytics:

- stats per GoLink:
  - Correct daily grouping.
  - top:
    - Correct aggregation, ordering, limit.
  - events:
    - Correct range filtering and limiting.

Optimistic locking:

- ETag changes on every update.
- If-Match missing → 400.
- If-Match mismatch → 409.

### 14.2 Backend Integration Tests

Use a test PostgreSQL instance (or container):

- CRUD flows:
  - Create → Get → Update → Delete.
- Uniqueness of name.
- Redirect endpoint:
  - Create GoLink; call /slug; check Location header, event written.
- Analytics queries:
  Seed events with known timestamps; verify stats vs expected.

### 14.3 Frontend Unit Tests

Component tests for:

- List page:
  - Sorting, pagination, search filtering.
- Detail page:
  - Form binding and validation.
  - Tag input behavior.
  - Chart rendering given sample stats data.
  - Event table display (with masked IP).
- Analytics page:
  - Period selection and table sorting.

### 14.4 End-to-End (E2E) Tests

Using Cypress or similar:

- Flow: Create GoLink → see it in list → open it in detail → edit → delete.
- Search:
  - Multiple GoLinks; verify search filters them correctly.
- Redirect:
  - Hit /slug and assert a 302 to expected target (headless browser or API-level).
- Optimistic locking scenario:
  - Simulate two parallel edits:
    - Edit A: GET detail, hold.
    - Edit B: GET detail, change & save.
    - Edit A: attempt save → expect conflict UI.

### 14.5 Docker / Deployment Tests

Run docker-compose up:

- Verify:
  - db ready and schema applied.
  - backend can connect and passes health check.
  - frontend serves Angular.
- Browser visit to http://go/ shows app.
- Visit to http://go/<slug> performs redirect.
