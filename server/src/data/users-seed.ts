import { ObjectId } from 'mongodb';
import type { UserDocument } from '../types/user.js';

// Sample accounts for LOCAL DEVELOPMENT only. They are made up, and every one
// of them gets the same throwaway password below. Never seed a deployed
// database with this file as it is.
export const SEED_PASSWORD = 'dev-password-1';

// Fixed ids, so re-running the seed updates these users instead of adding new
// ones, and so plans-seed.ts can refer to them.
export const seedUserIds = {
  admin: new ObjectId('650000000000000000000001'),
  maya: new ObjectId('650000000000000000000002'),
  leo: new ObjectId('650000000000000000000003')
};

// passwordHash is added by the seed script, which hashes SEED_PASSWORD.
export const usersSeed: Omit<UserDocument, 'passwordHash'>[] = [
  {
    _id: seedUserIds.admin,
    email: 'admin@example.com',
    displayName: 'Admin',
    role: 'admin',
    currentRole: 'Site administrator',
    skillIds: [],
    createdAt: new Date('2026-11-01T00:00:00Z')
  },
  {
    // No AI background: works in a traditional industry.
    _id: seedUserIds.maya,
    email: 'maya@example.com',
    displayName: 'Maya',
    role: 'user',
    currentRole: 'Accountant',
    skillIds: [],
    createdAt: new Date('2026-11-02T00:00:00Z')
  },
  {
    // Traditional software background with scattered AI knowledge.
    _id: seedUserIds.leo,
    email: 'leo@example.com',
    displayName: 'Leo',
    role: 'user',
    currentRole: 'Backend Developer',
    skillIds: ['python'],
    createdAt: new Date('2026-11-03T00:00:00Z')
  }
];
