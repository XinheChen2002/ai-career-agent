import type { Collection } from 'mongodb';
import type { Job, JobDocument } from '../types/job.js';
import { getDb } from './db.js';

export function jobsCollection(): Collection<JobDocument> {
  return getDb().collection<JobDocument>('jobs');
}

/** Every job in the database, sorted by title. Empty array when there are none. */
export async function getJobs(): Promise<Job[]> {
  const docs = await jobsCollection().find().sort({ title: 1 }).toArray();
  return docs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
}
