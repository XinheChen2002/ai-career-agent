# Overview

## One sentence

AI Career Agent helps people who want to move into AI work — but are starting
from zero or from scattered knowledge — see which skills a target job needs,
which of those they are missing, and follow a study plan to close the gap.

## Who uses it

- **Visitors** — anyone who opens the site without logging in. They are
  deciding whether an AI job is realistic for them and want to look around.
- **Users** — people with an account. Two kinds of people we have in mind:
  someone in a traditional industry with no AI background (an accountant, say),
  and someone in traditional software work who has picked up bits of AI but
  has no structure for it (a back-end developer, say).
- **Admins** — the people who run the site and keep its list of jobs and
  skills accurate.

## Why it's useful

Advice on "getting into AI" is everywhere and none of it starts from where
you are. Job postings list skills without saying which ones matter or what
order to learn them in, and course catalogs don't know what you already know.

The app starts from two things the user tells it — the skills they have and
the job they want — and turns the difference into a concrete, ordered list of
things to learn, which they can then tick off over time.

## Key flows

- A *visitor* can browse the jobs and the skills each one requires, so that
  they can see what a role actually involves before signing up.
- A *user* can record their current job and the skills they already have, so
  that the app knows their starting point.
- A *user* can pick a target job and see their skill gap — the skills that job
  needs that they don't have yet — so that they know what to learn.
- A *user* can ask for a study plan toward a target job, so that the gap
  becomes an ordered, week-by-week list of learning tasks.
- A *user* can mark learning tasks as in progress or completed, so that they
  can see how far along they are.
- An *admin* can add, edit and remove jobs and skills, so that the catalog
  stays accurate as the field changes.

## What's live

Two things happen without refreshing the page. Both are sent only to the user
they belong to.

- **Plan ready.** Generating a plan runs in the background. When it finishes
  (or fails), the user who asked for it is told straight away and the new plan
  appears.
- **Progress in sync.** When a user changes a learning task's status, every
  other tab or device where that same user is logged in updates to match.

The details are in [`realtime.md`](realtime.md).

## Where it stands at Checkpoint 1

Running today: the project setup, the database layer with sample data for
jobs, skills, users and plans, and one endpoint, `GET /jobs`, with tests.
Everything else above is planned; [`plan.md`](plan.md) says in what order.

## Not this semester

- **Collecting job data automatically.** The job and skill catalog is sample
  data maintained by admins, not scraped from live job postings.
- **Recommending which job to aim for.** The user picks the target job; the
  app does not rank jobs for them.
- **Hosting learning content.** A learning task says what to learn, not how;
  the app does not include courses, videos or exercises.
- **Social features.** No sharing plans, following other users or comparing
  progress.
- **Salary and location data.** The original dataset has it, but it is not
  part of this app.
