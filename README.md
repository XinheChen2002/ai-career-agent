# Project name

> **This README is yours to rewrite.** By the final repo it should tell
> someone who has never seen your project how to install, run, test and
> deploy it, and how to use it. The setup notes below get you started;
> keep what's still true and replace the rest.

One or two sentences on what the app is and who it's for.

## What's in this repo

| | |
|---|---|
| `server/` | The Express + MongoDB back end |
| `client/` | The React front end (Vite) |
| `docs/` | Your planning docs — see the [Your repo](https://si679-public.github.io/final-project/repo) page |
| `backend/`, `frontend/`, `src/`, `app/`, `tests/` | The original FastAPI + React prototype, kept as a reference for data and design. Not part of the course app. |

The starter has **no app code**, only the packages and configuration we've
used in class. You write everything under `server/src/` and `client/src/`.

## Setup

### Node 22

The project is pinned to **Node 22** (22.9 or later). `npm install` refuses to run on any
other version. If you use [nvm](https://github.com/nvm-sh/nvm), the
`.nvmrc` file picks the version for you:

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

Every package version is pinned exactly (and `package-lock.json` pins
everything they depend on), so everything stays consistent and you don't have to worry about package updates breaking your code. If you add a package with `npm install <name>`, it's pinned too and everyone in your group (and your instructors) will be able to run the same version of everything.

### Environment

```bash
cp server/.env.example server/.env    # then set JWT_SECRET
cp client/.env.example client/.env
```

Note that if you add environment variables you MUST add them to .env.example with instructions for how to fill them in, so that others can run your code.

The values in the `.env.example` files are for local development. A deployed
app doesn't use your `.env` file: you set the same variables on the host, as
we'll cover in week 9 (deployment, 11/17).

### Reusing your homework code

You're welcome to reuse your own homework code, but the server here is set up
like the lecture code (ES modules), not the homeworks, so two things change:

- **Relative imports end in `.js`**, even though the file is `.ts`:
  `import { app } from './app.js'`. Leave it off and you'll see
  `TS2835: Relative import paths need explicit file extensions`.
- **`__dirname` doesn't exist.** Use `import.meta.dirname` instead.

In return, `await` works at the top level of a file, as in a seed script.

## Running

You need MongoDB running, then the server and the client in two more
terminals:

```bash
# macOS / Linux
mongod --dbpath ~/data/mdata
```

```shell
# Windows
mongod --dbpath c:\data\mdata
```

```bash
cd server && npm run dev     # http://localhost:6790
```

```bash
cd client && npm run dev     # http://localhost:5173
```

## Scripts

**`server/`**

| Command | What it does | Expects |
|---|---|---|
| `npm run dev` | Runs the server and restarts it when you save | `src/index.ts` |
| `npm run typecheck` | Type-checks without building | |
| `npm test` | Runs every test once | test files in `src/` |
| `npm run test:watch` | Re-runs tests when you save | |
| `npm run test:unit` | Only files ending `.unit.test.ts` | |
| `npm run test:e2e` | Only files ending `.e2e.test.ts` | |
| `npm run seed` | Loads sample data - you will need to write this | `src/scripts/seed.ts` |
| `npm run build` / `npm start` | Builds to `dist/` and runs the build | |

**`client/`**

| Command | What it does | Expects |
|---|---|---|
| `npm run dev` | Runs the client and reloads on save | `src/main.tsx` |
| `npm run typecheck` | Type-checks without building | |
| `npm run build` / `npm run preview` | Builds to `dist/` and serves the build | |

`typecheck` and `test` report errors until there's code in `src/`.

## Deployed app

Where it runs, its URL, and a test login for each role are in
[`docs/deployment.md`](docs/deployment.md).
