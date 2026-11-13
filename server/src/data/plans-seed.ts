import { ObjectId } from 'mongodb';
import type { StudyPlanDocument } from '../types/study-plan.js';
import { seedUserIds } from './users-seed.js';

// Sample study plans for local development, with fixed ids so re-running the
// seed updates them. Each plan is a short hand-written example: it covers a few
// of the skills its owner is missing for the target job, not all of them.
export const plansSeed: StudyPlanDocument[] = [
  {
    // Maya has none of the AI Engineer skills yet and has just started.
    _id: new ObjectId('660000000000000000000001'),
    userId: seedUserIds.maya,
    jobId: 'ai-engineer',
    title: 'From Accountant to AI Engineer',
    status: 'active',
    tasks: [
      { id: 'task-1', title: 'Learn Python basics', skillId: 'python', week: 1, status: 'completed' },
      { id: 'task-2', title: 'Build a small data script in Python', skillId: 'python', week: 2, status: 'in_progress' },
      { id: 'task-3', title: 'Train a first model with PyTorch', skillId: 'pytorch', week: 4, status: 'not_started' },
      { id: 'task-4', title: 'Rebuild the same model in TensorFlow', skillId: 'tensorflow', week: 6, status: 'not_started' }
    ],
    createdAt: new Date('2026-11-05T00:00:00Z'),
    updatedAt: new Date('2026-11-10T00:00:00Z')
  },
  {
    // Leo already knows Python, so his plan skips it.
    _id: new ObjectId('660000000000000000000002'),
    userId: seedUserIds.leo,
    jobId: 'data-scientist',
    title: 'From Backend Developer to Data Scientist',
    status: 'active',
    tasks: [
      { id: 'task-1', title: 'PyTorch tensors and training loops', skillId: 'pytorch', week: 1, status: 'in_progress' },
      { id: 'task-2', title: 'TensorFlow and Keras fundamentals', skillId: 'tensorflow', week: 3, status: 'not_started' }
    ],
    createdAt: new Date('2026-11-06T00:00:00Z'),
    updatedAt: new Date('2026-11-06T00:00:00Z')
  }
];
