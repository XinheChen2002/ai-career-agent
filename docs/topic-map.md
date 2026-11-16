# Topic map

Where each required topic shows up in the app. **Built** means it is in the
repo at Checkpoint 1; **planned** says where it will be.

| Required topic | Where to look |
| --- | --- |
| Data model with related collections | **Built:** five collections described in [`data-model.md`](data-model.md); types in `server/src/types/`; connection and collections in `server/src/db/`; sample data in `server/src/data/`, loaded by `server/src/scripts/seed.ts`. `plans` refers to `users`, `jobs` and `skills`; `jobs` and `users` refer to `skills`. **Planned:** the `generation_tasks` collection. |
| REST API endpoints | **Built:** `GET /jobs` — `server/src/routes/jobs-router.ts`, `server/src/controllers/jobs-controller.ts`, `server/src/db/jobs-repository.ts`. **Planned:** the rest of [`endpoints.md`](endpoints.md): accounts, profile, admin editing of jobs and skills, plans, generation tasks. |
| Authentication, and at least two roles enforced by authorization | **Planned:** register and log in with bcrypt-hashed passwords and a JWT; middleware in `server/src/middleware/` that checks the token and the role. Three roles — visitor, user, admin — in [`roles.md`](roles.md), plus the rule that a user reaches only their own plans. The `users` collection already stores `passwordHash` and `role`. |
| Validation and error handling | **Built:** `server/src/middleware/error-handler.ts` — unknown paths get a 404 and unexpected errors a 500, both as `{ error }` JSON. **Planned:** validating the body and parameters of every write endpoint, answering 400 with a message; 401 and 403 from the auth middleware. |
| Tests at more than one level | **Built:** end-to-end — `server/src/tests/jobs.e2e.test.ts` (HTTP request through the app to an in-memory MongoDB) and `server/src/db/jobs-repository.e2e.test.ts` (the data layer against the same); unit — `server/src/data/seed-data.unit.test.ts` (the sample data refers only to ids that exist). **Planned:** unit tests for the skill-gap and plan-building logic; end-to-end tests for every endpoint, including who is refused. |
| A real-time feature | **Planned:** Socket.IO events that tell a user their plan is ready and keep learning-task progress in sync across their tabs, each sent only to that user. See [`realtime.md`](realtime.md). |
| A client that talks to your back end | **Built:** a React page that lists the jobs from `GET /jobs` — `client/src/App.tsx`, `client/src/api/jobs.ts`. **Planned:** the screens in [`client.md`](client.md). |
| Deployment with HTTPS | **Planned:** not started; [`deployment.md`](deployment.md) will describe it from Checkpoint 2. |
