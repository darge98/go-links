# Use Docker Compose for Local Development and Deployment

- Status: accepted
- Date: 2025-11-24
- Decision-makers: Project Team
- Technical Story: Deploy and run the application in different environments

## Context and Problem Statement

We need a way to:

- Run the full stack (frontend, backend, database) locally
- Ensure consistency between development and production
- Simplify onboarding for new developers
- Deploy to different environments easily

## Decision Drivers

- Developer experience
- Environment consistency
- Deployment simplicity
- Resource efficiency
- Maintenance overhead

## Considered Options

1. **Manual installation** - Install Java, Node, PostgreSQL locally
2. **Kubernetes** - Use K8s for orchestration
3. **Docker Compose** - Multi-container orchestration
4. **Individual Dockerfiles** - Run containers separately

## Decision Outcome

Chosen option: **Docker Compose**, because:

- **Simplicity**: Single `docker-compose up` command to start everything
- **Environment consistency**: Same containers everywhere
- **Isolated dependencies**: No need to install Java, Node, PostgreSQL
- **Fast onboarding**: New devs can start in minutes
- **Resource efficient**: Lighter than Kubernetes for local dev
- **Production-like**: Containers work same way in prod
- **Version control**: Infrastructure as code

### Implementation

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: golinks
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./sql:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      SERVER_NAME: localhost
      BACKEND_URL: http://backend:8080
    depends_on:
      - backend

volumes:
  db_data:
```

### Consequences

**Positive:**

- One command to start entire stack
- Consistent environments across team
- Easy to add new services
- Environment variables for configuration
- Volumes for data persistence
- Health checks and dependencies

**Negative:**

- Docker required on all machines
- May be slower than native on some systems
- Resource usage (RAM, disk space)
- Learning curve for Docker newcomers

## Compliance

This decision aligns with:

- 12-factor app principles
- Infrastructure as Code
- DevOps best practices
- Microservices architecture

## Related Decisions

- [Use Multi-stage Docker Builds](./20251124-use-multi-stage-docker-builds.md)
- [Use Environment Variables for Configuration](./20251124-use-environment-variables-for-configuration.md)
