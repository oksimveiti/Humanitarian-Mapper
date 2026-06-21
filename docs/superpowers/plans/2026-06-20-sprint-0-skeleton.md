# Sprint 0 — Project Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a runnable full-stack skeleton — `docker compose up` brings up PostgreSQL+PostGIS and a Spring Boot API, and the React frontend renders an empty MapLibre map using a PMTiles basemap.

**Architecture:** Three services orchestrated by Docker Compose: a PostGIS database, a Spring Boot REST API (Java 21, Maven, Hibernate Spatial), and a React + Vite frontend. This sprint proves the wiring end to end (DB extension present, API health endpoint up, map renders) with smoke tests — no domain features yet.

**Tech Stack:** Java 21, Spring Boot 3.x, Maven, Hibernate Spatial + JTS, PostgreSQL 16 + PostGIS 3.4, React 18 + TypeScript + Vite, MapLibre GL JS, PMTiles (protomaps-themes-base), Docker Compose.

---

## File Structure

```
backend/
  pom.xml                                  # Maven deps (Spring Boot, hibernate-spatial, jts, jackson-jts)
  Dockerfile                               # Build + run the API
  src/main/java/org/humapper/
    HumanitarianMapperApplication.java     # Spring Boot entry point
    config/JacksonGeometryConfig.java      # JtsModule bean for GeoJSON (de)serialization
    health/HealthController.java           # GET /api/health
    health/PostgisStatusRepository.java    # SELECT postgis_version() smoke check
  src/main/resources/application.yml       # DB connection + JPA config
  src/test/java/org/humapper/
    health/HealthControllerTest.java       # MockMvc test for /api/health
    health/PostgisStatusRepositoryIT.java  # Testcontainers PostGIS integration test
db/
  init/01-postgis.sql                      # CREATE EXTENSION postgis
frontend/
  package.json                             # React, maplibre-gl, pmtiles, protomaps-themes-base
  Dockerfile                               # Build + serve the SPA
  vite.config.ts
  index.html
  src/main.tsx                             # React root
  src/App.tsx                              # App shell
  src/map/MapView.tsx                      # MapLibre map + PMTiles protocol wiring
  src/map/basemapStyle.ts                  # MapLibre style object (pmtiles source + protomaps layers)
  public/basemap.pmtiles                   # Sample PMTiles file (Firenze) for dev smoke test
docker-compose.yml                         # Orchestrates db + backend + frontend
README.md                                  # How to run
```

---

### Task 1: PostGIS database via Docker Compose

**Files:**
- Create: `db/init/01-postgis.sql`
- Create: `docker-compose.yml` (db service only for now)

- [ ] **Step 1: Create the PostGIS init script**

Create `db/init/01-postgis.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

- [ ] **Step 2: Create docker-compose.yml with the db service**

Create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: humapper
      POSTGRES_USER: humapper
      POSTGRES_PASSWORD: humapper
    ports:
      - "5432:5432"
    volumes:
      - ./db/init:/docker-entrypoint-initdb.d:ro
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U humapper -d humapper"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  db_data:
```

- [ ] **Step 3: Start the db and verify PostGIS is enabled**

Run:
```bash
docker compose up -d db
sleep 8
docker compose exec -T db psql -U humapper -d humapper -c "SELECT postgis_version();"
```
Expected: a row printed with a PostGIS version string (e.g. `3.4 USE_GEOS=1 ...`), not an error.

- [ ] **Step 4: Commit**

```bash
git add db/init/01-postgis.sql docker-compose.yml
git commit -m "feat: add PostGIS database service via docker compose"
```

---

### Task 2: Spring Boot skeleton with health endpoint

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/org/humapper/HumanitarianMapperApplication.java`
- Create: `backend/src/main/java/org/humapper/health/HealthController.java`
- Create: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/org/humapper/health/HealthControllerTest.java`

- [ ] **Step 1: Create pom.xml**

Create `backend/pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>org.humapper</groupId>
    <artifactId>humanitarian-mapper</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-spatial</artifactId>
        </dependency>
        <dependency>
            <groupId>org.n52.jackson</groupId>
            <artifactId>jackson-datatype-jts</artifactId>
            <version>1.2.10</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.testcontainers</groupId>
                <artifactId>testcontainers-bom</artifactId>
                <version>1.20.2</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: Create the application entry point**

Create `backend/src/main/java/org/humapper/HumanitarianMapperApplication.java`:

```java
package org.humapper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HumanitarianMapperApplication {
    public static void main(String[] args) {
        SpringApplication.run(HumanitarianMapperApplication.class, args);
    }
}
```

- [ ] **Step 3: Write the failing test for the health endpoint**

Create `backend/src/test/java/org/humapper/health/HealthControllerTest.java`:

```java
package org.humapper.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointReturnsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `cd backend && ./mvnw test -Dtest=HealthControllerTest`
(If no Maven wrapper yet, generate it: `mvn -N wrapper:wrapper` then rerun.)
Expected: FAIL — `HealthController` does not exist (compilation error).

- [ ] **Step 5: Implement the HealthController**

Create `backend/src/main/java/org/humapper/health/HealthController.java`:

```java
package org.humapper.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
```

- [ ] **Step 6: Create application.yml**

Create `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/humapper}
    username: ${DB_USER:humapper}
    password: ${DB_PASSWORD:humapper}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true

server:
  port: 8080
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd backend && ./mvnw test -Dtest=HealthControllerTest`
Expected: PASS (1 test, 0 failures).

- [ ] **Step 8: Commit**

```bash
git add backend/pom.xml backend/mvnw backend/.mvn backend/src/main/java/org/humapper/HumanitarianMapperApplication.java backend/src/main/java/org/humapper/health/HealthController.java backend/src/main/resources/application.yml backend/src/test/java/org/humapper/health/HealthControllerTest.java
git commit -m "feat: add Spring Boot skeleton with health endpoint"
```

---

### Task 3: Verify PostGIS connectivity from the backend

**Files:**
- Create: `backend/src/main/java/org/humapper/health/PostgisStatusRepository.java`
- Create: `backend/src/main/java/org/humapper/config/JacksonGeometryConfig.java`
- Test: `backend/src/test/java/org/humapper/health/PostgisStatusRepositoryIT.java`

- [ ] **Step 1: Write the failing integration test (Testcontainers PostGIS)**

Create `backend/src/test/java/org/humapper/health/PostgisStatusRepositoryIT.java`:

```java
package org.humapper.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PostgisStatusRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgis = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:16-3.4")
                    .asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("humapper")
            .withUsername("humapper")
            .withPassword("humapper")
            .withInitScript("init/postgis-extension.sql");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgis::getJdbcUrl);
        registry.add("spring.datasource.username", postgis::getUsername);
        registry.add("spring.datasource.password", postgis::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    }

    @Autowired
    private PostgisStatusRepository repository;

    @Test
    void reportsPostgisVersion() {
        String version = repository.postgisVersion();
        assertThat(version).isNotBlank();
    }
}
```

- [ ] **Step 2: Add the test init script for the extension**

Create `backend/src/test/resources/init/postgis-extension.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd backend && ./mvnw test -Dtest=PostgisStatusRepositoryIT`
Expected: FAIL — `PostgisStatusRepository` does not exist (compilation error).

- [ ] **Step 4: Implement the repository**

Create `backend/src/main/java/org/humapper/health/PostgisStatusRepository.java`:

```java
package org.humapper.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PostgisStatusRepository {

    private final JdbcTemplate jdbcTemplate;

    public PostgisStatusRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String postgisVersion() {
        return jdbcTemplate.queryForObject("SELECT postgis_version()", String.class);
    }
}
```

- [ ] **Step 5: Add the Jackson geometry config (GeoJSON support for later sprints)**

Create `backend/src/main/java/org/humapper/config/JacksonGeometryConfig.java`:

```java
package org.humapper.config;

import org.n52.jackson.datatype.jts.JtsModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonGeometryConfig {

    @Bean
    public JtsModule jtsModule() {
        return new JtsModule();
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd backend && ./mvnw test -Dtest=PostgisStatusRepositoryIT`
Expected: PASS (Testcontainers starts PostGIS, query returns a version string).

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/org/humapper/health/PostgisStatusRepository.java backend/src/main/java/org/humapper/config/JacksonGeometryConfig.java backend/src/test/java/org/humapper/health/PostgisStatusRepositoryIT.java backend/src/test/resources/init/postgis-extension.sql
git commit -m "feat: verify PostGIS connectivity and add JTS Jackson module"
```

---

### Task 4: React + Vite frontend with empty MapLibre map (PMTiles)

**Files:**
- Create: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/index.html`, `frontend/tsconfig.json`
- Create: `frontend/src/main.tsx`, `frontend/src/App.tsx`
- Create: `frontend/src/map/basemapStyle.ts`, `frontend/src/map/MapView.tsx`
- Create: `frontend/public/basemap.pmtiles` (sample file, see Step 6)

- [ ] **Step 1: Create package.json**

Create `frontend/package.json`:

```json
{
  "name": "humanitarian-mapper-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview --host --port 5173"
  },
  "dependencies": {
    "maplibre-gl": "^4.7.1",
    "pmtiles": "^3.2.0",
    "protomaps-themes-base": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}
```

- [ ] **Step 2: Create vite, tsconfig, and index.html**

Create `frontend/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
});
```

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

Create `frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Humanitarian Mapper</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create the React root and App shell**

Create `frontend/src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "maplibre-gl/dist/maplibre-gl.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `frontend/src/App.tsx`:

```tsx
import MapView from "./map/MapView";

export default function App() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <MapView />
    </div>
  );
}
```

- [ ] **Step 4: Create the basemap style**

Create `frontend/src/map/basemapStyle.ts`:

```ts
import layers from "protomaps-themes-base";
import type { StyleSpecification } from "maplibre-gl";

// The deployer replaces /basemap.pmtiles with their own region extract.
export const basemapStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sources: {
    protomaps: {
      type: "vector",
      url: "pmtiles:///basemap.pmtiles",
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: layers("protomaps", "light"),
};
```

- [ ] **Step 5: Create the MapView component (PMTiles protocol wiring)**

Create `frontend/src/map/MapView.tsx`:

```tsx
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { basemapStyle } from "./basemapStyle";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: basemapStyle,
      center: [36.2, 36.2], // near Hatay; deployers re-center as needed
      zoom: 6,
    });
    map.addControl(new maplibregl.NavigationControl());

    return () => {
      map.remove();
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
```

- [ ] **Step 6: Add a sample PMTiles file for the dev smoke test**

Download the small Protomaps sample extract used in MapLibre examples:
```bash
mkdir -p frontend/public
curl -L -o frontend/public/basemap.pmtiles \
  "https://r2-public.protomaps.com/protomaps-sample-datasets/protomaps(vector)ODbL_firenze.pmtiles"
```
Expected: a ~1-2 MB `frontend/public/basemap.pmtiles` file is created.
Note: this is a tiny Florence-only sample for smoke testing the pipeline; production deployers swap in their own region `.pmtiles`. Add `frontend/public/basemap.pmtiles` to `.gitignore` so the sample isn't committed.

- [ ] **Step 7: Install deps and verify the map renders**

Run:
```bash
cd frontend && npm install && npm run dev
```
Then open `http://localhost:5173`.
Expected: a rendered map with navigation controls (zoom/compass). Centering over Florence at higher zoom shows streets; this confirms PMTiles + MapLibre + protomaps theme are wired correctly.

- [ ] **Step 8: Add .gitignore and commit**

Create `.gitignore` (repo root) if not present, including:
```
node_modules/
frontend/dist/
frontend/public/basemap.pmtiles
backend/target/
```

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/tsconfig.json frontend/index.html frontend/src .gitignore
git commit -m "feat: add React frontend with empty MapLibre PMTiles map"
```

---

### Task 5: Containerize backend + frontend and wire full compose

**Files:**
- Create: `backend/Dockerfile`, `frontend/Dockerfile`
- Modify: `docker-compose.yml` (add backend + frontend services)
- Create: `README.md`

- [ ] **Step 1: Create the backend Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- [ ] **Step 2: Create the frontend Dockerfile**

Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

- [ ] **Step 3: Extend docker-compose.yml with backend and frontend**

Replace `docker-compose.yml` with:

```yaml
services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: humapper
      POSTGRES_USER: humapper
      POSTGRES_PASSWORD: humapper
    ports:
      - "5432:5432"
    volumes:
      - ./db/init:/docker-entrypoint-initdb.d:ro
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U humapper -d humapper"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    environment:
      DB_URL: jdbc:postgresql://db:5432/humapper
      DB_USER: humapper
      DB_PASSWORD: humapper
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  db_data:
```

- [ ] **Step 4: Build and run the full stack**

Run:
```bash
docker compose up --build -d
sleep 30
curl -s http://localhost:8080/api/health
```
Expected: `{"status":"UP"}` from the health endpoint, and `http://localhost:5173` serves the map.
Note: the production frontend image does not include `basemap.pmtiles` (gitignored); for a full visual check in containers, mount or copy a real region file into `frontend/public` before building. The dev server check in Task 4 already proved the map pipeline.

- [ ] **Step 5: Write the README run instructions**

Create `README.md`:

```markdown
# Humanitarian Mapper

Open-source, self-hostable 3W/4W coordination map for humanitarian organizations.
See `docs/superpowers/specs/2026-06-20-humanitarian-mapper-design.md` for the design.

## Run locally (Docker)

```bash
docker compose up --build
```

- API:      http://localhost:8080/api/health
- Frontend: http://localhost:5173

## Basemap

The map uses a single PMTiles file at `frontend/public/basemap.pmtiles` (gitignored).
For development, download the small sample:

```bash
curl -L -o frontend/public/basemap.pmtiles \
  "https://r2-public.protomaps.com/protomaps-sample-datasets/protomaps(vector)ODbL_firenze.pmtiles"
```

For production, generate a `.pmtiles` extract for your region (see https://docs.protomaps.com)
and place it at the same path, then re-center the map in `frontend/src/map/MapView.tsx`.

## Development (without Docker)

- Backend:  `cd backend && ./mvnw spring-boot:run` (needs the `db` service running)
- Frontend: `cd frontend && npm install && npm run dev`
```

- [ ] **Step 6: Commit**

```bash
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml README.md
git commit -m "feat: containerize stack and wire full docker compose"
```

---

## Self-Review

**Spec coverage (Sprint 0 scope only):**
- Docker Compose with `docker compose up` → Tasks 1, 5 ✅
- PostgreSQL + PostGIS → Task 1 (extension verified), Task 3 (backend connectivity) ✅
- Spring Boot API → Tasks 2, 3 ✅
- React + MapLibre + PMTiles empty map → Task 4 ✅
- Hibernate Spatial / JTS readiness for later sprints → Task 2 (deps), Task 3 (JtsModule) ✅
- Domain features (auth, activities, sectors, gap filter, i18n) → intentionally deferred to Sprints 1–5.

**Placeholder scan:** No TBD/TODO. Every code/command step contains concrete content. ✅

**Type/name consistency:** Java package `org.humapper` used throughout; `PostgisStatusRepository.postgisVersion()` defined in Task 3 and called by its test; `basemapStyle` defined in `basemapStyle.ts` and imported by `MapView.tsx`; the `pmtiles://` URL points at `/basemap.pmtiles` matching the file created in Task 4 Step 6. ✅

**Notes for the executor:**
- If `./mvnw` is missing, generate the wrapper first: `cd backend && mvn -N wrapper:wrapper`.
- Testcontainers requires a running Docker daemon.
- Do not trigger production builds automatically — per project workflow, pause for review at the end of the sprint.
```
