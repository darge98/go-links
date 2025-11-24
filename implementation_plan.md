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

## Prompt Sequence

### Prompt 1: Infrastructure Setup

```text
You are an expert DevOps engineer.
Task: Initialize the project infrastructure for "go-links".

1. Create a root directory structure:
   - /backend (empty for now)
   - /frontend (empty for now)
   - /sql

2. Create `sql/schema.sql` for PostgreSQL.
   - Table `golink`:
     - id: UUID (PK)
     - name: VARCHAR(100), Unique, Not Null
     - target_url: VARCHAR(2000), Not Null
     - description: VARCHAR(255)
     - tags: VARCHAR(500)
     - created_at: TIMESTAMP WITH TIME ZONE
     - updated_at: TIMESTAMP WITH TIME ZONE
   - Table `event`:
     - id: UUID (PK)
     - golink_id: UUID (FK to golink.id, ON DELETE CASCADE)
     - created_at: TIMESTAMP WITH TIME ZONE
     - ip_address: VARCHAR(45)
     - user_agent: TEXT
     - referrer: TEXT
   - Add indices: Unique on `golink(name)`, Index on `event(golink_id, created_at)`.

3. Create a `docker-compose.yml` file in the root.
   - Service `db`:
     - Image: postgres:15
     - Environment: POSTGRES_DB=golinks, POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres
     - Volumes: db_data:/var/lib/postgresql/data
     - Init script: Mount `./sql/schema.sql` to `/docker-entrypoint-initdb.d/schema.sql`
   - Define volume `db_data`.

Output the content of `sql/schema.sql` and `docker-compose.yml`.
```

### Prompt 2: Backend Skeleton

```text
You are an expert Java Spring Boot developer.
Task: Initialize the Backend application.

1. Create a standard Spring Boot 3.x application in `/backend`.
   - Dependencies: Web, Data JPA, PostgreSQL Driver, Actuator, Validation.
   - **Important**: Do NOT use Lombok. Use standard getters/setters.
   - Java Version: 21.

2. Create `backend/Dockerfile`.
   - Use a multi-stage build (Maven/Gradle) or a simple OpenJDK 21 image.
   - Expose port 8080.

3. Configure `backend/src/main/resources/application.yml`.
   - DataSource: Connect to the `db` service defined in docker-compose (url: jdbc:postgresql://db:5432/golinks).
   - JPA: Show SQL (false), Hibernate ddl-auto (validate or none, since we use schema.sql).

4. Update `docker-compose.yml` to include the `backend` service.
   - Build context: ./backend
   - Ports: 8080:8080
   - Environment: DB_HOST=db, DB_PORT=5432, DB_NAME=golinks, DB_USER=postgres, DB_PASSWORD=postgres
   - Depends on: db

Output the `Dockerfile`, `application.yml`, and the updated `docker-compose.yml` snippet.
```

### Prompt 3: Backend Entities

```text
You are an expert Java Spring Boot developer.
Task: Implement the Data Model.

1. Create the `GoLinkEntity` Class in `com.example.golinks.model`.
   - Map to table `golink`.
   - Fields: id (UUID), name, targetUrl, description, tags, createdAt, updatedAt.
   - Annotations: @Entity, @Table, @Id, @Column.
   - Ensure `name` is unique.
   - **No Lombok**: Generate standard getters, setters, and constructors.

2. Create the `EventEntity` Class in `com.example.golinks.model`.
   - Map to table `event`.
   - Fields: id (UUID), goLink (ManyToOne), createdAt, ipAddress, userAgent, referrer.
   - **No Lombok**: Generate standard getters, setters, and constructors.

3. Create Repositories in `com.example.golinks.repository`.
   - `GoLinkRepository` extends JpaRepository<GoLinkEntity, UUID>.
     - Add method: `Optional<GoLinkEntity> findByName(String name);`
   - `EventRepository` extends JpaRepository<EventEntity, UUID>.

Output the Entity classes and Repository interfaces.
```

### Prompt 4: Backend CRUD (Create & Read)

```text
You are an expert Java Spring Boot developer.
Task: Implement Basic CRUD for GoLinks.

1. Create `GoLink` Record (Java 21).
   - Fields: UUID id, String name, String targetUrl, String description, List<String> tags, Instant createdAt.
   - This serves as the API model.

2. Create `GoLinkService`.
   - Method `create(GoLink input)`:
     - Validate: name (regex `^[a-z0-9_-]+$`), targetUrl (http/https).
     - Convert name to lowercase.
     - Check uniqueness (throw exception if exists).
     - Map Record -> Entity.
     - Save to DB.
     - Return `GoLink` Record.
   - Method `findAll()`: Return `List<GoLink>`.
   - Method `findById(UUID id)`: Return `GoLink` or throw NotFound.

3. Create `GoLinkController` (`/api/golinks`).
   - `POST /`: Call create, return 201 Created.
   - `GET /`: Call findAll.
   - `GET /{id}`: Call findById.

4. Add Global Exception Handler for:
   - Validation errors (400).
   - Not Found (404).
   - Conflict (409 - name already exists).

Output the Record, Service, Controller, and Exception Handler.
```

### Prompt 5: Backend CRUD (Update & Delete)

```text
You are an expert Java Spring Boot developer.
Task: Implement Update and Delete with Optimistic Locking.

1. Update `GoLink` Record and `GoLinkEntity` to include a "lock" field (e.g., `UUID lockUuid`).

2. Update `GoLinkService`.
   - Method `update(UUID id, GoLink input, UUID ifMatch)`:
     - Fetch existing Entity.
     - Check `ifMatch` vs existing `lockUuid`. If mismatch, throw Conflict.
     - Update fields from input.
     - Update `lockUuid` to new random UUID.
     - Save.
   - Method `delete(UUID id)`:
     - Delete by ID.

3. Update `GoLinkController`.
   - `PUT /{id}`:
     - Read `If-Match` header.
     - Call update.
     - Return 200 OK with new ETag.
   - `DELETE /{id}`:
     - Call delete.
     - Return 204 No Content.

Output the updated Service and Controller methods.
```

### Prompt 6: Frontend Setup

```text
You are an expert Angular developer.
Task: Initialize the Frontend application with TailwindCSS.

1. Create a standard Angular application in `/frontend`.
   - Standalone components preferred (Angular 15+).
   - **Style**: TailwindCSS.

2. Configure TailwindCSS.
   - Install dependencies (`tailwindcss`, `postcss`, `autoprefixer`).
   - Initialize `tailwind.config.js`.
   - Add Tailwind directives to `styles.css`.

3. Create `frontend/Dockerfile`.
   - Stage 1: Build (node image).
   - Stage 2: Serve (nginx:alpine).
   - Copy `nginx.conf` (see next step).

4. Create `frontend/nginx.conf`.
   - Serve static files from `/usr/share/nginx/html`.
   - Reverse Proxy `/api/` to `http://backend:8080/api/`.
   - Fallback to `index.html` for SPA routing.

5. Update `docker-compose.yml` to include `frontend`.
   - Build context: ./frontend
   - Ports: 80:80
   - Depends on: backend

Output the `Dockerfile`, `nginx.conf`, `tailwind.config.js` snippet, and updated `docker-compose.yml` snippet.
```

### Prompt 7: Frontend List & Create

```text
You are an expert Angular developer.
Task: Implement GoLink List and Create views.

1. Create `GoLink` interface (matching API Record).

2. Create `GoLinkService`.
   - Methods: `getAll()`, `create(data)`.

3. Create `HomeComponent` (Route `/`).
   - Display table of GoLinks (Name, Target, Description, Tags).
   - **Styling**: Use TailwindCSS for a clean, modern table design.
   - "Create" button navigates to `/new`.

4. Create `GoLinkFormComponent`.
   - Fields: Name, Target URL, Description, Tags.
   - **Styling**: Use TailwindCSS for form controls.
   - Validation: Required fields, URL format.

5. Create `CreateGoLinkComponent` (Route `/new`).
   - Uses `GoLinkFormComponent`.
   - Calls `service.create()`.
   - On success, navigate to Home.

Output the Service, Interface, and Component code snippets.
```

### Prompt 8: Redirect Logic

```text
You are an expert Java Spring Boot developer.
Task: Implement the Redirect Logic.

1. Create `RedirectController` at root `/`.
   - Method `handleRedirect(@PathVariable String slug, HttpServletRequest request, HttpServletResponse response)`.

2. Logic:
   - Normalize slug to lowercase.
   - Lookup GoLinkEntity by name.
   - If not found:
     - Return 404.
     - Write a simple HTML "Not Found" response directly to body.
   - If found:
     - Construct target URL.
     - Merge query parameters from request to target URL (Request params override target params).
     - Set `Location` header.
     - Set Status 302.
     - Return empty body.

Output the `RedirectController`.
```

### Prompt 9: Analytics (Backend)

```text
You are an expert Java Spring Boot developer.
Task: Implement Analytics Tracking and API.

1. Update `RedirectController`.
   - Before returning 302, create and save an `EventEntity`.
   - Fields: golink, now(), ip (from request), userAgent, referrer.
   - Use `@Async` or a separate service method to avoid blocking if possible, or keep simple for MVP.

2. Create `AnalyticsService`.
   - `getDailyStats(UUID golinkId, Instant from, Instant to)`: Return list of {date, count}.
   - `getTopLinks(Instant from, Instant to, int limit)`: Return list of {golinkName, count}.

3. Create `AnalyticsController` (`/api/analytics`).
   - `GET /top`: Call getTopLinks.
   - `GET /golinks/{id}/stats`: Call getDailyStats.

Output the updated `RedirectController`, `AnalyticsService`, and `AnalyticsController`.
```

### Prompt 10: Analytics (Frontend)

```text
You are an expert Angular developer.
Task: Implement Analytics UI.

1. Update `GoLinkService` to call analytics endpoints.

2. Create `AnalyticsComponent` (or add to Detail view).
   - Inputs: Date Range (Last 7 days, 30 days).
   - Display:
     - Total Clicks.
     - Chart (Line/Bar) of daily clicks.
     - List of recent events (optional).
   - **Styling**: Use TailwindCSS for layout and metrics cards.

3. Create `TopLinksComponent` (Route `/analytics`).
   - Display table of top performing links using TailwindCSS.

Output the Component code snippets.
```
