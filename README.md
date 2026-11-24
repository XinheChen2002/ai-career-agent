# AI Career Agent

AI Career Agent helps people who want to move into AI work — starting from zero
or from scattered knowledge — see which skills a target job needs, which of
those they are missing, and follow a study plan to close the gap.

## Status (Checkpoint 1)

**Working now**

- The project runs from a fresh clone: install, environment files, seed, start.
- A MongoDB data layer with sample data for jobs, skills, users and study plans.
- One endpoint, `GET /jobs`, with tests.
- A minimal React page that lists the jobs.

**Not built yet** (planned in [`docs/`](docs/)): accounts and login, roles,
admin editing of jobs and skills, user profiles, skill-gap view, study-plan
endpoints, background plan generation, real-time updates, and deployment.

## What's in this repo

| | |
|---|---|
| `server/` | The Express + MongoDB back end |
| `client/` | The React front end (Vite) |
| `docs/` | Planning docs: [overview](docs/overview.md), [roles](docs/roles.md), [data model](docs/data-model.md), [endpoints](docs/endpoints.md), [real-time](docs/realtime.md), [client](docs/client.md), [topic map](docs/topic-map.md), [plan](docs/plan.md) |
| `backend/`, `frontend/`, `src/`, `app/`, `tests/` | The original FastAPI + React prototype, kept as a reference for data and design. Not part of the course app. |

## Setup

### Prerequisites

- **Node 22** (22.9 or later). `npm install` refuses to run on any other version.
- **MongoDB**, installed locally so that the `mongod` command is available.

If you use [nvm](https://github.com/nvm-sh/nvm), the `.nvmrc` file picks the
Node version for you:

```bash
nvm install    # once
nvm use        # in each new terminal
node --version # v22.x
```

### Install

The server and client are separate packages. Install each one:

```bash
cd server && npm install
cd ../client && npm install
```

### Environment

Run the following commands from the repository root (after the install commands above, use `cd ..` to leave `client/`).

```bash
cp server/.env.example server/.env    # then set JWT_SECRET
cp client/.env.example client/.env
```

The values in the `.env.example` files work as they are for local development.

| File | Variable | What it is |
|---|---|---|
| `server/.env` | `JWT_SECRET` | Secret for signing login tokens. Not used yet, but set it to a long random string. |
| | `CLIENT_ORIGIN` | The browser origin allowed to call the API. |
| | `PORT` | The port the server listens on. |
| | `MONGODB_URI` | Where MongoDB is running. |
| | `DB_NAME` | The database the app uses. |
| `client/.env` | `VITE_API_URL` | Where the server is running. |

## Running

You need three terminals. Run `nvm use` in each one first.

**1. MongoDB**

```bash
# macOS / Linux
mkdir -p ~/data/mdata
mongod --dbpath ~/data/mdata
```

```shell
# Windows
mongod --dbpath c:\data\mdata
```

If MongoDB already runs as a service on your machine, skip this step.

**2. The server**

```bash
cd server
npm run seed     # load the sample data (first time, or to reset it)
npm run dev      # http://localhost:6790
```

**3. The client**

```bash
cd client
npm run dev      # http://localhost:5173
```

Open <http://localhost:5173> to see the list of jobs.

### Sample data

`npm run seed` loads 58 skills, 25 jobs, 3 users and 2 study plans into the
database named by `DB_NAME`:

```text
skills: seeded 58 (58 in the collection)
jobs: seeded 25 (25 in the collection)
users: seeded 3 (3 in the collection)
plans: seeded 2 (2 in the collection)
Done. Database: "ai_career_agent".
```

It is safe to run again: every document is written by a fixed id, so a second
run replaces the same sample documents and adds no duplicates. Changes to those
sample documents are overwritten, including resetting sample-user passwords.
It does not delete
anything you added yourself.

The sample data is illustrative. Part of it comes from the dataset the original
prototype used; the rest was written for this project. See
[`docs/data-model.md`](docs/data-model.md#sample-data).

## The API

One endpoint so far. Current behavior and the planned endpoint outline are in [`docs/endpoints.md`](docs/endpoints.md).

### `GET /jobs`

Every job with the skills it requires, sorted by title. No login needed.

```bash
curl http://localhost:6790/jobs
```

`200 OK` (shortened here to the first of 25 jobs):

```json
{
  "jobs": [
    {
      "id": "ai-engineer",
      "title": "AI Engineer",
      "industry": "AI",
      "description": "Builds and ships applications powered by machine learning models.",
      "skills": [
        { "id": "python", "name": "Python" },
        { "id": "rest-apis", "name": "REST APIs" },
        { "id": "llm-apis", "name": "LLM APIs" },
        { "id": "prompt-engineering", "name": "Prompt Engineering" },
        { "id": "rag", "name": "Retrieval-Augmented Generation" },
        { "id": "pytorch", "name": "PyTorch" },
        { "id": "tensorflow", "name": "TensorFlow" },
        { "id": "model-deployment", "name": "Model Deployment" }
      ]
    }
  ]
}
```

With no jobs in the database the response is `{ "jobs": [] }`.

Errors are JSON too: `404` with `{ "error": "Not found" }` for an unknown
path, and `500` with `{ "error": "Internal server error" }` if something goes
wrong on the server.

## Checks and tests

Tests don't need MongoDB running or a `.env` file: they start their own
in-memory database. The first run downloads it, which can take a minute.

**`server/`**

| Command | What it does |
|---|---|
| `npm run typecheck` | Type-checks without building |
| `npm test` | Runs every test once |
| `npm run test:e2e` | Only files ending `.e2e.test.ts` — requests through the app to a real database |
| `npm run test:unit` | Only files ending `.unit.test.ts` — checks on the seed data |
| `npm run test:watch` | Re-runs tests when you save |
| `npm run seed` | Loads the sample data |
| `npm run dev` | Runs the server and restarts it when you save |
| `npm run build` / `npm start` | Builds to `dist/` and runs the build |

**`client/`**

| Command | What it does |
|---|---|
| `npm run typecheck` | Type-checks without building |
| `npm run dev` | Runs the client and reloads on save |
| `npm run build` / `npm run preview` | Builds to `dist/` and serves the build |

## Writing server code

The server uses ES modules, so two things differ from older Node code:

- **Relative imports end in `.js`**, even though the file is `.ts`:
  `import { app } from './app.js'`.
- **`__dirname` doesn't exist.** Use `import.meta.dirname` instead.

If you add an environment variable, add it to the `.env.example` file too,
with a comment saying how to fill it in.

## Deployed app

Not deployed yet. [`docs/deployment.md`](docs/deployment.md) will describe
where it runs once it is.
