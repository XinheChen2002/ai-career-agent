import type { ObjectId } from 'mongodb';

export type StudyPlanStatus = 'active' | 'completed' | 'archived';
export type LearningTaskStatus = 'not_started' | 'in_progress' | 'completed';

// One step of a study plan. Learning tasks are embedded in their plan rather
// than stored in a collection of their own: they are always read and updated
// together with the plan they belong to.
export interface LearningTask {
  /** Unique within its plan, e.g. "task-1". */
  id: string;
  title: string;
  /** The skill this task teaches: an `_id` in the `skills` collection. */
  skillId: string;
  /** Which week of the plan the task is scheduled for, starting at 1. */
  week: number;
  status: LearningTaskStatus;
}

// Stored in the `plans` collection. A user can have several plans;
// `userId` is indexed so one user's plans can be listed quickly.
export interface StudyPlanDocument {
  _id: ObjectId;
  /** Owner: an `_id` in the `users` collection. */
  userId: ObjectId;
  /** Target job: an `_id` in the `jobs` collection. */
  jobId: string;
  title: string;
  status: StudyPlanStatus;
  tasks: LearningTask[];
  createdAt: Date;
  updatedAt: Date;
}
