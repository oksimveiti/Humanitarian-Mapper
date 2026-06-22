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

 **Early development (Sprint 0 — project skeleton).**
The backend skeleton and database are in place. The map frontend and coordination
features are being built sprint by sprint. Not yet ready for production use.

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

## Tech Stack

- **Frontend:** React + MapLibre GL JS + OpenFreeMap (free vector basemap, no API key)
- **Backend:** Java 21 + Spring Boot + Hibernate Spatial
- **Database:** PostgreSQL + PostGIS
- **Deployment:** Docker Compose (self-hosted)

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 21 (for backend development)

### Run the database

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

> A full `docker compose up` that starts the database, backend, and frontend together
> is coming in a later sprint.

## Contributing

This project addresses a real, field-driven need in humanitarian coordination.
Contributions, ideas, and adaptations for different countries are welcome.
Please open an issue to discuss substantial changes before submitting a pull request.

## License

Released under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
See [LICENSE](LICENSE) for details.

In short: you are free to use, modify, and self-host this software. If you run a
modified version as a network service, you must make your modified source code
available to its users under the same license.
