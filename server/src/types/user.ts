import type { ObjectId } from 'mongodb';

export type UserRole = 'user' | 'admin';

// Stored in the `users` collection. `email` has a unique index.
export interface UserDocument {
  _id: ObjectId;
  email: string;
  /** bcrypt hash. The plain password is never stored. */
  passwordHash: string;
  displayName: string;
  role: UserRole;
  /** The job the user has today, as free text, e.g. "Accountant". */
  currentRole: string;
  /** Skills the user already has: `_id`s in the `skills` collection. */
  skillIds: string[];
  createdAt: Date;
}
