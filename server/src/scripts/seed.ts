// Loads the sample data into MongoDB. Run with `npm run seed` from server/.
//
// Safe to run again: every document is written by its stable _id, so a second
// run updates the same documents instead of adding duplicates. Documents that
// are in the database but not in the seed files are left alone.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AnyBulkWriteOperation, Collection, Document } from 'mongodb';

// `npm run seed` doesn't pass --env-file, so read server/.env here if it exists.
// This has to happen before config.js is imported, hence the dynamic imports.
const envFile = join(import.meta.dirname, '../../.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const { default: bcrypt } = await import('bcryptjs');
const { mongoUri, dbName } = await import('../config.js');
const { connectDb, closeDb } = await import('../db/db.js');
const { jobsCollection } = await import('../db/jobs-repository.js');
const { ensureIndexes, plansCollection, skillsCollection, usersCollection } = await import(
  '../db/collections.js'
);
const { skillsSeed } = await import('../data/skills-seed.js');
const { jobsSeed } = await import('../data/jobs-seed.js');
const { usersSeed, SEED_PASSWORD } = await import('../data/users-seed.js');
const { plansSeed } = await import('../data/plans-seed.js');

async function upsertAll<T extends Document & { _id: unknown }>(
  collection: Collection<T>,
  docs: T[]
): Promise<void> {
  const operations = docs.map((doc) => ({
    replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true }
  })) as AnyBulkWriteOperation<T>[];
  await collection.bulkWrite(operations);
  const total = await collection.countDocuments();
  console.log(`${collection.collectionName}: seeded ${docs.length} (${total} in the collection)`);
}

await connectDb(mongoUri, dbName);
try {
  await ensureIndexes();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await upsertAll(skillsCollection(), [...skillsSeed]);
  await upsertAll(jobsCollection(), jobsSeed);
  await upsertAll(usersCollection(), usersSeed.map((user) => ({ ...user, passwordHash })));
  await upsertAll(plansCollection(), plansSeed);

  console.log(`Done. Database: "${dbName}".`);
} finally {
  await closeDb();
}
