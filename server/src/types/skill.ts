export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Stored in the `skills` collection. The slug is the `_id`, and it is the same
// id that jobs, users and study plans use to refer to a skill.
export interface SkillDocument {
  /** Stable slug, e.g. "pytorch". */
  _id: string;
  name: string;
  /** Broad grouping for display and filtering, e.g. "Deep Learning". */
  category: string;
  difficulty: SkillDifficulty;
  /** Rough study time to reach a working level, for someone who has the prerequisites. */
  estimatedHours: number;
  /** Skills to learn first: `_id`s in this collection. Used to order a study plan. */
  prerequisiteIds: string[];
}
