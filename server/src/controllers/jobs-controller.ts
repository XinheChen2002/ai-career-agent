import type { Request, Response } from 'express';
import { getJobs } from '../db/jobs-repository.js';

// GET /jobs -- every job with the skills it requires. Open to everyone.
// No try/catch: Express 5 passes a rejected promise to the error handler.
export async function listJobs(_req: Request, res: Response): Promise<void> {
  const jobs = await getJobs();
  res.json({ jobs });
}
