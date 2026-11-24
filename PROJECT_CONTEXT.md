# Project Context: AI Career Agent

## Product goal and audience

Help people with no AI background or fragmented AI knowledge learn and apply AI to improve their careers. Target users include traditional-industry workers (agriculture, healthcare, construction and manufacturing) and people in data, HCI and software engineering. Users may want to change careers or bring AI into their existing work.

The intended flow is: describe a background and current skills, choose a target role, identify missing skills, generate an ordered learning plan, and track progress. This is the product goal, not a claim that every step is implemented.

## Two implementations in this repository

| Implementation | Locations | Current boundary |
| --- | --- | --- |
| SI 679 course app | `server/`, `client/`, `docs/` | Express/MongoDB/TypeScript API and React/Vite/TypeScript client; currently a public job list |
| Original prototype | `backend/`, `frontend/`, `src/`, `app/`, `tests/` | FastAPI wrapper and Python career graph/pipeline, with separate React and Streamlit interfaces |

Use the course app for course development. Consult the original prototype for existing recommendation logic and data; it is not already integrated into Express.

## Implemented course-app flow

1. `server/src/scripts/seed.ts` loads illustrative skills, jobs, users and plans into MongoDB.
2. `server/src/index.ts` connects to the database and creates indexes.
3. `server/src/app.ts` mounts `GET /jobs`, handled by the jobs router/controller and `db/jobs-repository.ts`.
4. `client/src/api/jobs.ts` requests the API and `client/src/App.tsx` displays jobs.

The seed uses stable ids and replacement upserts: rerunning it replaces matching sample documents, including changes to them, while leaving documents with other ids alone.

## Planned course-app features

Accounts and role enforcement; profile editing; skill-gap analysis; learning plans; asynchronous generation tasks; progress updates; per-user Socket.IO events; admin catalog editing; deployment. See [the development plan](docs/plan.md).

The `generation_tasks` collection is planned. User and plan types/seed data do not mean login or plan APIs exist. Socket.IO and JWT dependencies do not mean those features are wired up. LLM-written tasks are a stretch goal, not a verified capability.

## Original prototype boundaries

`backend/main.py` declares `GET /`, `GET /health`, `GET /jobs`, `GET /graph-summary`, `POST /recommend` and `POST /recommend/state`. Its `reload_pipeline()` function clears a cache, but has no HTTP route. It reads `src/data/future_jobs_dataset.csv`.

The prototype and Express `GET /jobs` contracts differ; do not switch client URLs between them without adapting the data contract. Python module names containing “agent” do not by themselves demonstrate autonomous or LLM-driven behavior.

## Working agreements

Follow [AGENTS.md](AGENTS.md) and [README.md](README.md). Make focused changes, explain the files and reasons, preserve API compatibility, and validate the relevant implementation. Keep implemented behavior distinct from proposals. Do not invent repository-search agents, files or endpoints.

For setup use README; for data use [data-model.md](docs/data-model.md) and [database-guide.md](docs/database-guide.md); for current routes and planned routes use [endpoints.md](docs/endpoints.md).
