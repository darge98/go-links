# GoLinks 🔗

A modern, self-hosted URL shortener for teams. Create memorable short links (like `go/docs` or `go/jira`) that redirect to long URLs, making it easy to share and remember important resources.

## 📖 What are GoLinks?

GoLinks (also known as "go links" or "short links") are human-readable shortcuts to web resources. Instead of sharing long, complex URLs like:

```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit#gid=0
```

You can create a memorable GoLink:

```
go/team-budget
```

GoLinks are particularly useful in team environments where resources are frequently shared. They're easy to remember, type, and communicate verbally.

## ✨ Features

- 🚀 **Simple & Fast**: Create short links in seconds
- 📊 **Analytics**: Track click counts and view top links
- 🏷️ **Tags**: Organize links with custom tags
- 🎯 **Query Preservation**: Original query parameters are preserved on redirect
- 🌱 **Test Data**: Optional sample data for testing and development
- 🐳 **Docker Ready**: Easy deployment with Docker Compose
- ⚙️ **Configurable**: Environment-based configuration

## 🏗️ Architecture

### Tech Stack

**Backend:**

- Java 21
- Spring Boot 3.3
- PostgreSQL 15
- Docker

**Frontend:**

- Angular 21
- Standalone Components
- Signals & Zoneless Change Detection
- TailwindCSS 4
- Nginx

**Infrastructure:**

- Docker Compose
- Multi-stage builds
- Environment-based configuration

### Project Structure

```
go-links/
├── backend - Spring Boot project
├── frontend - Angular project
├── sql - Database schema and seed data
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/go-links.git
cd go-links
```

2. **Configure environment (optional)**

Edit `docker-compose.yml` to customize:

```yaml
environment:
  # Database
  POSTGRES_DB: golinks
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres

  # Test data (set to "false" for production)
  SEED_DATA: "true"

  # Frontend (Nginx)
  SERVER_NAME: localhost
  BACKEND_URL: http://backend:8080
```

3. **Start the application**

```bash
docker-compose up -d
```

4. **Access the application**

- **Dashboard**: http://localhost
- **API**: http://localhost/api/golinks
- **Redirect**: http://localhost/{slug}

### First Steps

1. Open http://localhost in your browser
2. Click "Create New Link"
3. Fill in the form:
   - **Name**: `github` (this will be your short link)
   - **Target URL**: `https://github.com`
   - **Description**: `GitHub`
   - **Tags**: `dev`, `git`
4. Click "Save"
5. Test it: visit http://localhost:8080/github → redirects to GitHub!

## 📝 Usage

### Creating a GoLink

**Via UI:**

1. Navigate to http://localhost
2. Click "Create New Link"
3. Enter details and save

**Via API:**

```bash
curl -X POST http://localhost:8080/api/golinks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "docs",
    "targetUrl": "https://docs.google.com",
    "description": "Google Docs",
    "tags": ["productivity", "google"]
  }'
```

### Using a GoLink

Simply navigate to:

```
http://localhost:8080/{name}
```

Examples:

- `http://localhost/github` → `https://github.com`
- `http://localhost/docs` → `https://docs.google.com`

**Query parameters are preserved:**

```
http://localhost/github?tab=repositories
  → https://github.com?tab=repositories
```

### Editing a GoLink

1. Click on a link name in the dashboard
2. Modify fields
3. Click "Update"

Note: The system uses optimistic locking to prevent concurrent edits. If someone else modifies the link while you're editing, you'll be prompted to refresh.

### Deleting a GoLink

1. Navigate to the edit page
2. Click "Delete"
3. Confirm the action

### Viewing Analytics

- **Click counts**: Displayed on the edit page for each link
- **Top Links**: Sidebar on the dashboard shows most popular links

**How to use it:**

- Use a browser extension to automatically prepend `http://` and append the domain
- Configure a custom DNS server (e.g., Pi-hole, dnsmasq) for network-wide go/ links
- Set up your router's DNS to resolve `go` to your server's IP address

## 🔧 Configuration

### Environment Variables

**Database Service (`db`):**

- `POSTGRES_DB` - Database name (default: `golinks`)
- `POSTGRES_USER` - Database user (default: `postgres`)
- `POSTGRES_PASSWORD` - Database password (default: `postgres`)
- `SEED_DATA` - Load test data (`true`/`false`, default: `false`)

**Backend Service (`backend`):**

- `DB_HOST` - Database host (default: `db`)
- `DB_PORT` - Database port (default: `5432`)
- `DB_NAME` - Database name (default: `golinks`)
- `DB_USER` - Database user (default: `postgres`)
- `DB_PASSWORD` - Database password (default: `postgres`)

**Frontend Service (`frontend`):**

- `SERVER_NAME` - Nginx server name (default: `localhost`)
- `BACKEND_URL` - Backend URL for API proxy (default: `http://backend:8080`)

### Ports

- `80` - Frontend (Nginx)
- `8080` - Backend (Spring Boot)
- `5432` - PostgreSQL (internal only)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Google's internal go/links system
- Built with modern web technologies and best practices
