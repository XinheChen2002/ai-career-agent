# AI Career Agent Project Instructions

## Project Goal
Help people with little or fragmented AI knowledge — including workers in agriculture, healthcare, construction and manufacturing, and people in data, HCI and software engineering — identify skill gaps and build a learning path for a career transition or for applying AI in their existing profession.

This is a career-development product, not a GitHub repository recommendation tool. The product goal is broader than the features currently implemented.

## Project Structure
- `server/`: Express + MongoDB + TypeScript course application; code in `server/src/`.
- `client/`: React + Vite + TypeScript course application; code in `client/src/`.
- `docs/`: course application design and implementation guidance.
- `backend/`, `frontend/`: original FastAPI and React prototype.
- `src/`, `app/`, `tests/`: original Python logic, prototype interfaces and Python tests.
- `src/data/`: original CSV data; course sample data lives in `server/src/data/`.

## Verified Implementation Boundary
- The course app has MongoDB types, collection helpers and seed data for skills, jobs, users and plans.
- Its only HTTP endpoint is public `GET /jobs`; the client already calls it.
- Authentication, role enforcement, profiles, skill-gap calculation, plan generation, plan endpoints and real-time events are planned for the course app, not implemented.
- The Python prototype is separate. Its `reload_pipeline()` helper is not an HTTP reload endpoint; do not infer routes from earlier conversations.
- Read the selected branch's code before claiming a feature exists. Installed dependencies and design documents are not evidence of implemented behavior.

## Development Rules
- Do not modify `.env`, `.venv`, or `uv.lock` unless explicitly asked.
- Default course-app changes to `server/` and `client/`; use the prototype directories when the task explicitly concerns that prototype.
- Keep each backend's API compatible with its own frontend; the two `GET /jobs` responses are different.
- Prefer small, testable changes and explain the file, function and reason for each change.
- Use TypeScript conventions for the course app, including `.js` suffixes on relative imports. A source import of `../config.js` resolves to `config.ts`; do not create a duplicate config file.
- Keep code readable; explain non-obvious logic and avoid unnecessary dependencies.
- Treat planning docs as plans unless confirmed by routes, services and tests.
- Run relevant package scripts from `server/` or `client/`, not the repository root. Follow README setup instructions.

## Current Priorities
Follow `docs/plan.md`: accounts and authorization, catalog management, profiles and skill gaps, study plans and asynchronous generation, then real-time updates and complete UI flows. These remain planned.
Automatic crawling and broader agent orchestration are longer-term work, not current course-app capabilities.

## Coding Guidelines from andrej-karpathy-skills

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.