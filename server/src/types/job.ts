// The shape of a job as the API returns it and the client reads it.
// Agreed contract for GET /jobs -- change it only together with docs/data-model.md.

export interface JobSkill {
  /** Stable slug, e.g. "pytorch". */
  id: string;
  name: string;
}

export interface Job {
  /** Stable slug, e.g. "ai-engineer". */
  id: string;
  title: string;
  industry: string;
  description: string;
  skills: JobSkill[];
}

// How a job is stored in the `jobs` collection: the slug is the `_id`,
// so re-running the seed updates a job instead of duplicating it.
export interface JobDocument extends Omit<Job, 'id'> {
  _id: string;
}
