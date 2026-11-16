# Data model

The app stores its data in MongoDB, in five collections. Four exist today
(types, sample data and indexes are in the repo); `generation_tasks` is planned.

| Collection | One document is | Status at Checkpoint 1 |
| --- | --- | --- |
| `skills` | one skill a person can learn | types + seed data |
| `jobs` | one job a user can aim for | types + seed data, read by `GET /jobs` |
| `users` | one account | types + seed data; no endpoints yet |
| `plans` | one user's study plan toward one job | types + seed data; no endpoints yet |
| `generation_tasks` | one request to generate a study plan | planned, not in the code |

## How they relate

```text
users ──< plans >── jobs ──< (embedded skill copies) >── skills
  │         │                                              ▲
  │         └── tasks[] (embedded), each task ─────────────┤
  ├── skillIds[] ──────────────────────────────────────────┘
  │                              skills.prerequisiteIds[] ──> skills
  └──< generation_tasks ──> jobs, and ──> plans once it succeeds
```

- A **user** has many **plans**. Each plan belongs to exactly one user and
  targets exactly one **job**.
- A **job** requires many **skills**, and a skill can be required by many jobs.
- A **user** already has some **skills** (`skillIds`). The skill gap for a job
  is the job's skills minus the user's skills.
- A **plan** is a list of **learning tasks**, and each task teaches one skill.
- A **skill** can list other skills as prerequisites.
- A **generation task** belongs to one user, targets one job and, when it
  succeeds, points at the plan it produced.

References are stored as ids. MongoDB does not enforce them, so the code that
writes a reference is responsible for checking the target exists.

## Collections

### `skills`

Type: [`SkillDocument`](../server/src/types/skill.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | string | Stable slug, e.g. `"pytorch"`. Every other collection refers to a skill by this id. |
| `name` | string | Display name, e.g. `"PyTorch"`. |
| `category` | string | Grouping for display and filtering, e.g. `"Deep Learning"`. |
| `difficulty` | `"beginner"` \| `"intermediate"` \| `"advanced"` | |
| `estimatedHours` | number | Rough study time for someone who has the prerequisites. |
| `prerequisiteIds` | string[] | `_id`s of skills to learn first. Used to order a plan. Must not form a loop. |

### `jobs`

Type: [`JobDocument`](../server/src/types/job.ts) (stored), `Job` (returned by the API)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | string | Stable slug, e.g. `"ai-engineer"`. The API returns it as `id`. |
| `title` | string | |
| `industry` | string | e.g. `"AI"`, `"Data"`. |
| `description` | string | One sentence. |
| `skills` | `{ id, name }[]` | The skills the job requires. `id` is a `skills._id`. |

A job **embeds a copy** of each required skill's id and name, instead of
storing only ids. Listing jobs is the most common read in the app and it
always shows skill names, so this avoids a second query. The cost is that
renaming a skill means updating the jobs that embed it; the admin endpoint
that edits a skill will do that. The other skill fields (difficulty, hours,
prerequisites) live only in `skills`.

### `users`

Type: [`UserDocument`](../server/src/types/user.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `email` | string | Login name. **Unique index.** |
| `passwordHash` | string | bcrypt hash. The plain password is never stored and this field is never returned by the API. |
| `displayName` | string | |
| `role` | `"user"` \| `"admin"` | Visitors are people who are not logged in, so they have no document. |
| `currentRole` | string | The job the user has today, as free text, e.g. `"Accountant"`. |
| `skillIds` | string[] | `skills._id`s the user already has. |
| `createdAt` | Date | |

### `plans`

Type: [`StudyPlanDocument`](../server/src/types/study-plan.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | Owner: a `users._id`. **Indexed.** Only the owner may read or change the plan. |
| `jobId` | string | Target job: a `jobs._id`. |
| `title` | string | |
| `status` | `"active"` \| `"completed"` \| `"archived"` | |
| `tasks` | LearningTask[] | Embedded, see below. |
| `createdAt`, `updatedAt` | Date | |

A **learning task** is one step of a plan:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique within its plan, e.g. `"task-1"`. |
| `title` | string | |
| `skillId` | string | The skill it teaches: a `skills._id`. |
| `week` | number | Which week of the plan it is scheduled for, starting at 1. |
| `status` | `"not_started"` \| `"in_progress"` \| `"completed"` | |

Learning tasks are **embedded in their plan**, not stored in their own
collection. A task has no meaning outside its plan, tasks are always loaded
with the plan, and a plan has a few dozen tasks at most. Updating one task's
status is a single update on the plan document.

A user can have **several plans**, for example one per job they are
considering. The target job is stored on the plan, not on the user.

### `generation_tasks` (planned)

Generating a plan takes long enough that the request should not wait for it.
The client asks for a plan, gets a generation task back immediately, and is
told when it finishes (see [`realtime.md`](realtime.md)).

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `userId` | ObjectId | Who asked: a `users._id`. Only that user may read the task. |
| `jobId` | string | The job to plan for: a `jobs._id`. |
| `status` | `"pending"` \| `"processing"` \| `"succeeded"` \| `"failed"` | |
| `planId` | ObjectId \| null | The plan that was created: a `plans._id`. Set when the status becomes `succeeded`. |
| `error` | string \| null | A message for the user. Set when the status becomes `failed`. |
| `createdAt`, `updatedAt` | Date | |

Two words that are easy to mix up: a **generation task** is one background
request to build a plan; a **learning task** is one step inside a plan.

## Sample data

`npm run seed` (in `server/`) loads 58 skills, 25 jobs, 3 users and 2 plans.
It writes each document by its `_id`, so running it again updates the same
documents and adds no duplicates.

Part of the sample data comes from the dataset our original prototype used
(`src/data/future_jobs_dataset.csv`: 9 job titles and 11 skills). The rest —
the other jobs and skills, and every description, difficulty, hour estimate
and prerequisite — we wrote ourselves as illustrative data. The comments at
the top of the files in [`server/src/data/`](../server/src/data/) say which is
which. The sample users are made up and share one development-only password.

## Keeping in sync

As you get deeper into your project, keeping this document in sync will become unneeded overhead. After checkpoint 1, you can turn this into a high level description and provide pointers to your type/model definitions that spell out your model.
