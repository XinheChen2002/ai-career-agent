import { Router } from 'express';
import { listJobs } from '../controllers/jobs-controller.js';

// Mounted at /jobs in app.ts, so '/' here is GET /jobs.
export const jobsRouter = Router();

jobsRouter.get('/', listJobs);
