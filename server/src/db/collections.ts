import type { Collection } from 'mongodb';
import type { SkillDocument } from '../types/skill.js';
import type { StudyPlanDocument } from '../types/study-plan.js';
import type { UserDocument } from '../types/user.js';
import { getDb } from './db.js';

export function skillsCollection(): Collection<SkillDocument> {
  return getDb().collection<SkillDocument>('skills');
}

export function usersCollection(): Collection<UserDocument> {
  return getDb().collection<UserDocument>('users');
}

export function plansCollection(): Collection<StudyPlanDocument> {
  return getDb().collection<StudyPlanDocument>('plans');
}

/** Creates the indexes the app relies on. Safe to call on every start. */
export async function ensureIndexes(): Promise<void> {
  await usersCollection().createIndex({ email: 1 }, { unique: true });
  await plansCollection().createIndex({ userId: 1 });
}
