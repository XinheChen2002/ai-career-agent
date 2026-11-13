import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { closeDb, connectDb } from './db.js';
import { getJobs, jobsCollection } from './jobs-repository.js';

// A throwaway in-memory MongoDB, so the development database is never touched.
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri(), 'test');
});

beforeEach(async () => {
  await jobsCollection().deleteMany({});
});

afterAll(async () => {
  await closeDb();
  await mongod.stop();
});

test('getJobs returns an empty array when there are no jobs', async () => {
  expect(await getJobs()).toEqual([]);
});

test('getJobs returns stored jobs with id instead of _id, sorted by title', async () => {
  await jobsCollection().insertMany([
    {
      _id: 'ml-researcher',
      title: 'ML Researcher',
      industry: 'AI',
      description: 'Designs new methods.',
      skills: [{ id: 'python', name: 'Python' }]
    },
    {
      _id: 'ai-engineer',
      title: 'AI Engineer',
      industry: 'AI',
      description: 'Builds ML applications.',
      skills: [{ id: 'pytorch', name: 'PyTorch' }]
    }
  ]);

  expect(await getJobs()).toEqual([
    {
      id: 'ai-engineer',
      title: 'AI Engineer',
      industry: 'AI',
      description: 'Builds ML applications.',
      skills: [{ id: 'pytorch', name: 'PyTorch' }]
    },
    {
      id: 'ml-researcher',
      title: 'ML Researcher',
      industry: 'AI',
      description: 'Designs new methods.',
      skills: [{ id: 'python', name: 'Python' }]
    }
  ]);
});
