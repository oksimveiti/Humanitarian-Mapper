# Humanitarian Mapper — Design Document (3W/4W Coordination Tool)

**Date:** 2026-06-20
**Status:** Approved (brainstorming phase)

## 1. Purpose

An open-source, self-hostable coordination tool where humanitarian organizations share
"who is doing what, where" (Who does What Where) information on a shared map.

This addresses a real, field-driven need: after a large crisis (e.g. an earthquake) dozens of
organizations work in the same area; small/local organizations often lack the budget or
technical team for expensive mapping systems. This tool lets organizations see each other and
answer "who is already working here?" and "is there a gap here?".

The tool implements the established humanitarian **3W / 4W / 5W** standard:
- **3W** = Who / What / Where
- **4W** = + When
- **5W** = + for Whom (targeted number of people)

**Data principle:** No personal/beneficiary data is stored. Only organization activities are
visible. (Aligned with OCHA Data Responsibility Guidelines 2025.)

## 2. Roles

- **Coordinator (admin):** Manages the deployment; approves/invites organizations; configures
  the sector list and form fields (including custom fields); enables the read-only share link.
  Maps to real-world country/crisis coordination groups (the cluster system).
- **Organization (member):** After approval, marks and updates their own activity areas.
- **Visitor (read-only):** If the coordinator enables the share link, views the map without
  logging in.

## 3. Deployment model

- **Self-host only.** No central platform is operated. Each coordination group installs it on
  their own server.
- **One deployment = one shared map.** No workspace separation; organizations appear wherever
  they mark geographically (Turkey, Syria, Iraq can all live on the same map).
- The demo is presented via **video and screenshots** in the documentation, not a live site.

## 4. Core flow

1. Coordinator installs → configures the sector list (pre-seeded with 11 global clusters) and
   form fields (required/optional/custom).
2. Organization registers → coordinator approves.
3. Organization marks an area on the map:
   - (a) Selects a standard **administrative boundary** (P-code/COD support), or
   - (b) Draws a **polygon/point** on the map.
4. Enters activity info: sector(s) + status + dates + coordinator-defined fields.
5. Everyone views the map and filters by sector/status/date → **gaps become visible**.

## 5. Data model (PostgreSQL + PostGIS)

- **organization** — name, status (pending/approved), organizational contact email
- **user** — email, password (hash), role, linked organization
- **activity**
  - organization (FK), sector(s), geometry (PostGIS `geometry`: polygon or point)
  - administrative boundary reference (optional, P-code)
  - **status:** Planning / Implementation / Completed
  - **start date**, **end date**
  - target number of people, description, organizational contact
  - custom field values (JSONB)
  - **last updated date** (for data freshness)
- **sector** — coordinator-editable list; seeded with the 11 global clusters
- **custom_field** — coordinator-defined fields (type: text/number/date/single-select/multi-select;
  required/optional flag)
- **admin_boundary** — (optional) uploaded COD/P-code administrative boundaries

## 6. Architecture

```
[React + MapLibre GL]  ←REST→  [Spring Boot API]  ←→  [PostgreSQL + PostGIS]
        │
   [PMTiles basemap]  (static file, no limits, works offline)
```

- **Frontend:** React + MapLibre GL JS + drawing plugin; i18n (TR/EN/AR) + right-to-left (RTL) support
- **Backend:** Spring Boot REST API; JWT auth; role-based authorization
- **Database:** PostgreSQL + PostGIS (geometry storage + spatial queries)
- **Basemap:** PMTiles file (no API key, no usage limits, works offline)
- **Deployment:** Everything starts together with `docker compose up`

## 7. v1 Features

- Standard cluster sector list (pre-seeded, editable)
- Administrative boundary selection **+** free polygon/point drawing
- Project status (Planning/Implementation/Completed) + start/end dates
- **Gap filter** — filter by sector/status/date; areas without organizations appear empty
  (temporal gap analysis: e.g. "completed projects older than 6 months")
- **CSV/Excel export**
- **Multi-language + RTL**
- **Read-only share link**
- **Configurable form fields + custom field builder** (limited to 5 types)
- Data freshness indicator (old records appear faded/flagged)

## 8. Deliberately OUT of scope (v2+)

Beneficiary/needs tracking · distribution management · public API · historical timeline
(snapshots) · mobile offline field app · duplication/overlap alerts · multi-workspace ·
conditional/formula form fields.

> **Focus principle:** The tool's strength is its focus on "who is working where". Entering
> beneficiary data both opens personal-data risk and turns the project into a huge, different thing.

## 9. Error handling & testing

- **Validation:** invalid geometry, missing required fields (including custom fields) →
  meaningful error messages
- **Security:** role-based authorization — an organization cannot modify another organization's
  record; the read-only link is genuinely read-only
- **Testing:**
  - integration tests for PostGIS spatial queries
  - unit + integration tests for the API
  - end-to-end test for the critical flow: register → approve → mark → filter → export

## 10. Tech summary

> React + MapLibre GL · Spring Boot (Java) · PostgreSQL + PostGIS · PMTiles · Docker Compose

## Sources (research)

- OCHA 3W Portal — https://3w.unocha.org/
- Who does What Where (3W), OCHA IM Toolbox —
  https://humanitarian.atlassian.net/wiki/spaces/imtoolbox/pages/214499412/Who+does+What+Where+3W
- Health Cluster 3W/4W Tool (WHO)
- OCHA Data Responsibility Guidelines 2025
- Humanitarian OpenStreetMap Team (HOT) — https://www.hotosm.org/en/
