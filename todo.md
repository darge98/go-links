# Go Links Project Checklist

Based on `implementation_plan.md`.

## Chunk 1: Infrastructure & Database

- [x] **Step 1.1**: Initialize Git repository and directory structure (`/backend`, `/frontend`, `/sql`).
- [x] **Step 1.2**: Create `docker-compose.yml` with PostgreSQL service (v15).
- [x] **Step 1.3**: Create `sql/schema.sql` with `golink` table (UUID, name, target_url, etc.).
- [x] **Step 1.4**: Add `event` table to `schema.sql` (UUID, golink_id FK, ip_address, etc.).
- [x] **Step 1.5**: Verify DB startup and schema initialization using `docker-compose up`.

## Chunk 2: Backend Skeleton & Entities

- [x] **Step 2.1**: Initialize Spring Boot project (Web, JPA, Postgres, Actuator, Validation) in `/backend`. **No Lombok**.
- [x] **Step 2.2**: Configure `application.yml` (datasource, JPA settings) and `Dockerfile` for Backend (Java 21).
- [x] **Step 2.3**: Update `docker-compose.yml` to include the `backend` service.
- [x] **Step 2.4**: Create `GoLinkEntity` JPA Entity and `GoLinkRepository` (UUID PK, case-insensitive name lookup). Use standard getters/setters.
- [x] **Step 2.5**: Create `EventEntity` JPA Entity and `EventRepository`. Use standard getters/setters.
- [x] **Step 2.6**: Verify Backend starts, connects to DB, and exposes `/actuator/health`.

## Chunk 3: Backend CRUD API (Basic)

- [x] **Step 3.1**: Create `GoLink` Record (Java 21) to serve as the API model.
- [x] **Step 3.2**: Implement `GoLinkService.create()` with validation (name regex, URL format, uniqueness).
- [x] **Step 3.3**: Implement `GoLinkController.create()` (`POST /api/golinks`).
- [x] **Step 3.4**: Implement `GoLinkService.findAll()` and `GoLinkController.getAll()` (`GET /api/golinks`).
- [x] **Step 3.5**: Implement `GoLinkService.findById()` and `GoLinkController.getById()` (`GET /api/golinks/{id}`).

## Chunk 4: Backend CRUD API (Advanced)

- [x] **Step 4.1**: Add `ETag` support to `GET /api/golinks/{id}` (using a "lock" UUID).
- [x] **Step 4.2**: Implement `GoLinkService.update()` with `If-Match` check (Optimistic Locking).
- [x] **Step 4.3**: Implement `GoLinkController.update()` (`PUT /api/golinks/{id}`).
- [x] **Step 4.4**: Implement `GoLinkController.delete()` (`DELETE /api/golinks/{id}`) with cascade delete.

## Chunk 5: Frontend Foundation & List

- [x] **Step 5.1**: Initialize Angular CLI project in `/frontend`.
- [x] **Step 5.2**: Install and configure **TailwindCSS**.
- [x] **Step 5.3**: Create `Dockerfile` for Frontend (Multi-stage: Build -> Nginx).
- [x] **Step 5.4**: Update `docker-compose.yml` to include `frontend` and configure Nginx proxy for `/api`.
- [x] **Step 5.5**: Create `GoLink` interface and `GoLinkService` (Angular) to fetch data.
- [x] **Step 5.6**: Create `HomeComponent` with a TailwindCSS-styled table to list GoLinks.

## Chunk 6: Frontend Create & Edit

- [x] **Step 6.1**: Create `GoLinkFormComponent` (Reusable for Create/Edit) styled with TailwindCSS.
- [x] **Step 6.2**: Implement "Create GoLink" page using the form and `POST` API.
- [x] **Step 6.3**: Implement "Edit GoLink" page using the form, `GET` (for data), and `PUT` API.
- [x] **Step 6.4**: Handle Optimistic Locking errors (409) in the UI (Show message).
- [x] **Step 6.5**: Add "Delete" button to List/Detail with confirmation dialog.

## Chunk 7: Redirect Logic

- [x] **Step 7.1**: Create `RedirectController` in Backend at `/{slug}`.
- [x] **Step 7.2**: Implement lookup logic: `slug` -> lowercase -> DB lookup.
- [x] **Step 7.3**: Implement 302 Redirect logic (preserving query params).
- [x] **Step 7.4**: Implement 404 behavior (return custom HTML "Not Found").

## Chunk 8: Analytics Core (Backend)

- [x] **Step 8.1**: Update `RedirectController` to save an `EventEntity` asynchronously (or sync for MVP) on redirect.
- [x] **Step 8.2**: Implement `AnalyticsService.getStats(id, from, to)` (Daily aggregation).
- [x] **Step 8.3**: Implement `AnalyticsController.getStats()` endpoint.
- [x] **Step 8.4**: Implement `AnalyticsService.getTopLinks(from, to, limit)` and Controller endpoint.

## Chunk 9: Analytics UI (Frontend)

- [x] **Step 9.1**: Add "Analytics" tab/section to `GoLinkDetailComponent`.
- [x] **Step 9.2**: Fetch and display "Total Clicks" and "Daily Clicks" (Chart or Table).
- [x] **Step 9.3**: Create `TopLinksComponent` to show global top links.
