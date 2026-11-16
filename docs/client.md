# Client

## What kind of client

A single-page web app built with React and Vite, in TypeScript, as in class.
It uses [Pico CSS](https://picocss.com) for styling, with no component library.

**Built at Checkpoint 1:** one page that loads the jobs from `GET /jobs` and
lists them, with a loading state and an error message if the server can't be
reached. Everything else in this document is planned.

## Main screens

| Screen | Who uses it | What they can do there | Status |
| --- | --- | --- | --- |
| Jobs | visitor, user, admin | Browse the jobs and the skills each one requires | built (list only) |
| Register / Log in | visitor | Create an account, or log in to one | planned |
| Profile | user | Set their current job and the skills they already have | planned |
| Job detail | user | See their skill gap for that job and ask for a study plan | planned |
| My plans | user | See their plans and any plan still being generated | planned |
| Plan | user | See a plan's learning tasks week by week and update each task's status | planned |
| Manage catalog | admin | Add, edit and remove jobs and skills | planned |

These follow the key flows in [`overview.md`](overview.md). Screens a role
can't use are hidden from it, but the server is what enforces the rules
(see [`roles.md`](roles.md)).

## Talking to the server

- **Where the server is.** `VITE_API_URL` in `client/.env`
  (`http://localhost:6790` locally).
- **Where the API calls live.** One place: `client/src/api/`, with one file
  per resource. Today that is `api/jobs.ts`, which exports `fetchJobs()`.
  Components call these functions and never call `fetch` themselves.
- **Logging in** (planned). The log-in form sends the email and password to
  the server and gets a JWT back. The client keeps the token in
  `localStorage`, so the user stays logged in after a refresh, and sends it
  with every request in the `Authorization: Bearer <token>` header. A shared
  helper in `api/` adds the header so no call can forget it.
- **When a request fails.** Every API function throws if the response is not
  2xx. Today the Jobs page shows the error in place of the list. Planned:
  - `401` — the token is missing or expired: clear it and send the user to
    the log-in screen.
  - `403` — the user isn't allowed: show a "you don't have access" message.
  - `400` — the input was rejected: show the server's message next to the form.
  - `404` — show a "not found" message.
  - anything else, or no answer — show a general "something went wrong, try
    again" message.

## Real-time

Planned; the events are defined in [`realtime.md`](realtime.md).

After logging in, the client opens one Socket.IO connection to the server and
sends its JWT when connecting. It closes the connection on log-out.

| When this arrives | The client |
| --- | --- |
| `generation:completed` | reloads the user's plans from `GET /plans`, so the new plan appears, and shows a "your plan is ready" notice |
| `generation:failed` | removes the "generating" indicator and shows the error message |
| `plan:task-updated` | if that plan is on screen, reloads it from `GET /plans/:planId` |

Events only say that something changed. The client always reloads the data
through the REST API, so what is on screen comes from one source. For the same
reason, after a page refresh or a reconnect the client reloads the current
screen's data over REST and does not rely on events it may have missed.

## Where it lives

Under `client/src/`:

| Path | What it is | Status |
| --- | --- | --- |
| `main.tsx` | Entry point: mounts the app and loads the stylesheet | built |
| `App.tsx` | The Jobs page today; later the layout and routing between screens | built |
| `api/jobs.ts` | `fetchJobs()` and the `Job` type | built |
| `api/` | One file per resource, plus the shared helper that adds the token | planned |
| `pages/` | One component per screen in the table above | planned |
| `realtime/` | The socket connection and event handlers | planned |
