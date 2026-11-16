# Plan

## Scope

### Checkpoint 1

What the `checkpoint-1` tag contains.

- Project runs from a fresh clone: install, environment files, seed, start.
- Database layer: connection, typed collections for `skills`, `jobs`, `users`
  and `plans`, indexes, and a seed script that can be re-run safely.
- `GET /jobs` returns the jobs from the database, with tests.
- A minimal React page.
- The eight planning documents.

### Must-have

The app is not finished without these. Listed in the order we will build them,
because each one depends on the ones above it.

1. **Accounts and login.** Register, log in, JWT on every request, passwords
   stored as bcrypt hashes.
2. **Roles.** Visitor, user and admin, enforced on the server for every
   endpoint, including the rule that a user can only reach their own data.
3. **Job and skill catalog.** Anyone can read jobs and skills; admins can
   create, edit and delete them.
4. **Profile.** A user can read and update their current job and the skills
   they already have.
5. **Skill gap.** For a chosen job, show which required skills the user is
   missing.
6. **Study plans.** A user can request a plan for a target job, list and open
   their plans, and update the status of each learning task.
7. **Background plan generation.** Requesting a plan creates a generation
   task and returns immediately; the plan is built afterwards, ordered by
   skill prerequisites.
8. **Real-time.** The user is notified when their plan is ready, and task
   progress stays in sync across their open tabs.
9. **Validation and error handling.** Every endpoint rejects bad input with a
   clear 4xx response, and unexpected errors return a consistent JSON error.
10. **Tests.** Unit tests for the plan-building and skill-gap logic; end-to-end
    tests for the endpoints, including the permission rules.
11. **Client.** Screens for every flow in [`overview.md`](overview.md).
12. **Deployment** over HTTPS, with a test login for each role.

### Nice-to-have

Worth doing if the must-haves are finished and tested.

- Filter and search jobs by industry or skill.
- Show a plan's total estimated hours and percentage complete.
- Let a user archive a plan, or regenerate it after their skills change.
- Let a user edit a generated plan: reorder, add or remove learning tasks.
- An admin view of how many users are aiming for each job.

### Stretch

Only if there is time left over.

- Use an LLM to write the learning tasks, in place of the rule-based
  generator that orders skills by their prerequisites.
- Suggest target jobs based on the skills a user already has.
- Attach learning resources (links) to skills.
- Import jobs and skills from the original prototype's data pipeline.

## Order of work

```text
accounts + roles ──> profile ──> skill gap ──> study plans ──> generation tasks ──> real-time
        └──> admin catalog (jobs, skills)              client screens follow each back-end piece
```

Accounts and roles come first because almost every other endpoint needs to
know who is calling. Real-time comes last because it reports on generation
tasks and plan updates, which have to exist first. Deployment is set up early
(after accounts) and updated as features land, so it is not a last-minute risk.

## Who owns what

Everyone still needs to be able to explain all of it. An owner leads the part
and is the one who fixes it when it breaks; the other two review.

| Part | Owner |
| --- | --- |
| Data model, database layer, seed data | B |
| Skill-gap and plan-building logic | B |
| `overview.md`, `data-model.md`, `plan.md` | B |
| Express app, routing, error handling, server configuration | A |
| Authentication, roles and authorization | A |
| REST endpoints for jobs, skills, profile, plans, generation tasks | A |
| `endpoints.md`, `roles.md` | A |
| React client | C |
| Real-time (server events and client handling) | C |
| End-to-end tests, README, deployment, release tags | C |
| `client.md`, `realtime.md`, `topic-map.md` | C |

A, B and C are the three group members; replace the letters with names.

When one part depends on another — an endpoint on a repository function, a
screen on an endpoint — the two owners agree on the shape of the data first,
write it down in `data-model.md` or `endpoints.md`, and only then build.
