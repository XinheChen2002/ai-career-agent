# Endpoints

## Implemented: Express course app

Base URL for local development: `http://localhost:6790`.

| Method | Path | Access | Request | Response |
| --- | --- | --- | --- | --- |
| GET | /jobs | Public; no login required | No required parameters | 200 with `{ jobs: Job[] }`, sorted by title; an empty database returns `{ jobs: [] }` |

`Job` contains `id`, `title`, `industry`, `description` and `skills: { id, name }[]`.
See [the type](../server/src/types/job.ts), [router](../server/src/routes/jobs-router.ts), [controller](../server/src/controllers/jobs-controller.ts) and [repository](../server/src/db/jobs-repository.ts).

Unknown paths return 404 with `{ "error": "Not found" }`. Unexpected server errors return 500 with `{ "error": "Internal server error" }`.
The template `/examples` endpoints do not exist.

## Planned, not implemented

These paths are already used in the database, client and real-time design documents. Request/response details must be agreed before implementation.

| Method | Path | Intended access | Purpose |
| --- | --- | --- | --- |
| POST | /generation-tasks | Signed-in user | Request a plan for a target job; return a generation task before processing finishes |
| GET | /generation-tasks/:taskId | Task owner | Retrieve generation status and resulting plan id |
| GET | /plans | Signed-in user | List the caller's plans |
| GET | /plans/:planId | Plan owner | Read one plan |
| PATCH | /plans/:planId/tasks/:taskId | Plan owner | Update a learning task's status |

Registration/login, profile, skill-gap, skills listing and admin catalog routes are also planned; their paths and contracts are not yet established here. See [roles](roles.md) and [plan](plan.md). Owner checks must be implemented on the server.

## Separate Python prototype

`backend/main.py` declares `GET /`, `GET /health`, `GET /jobs`, `GET /graph-summary`, `POST /recommend` and `POST /recommend/state`. These are not Express endpoints. The prototype's `GET /jobs` response differs from the course app's response. Its cache-reset helper `reload_pipeline()` has no HTTP endpoint.
