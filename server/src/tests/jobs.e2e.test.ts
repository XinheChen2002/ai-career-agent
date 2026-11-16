import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../app.js';
import { closeDb, connectDb } from '../db/db.js';
import { jobsCollection } from '../db/jobs-repository.js';

// End-to-end: a real HTTP request goes through the Express app to a real
// (in-memory) MongoDB. The development database is never touched.
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

test('GET /jobs returns the jobs in the database', async () => {
  await jobsCollection().insertOne({
    _id: 'ai-engineer',
    title: 'AI Engineer',
    industry: 'AI',
    description: 'Builds ML applications.',
    skills: [
      { id: 'python', name: 'Python' },
      { id: 'pytorch', name: 'PyTorch' }
    ]
  });

  const res = await request(app).get('/jobs');

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/json/);
  expect(res.body).toEqual({
    jobs: [
      {
        id: 'ai-engineer',
        title: 'AI Engineer',
        industry: 'AI',
        description: 'Builds ML applications.',
        skills: [
          { id: 'python', name: 'Python' },
          { id: 'pytorch', name: 'PyTorch' }
        ]
      }
    ]
  });
});

test('GET /jobs returns an empty list when there are no jobs', async () => {
  const res = await request(app).get('/jobs');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ jobs: [] });
});

test('an unknown path returns 404 with a JSON error', async () => {
  const res = await request(app).get('/no-such-path');

  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: 'Not found' });
});
