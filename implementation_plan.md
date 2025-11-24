# Go Links Implementation Blueprint

## Project Overview

**Goal:** Build a self-hosted internal GoLinks management system (`go/<name>`).
**Stack:**

- **Frontend:** Angular (SPA) with TailwindCSS
- **Backend:** Spring Boot (Java 21)
- **Database:** PostgreSQL
- **Infrastructure:** Docker Compose

## High-Level Blueprint

The project will be built in the following order to ensure a stable foundation:

1.  **Project Skeleton & Infrastructure**: Set up the repo, Docker Compose, and database.
2.  **Backend Core**: Spring Boot setup, DB connection, Data Model (Entities).
3.  **Backend API (CRUD)**: Implement REST API for GoLinks using Records.
4.  **Frontend Foundation**: Angular setup, TailwindCSS configuration, and UI shell.
5.  **Frontend CRUD**: Implement Create, List, Edit, Delete views.
6.  **Redirect Logic**: Implement the core `go/<slug>` redirection in Backend.
7.  **Analytics Core**: Event tracking in Backend.
8.  **Analytics API & UI**: Endpoints for stats and Frontend visualization.
9.  **Polish & E2E**: Error handling, validation, and final integration tests.

## Iterative Chunks & Steps (Refined)

### Chunk 1: Infrastructure & Database

_Goal: Get a running PostgreSQL instance and a basic project structure._

- **Step 1.1**: Initialize Git repository and directory structure (`/backend`, `/frontend`, `/sql`).
- **Step 1.2**: Create `docker-compose.yml` with PostgreSQL service (v15).
- **Step 1.3**: Create `sql/schema.sql` with `golink` table (UUID, name, target_url, etc.).
- **Step 1.4**: Add `event` table to `schema.sql` (UUID, golink_id FK, ip_address, etc.).
- **Step 1.5**: Verify DB startup and schema initialization using `docker-compose up`.

### Chunk 2: Backend Skeleton & Entities

_Goal: Spring Boot app running and connected to DB._

- **Step 2.1**: Initialize Spring Boot project (Web, JPA, Postgres, Actuator, Validation) in `/backend`. **No Lombok**.
- **Step 2.2**: Configure `application.yml` (datasource, JPA settings) and `Dockerfile` for Backend (Java 21).
- **Step 2.3**: Update `docker-compose.yml` to include the `backend` service.
- **Step 2.4**: Create `GoLinkEntity` JPA Entity and `GoLinkRepository` (UUID PK, case-insensitive name lookup). Use standard getters/setters.
- **Step 2.5**: Create `EventEntity` JPA Entity and `EventRepository`. Use standard getters/setters.
- **Step 2.6**: Verify Backend starts, connects to DB, and exposes `/actuator/health`.

### Chunk 3: Backend CRUD API (Basic)

_Goal: Create and Read GoLinks via API._

- **Step 3.1**: Create `GoLink` Record (Java 21) to serve as the API model.
- **Step 3.2**: Implement `GoLinkService.create()` with validation (name regex, URL format, uniqueness).
- **Step 3.3**: Implement `GoLinkController.create()` (`POST /api/golinks`).
- **Step 3.4**: Implement `GoLinkService.findAll()` and `GoLinkController.getAll()` (`GET /api/golinks`).
- **Step 3.5**: Implement `GoLinkService.findById()` and `GoLinkController.getById()` (`GET /api/golinks/{id}`).

### Chunk 4: Backend CRUD API (Advanced)

_Goal: Update and Delete with Optimistic Locking._

- **Step 4.1**: Add `ETag` support to `GET /api/golinks/{id}` (using a "lock" UUID).
- **Step 4.2**: Implement `GoLinkService.update()` with `If-Match` check (Optimistic Locking).
- **Step 4.3**: Implement `GoLinkController.update()` (`PUT /api/golinks/{id}`).
- **Step 4.4**: Implement `GoLinkController.delete()` (`DELETE /api/golinks/{id}`) with cascade delete.

### Chunk 5: Frontend Foundation & List

_Goal: Angular app running and displaying data._

- **Step 5.1**: Initialize Angular CLI project in `/frontend`.
- **Step 5.2**: Install and configure **TailwindCSS**.
- **Step 5.3**: Create `Dockerfile` for Frontend (Multi-stage: Build -> Nginx).
- **Step 5.4**: Update `docker-compose.yml` to include `frontend` and configure Nginx proxy for `/api`.
- **Step 5.5**: Create `GoLink` interface and `GoLinkService` (Angular) to fetch data.
- **Step 5.6**: Create `HomeComponent` with a TailwindCSS-styled table to list GoLinks.

### Chunk 6: Frontend Create & Edit

_Goal: Full management UI._

- **Step 6.1**: Create `GoLinkFormComponent` (Reusable for Create/Edit) styled with TailwindCSS.
- **Step 6.2**: Implement "Create GoLink" page using the form and `POST` API.
- **Step 6.3**: Implement "Edit GoLink" page using the form, `GET` (for data), and `PUT` API.
- **Step 6.4**: Handle Optimistic Locking errors (409) in the UI (Show message).
- **Step 6.5**: Add "Delete" button to List/Detail with confirmation dialog.

### Chunk 7: Redirect Logic

_Goal: `http://localhost:8080/slug` redirects to target._

- **Step 7.1**: Create `RedirectController` in Backend at `/{slug}`.
- **Step 7.2**: Implement lookup logic: `slug` -> lowercase -> DB lookup.
- **Step 7.3**: Implement 302 Redirect logic (preserving query params).
- **Step 7.4**: Implement 404 behavior (return custom HTML "Not Found").

### Chunk 8: Analytics Core (Backend)

_Goal: Track clicks and serve stats._

- **Step 8.1**: Update `RedirectController` to save an `EventEntity` asynchronously (or sync for MVP) on redirect.
- **Step 8.2**: Implement `AnalyticsService.getStats(id, from, to)` (Daily aggregation).
- **Step 8.3**: Implement `AnalyticsController.getStats()` endpoint.
- **Step 8.4**: Implement `AnalyticsService.getTopLinks(from, to, limit)` and Controller endpoint.

### Chunk 9: Analytics UI (Frontend)

_Goal: Visualize stats._

- **Step 9.1**: Add "Analytics" tab/section to `GoLinkDetailComponent`.
- **Step 9.2**: Fetch and display "Total Clicks" and "Daily Clicks" (Chart or Table).
- **Step 9.3**: Create `TopLinksComponent` to show global top links.
