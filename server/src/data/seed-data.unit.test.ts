import { expect, test } from 'vitest';
import { jobsSeed } from './jobs-seed.js';
import { plansSeed } from './plans-seed.js';
import { skillsSeed } from './skills-seed.js';
import { usersSeed } from './users-seed.js';

// The seed files refer to each other by id. These tests catch a typo in one
// of those ids before it reaches the database.

const skillIds = new Set<string>(skillsSeed.map((s) => s._id));
const jobIds = new Set(jobsSeed.map((j) => j._id));
const userIds = new Set(usersSeed.map((u) => u._id.toHexString()));

function hasNoDuplicates(values: string[]): boolean {
  return new Set(values).size === values.length;
}

test('ids are unique within each collection', () => {
  expect(hasNoDuplicates(skillsSeed.map((s) => s._id))).toBe(true);
  expect(hasNoDuplicates(jobsSeed.map((j) => j._id))).toBe(true);
  expect(hasNoDuplicates(usersSeed.map((u) => u._id.toHexString()))).toBe(true);
  expect(hasNoDuplicates(usersSeed.map((u) => u.email))).toBe(true);
  expect(hasNoDuplicates(plansSeed.map((p) => p._id.toHexString()))).toBe(true);
});

test('every skill a job or user refers to exists', () => {
  for (const job of jobsSeed) {
    for (const skill of job.skills) {
      expect(skillIds, `${job._id} -> ${skill.id}`).toContain(skill.id);
    }
  }
  for (const user of usersSeed) {
    for (const id of user.skillIds) {
      expect(skillIds, `${user.email} -> ${id}`).toContain(id);
    }
  }
});

test('skill prerequisites exist and never loop back', () => {
  const prerequisites = new Map<string, string[]>(
    skillsSeed.map((s) => [s._id, s.prerequisiteIds])
  );

  // True if following prerequisites from `id` ever returns to `start`.
  function leadsBackTo(start: string, id: string, seen = new Set<string>()): boolean {
    for (const next of prerequisites.get(id) ?? []) {
      if (next === start) return true;
      if (!seen.has(next)) {
        seen.add(next);
        if (leadsBackTo(start, next, seen)) return true;
      }
    }
    return false;
  }

  for (const skill of skillsSeed) {
    for (const id of skill.prerequisiteIds) {
      expect(skillIds, `${skill._id} -> ${id}`).toContain(id);
    }
    expect(leadsBackTo(skill._id, skill._id), `${skill._id} is its own prerequisite`).toBe(false);
  }
});

test('every plan refers to an existing user, job and skills', () => {
  for (const plan of plansSeed) {
    expect(userIds, plan.title).toContain(plan.userId.toHexString());
    expect(jobIds, plan.title).toContain(plan.jobId);
    expect(hasNoDuplicates(plan.tasks.map((t) => t.id))).toBe(true);
    for (const task of plan.tasks) {
      expect(skillIds, `${plan.title} -> ${task.skillId}`).toContain(task.skillId);
    }
  }
});
