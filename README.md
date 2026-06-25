# Humanitarian Mapper

> Open-source, self-hostable 3W/4W coordination map for humanitarian organizations — see who does what, where.

Humanitarian Mapper is a free, open-source tool that helps humanitarian organizations
coordinate their work on a shared map. After a crisis (e.g. an earthquake), dozens of
organizations operate in the same area — providing shelter, cash assistance, child
protection, health services, and more. Small and local organizations often lack the
budget or technical capacity for expensive mapping systems.

This tool lets each organization mark the area it works in and the sectors it covers,
so everyone can answer two simple questions: **"Who is already working here?"** and
**"Where are the gaps?"**

It implements the established humanitarian **3W / 4W** standard (Who does What Where, and When).

**No personal or beneficiary data is stored — only organization activities are shown.**

## Status

**Early development.**
The self-hostable foundation is in place: an interactive map, a containerized backend with a
PostGIS database, and authentication (JWT, role-based access, invite-based onboarding). The
core mapping and coordination features are being built next. Not yet ready for production use.

## Features

Planned for the first release:

-  Organizations mark their working area (administrative boundary **or** free polygon/point)
-  Activity records: sector(s), status (planning / implementation / completed), dates
-  Gap view — filter by sector/status/date to reveal uncovered areas
-  Configurable form fields + custom field builder (coordinator-defined)
-  CSV / Excel export
-  Multi-language + right-to-left (RTL) support
-  Read-only public share link
-  PostGIS database + Spring Boot API skeleton + health endpoint
-  React frontend rendering an interactive map (OpenFreeMap basemap)
-  JWT authentication, role-based access, and invite-based organization onboarding

## Tech Stack

- **Frontend:** React + MapLibre GL JS + OpenFreeMap (free vector basemap, no API key)
- **Backend:** Java 21 + Spring Boot + Hibernate Spatial
- **Database:** PostgreSQL + PostGIS
- **Deployment:** Docker Compose (self-hosted)

## Getting Started

### Quick start (everything, via Docker)

```bash
docker compose up --build
```

This starts the database, backend, and frontend together:
- Map:          http://localhost:5173
- API health:   http://localhost:8080/api/health

### Prerequisites
- Docker & Docker Compose
- Java 21 and Node 22 (only for local development without Docker)

### Run only the database

```bash
docker compose up -d db
```

### Run the backend

```bash
cd humapper-backend
./mvnw spring-boot:run
```

The API is then available at:
- Health check: http://localhost:8080/api/health

### Run the frontend

```bash
cd humapper-frontend
npm install
npm run dev
```

The map is then available at http://localhost:5173

## Configuration

The backend reads these environment variables (Docker Compose provides dev defaults — override
them in production via your shell or a `.env` file; see `.env.example`):

| Variable                             | Purpose                                     | Dev default                              |
| ------------------------------------ | ------------------------------------------- | ---------------------------------------- |
| `JWT_SECRET`                         | Secret used to sign JWTs (min 32 chars)     | a placeholder — **change in production** |
| `ADMIN_EMAIL`                        | Email of the initial coordinator account    | `admin@example.org`                      |
| `ADMIN_PASSWORD`                     | Password of the initial coordinator account | `changeme-admin-password`                |
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | Database connection                         | local Postgres                           |

## Authentication & onboarding

- On first start, an initial **coordinator** account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- The coordinator logs in (`POST /api/auth/login`) and creates organization accounts
  (`POST /api/organizations`), which returns a one-time **invite token**.
- The invited organization activates its account by setting a password
  (`POST /api/auth/activate`), then logs in.
- Requests to protected endpoints carry the JWT in an `Authorization: Bearer <token>` header.

## Contributing

This project addresses a real, field-driven need in humanitarian coordination.
Contributions, ideas, and adaptations for different countries are welcome.
Please open an issue to discuss substantial changes before submitting a pull request.

## License

Released under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
See [LICENSE][1] for details.

In short: you are free to use, modify, and self-host this software. If you run a
modified version as a network service, you must make your modified source code
available to its users under the same license.

[1]:	LICENSE