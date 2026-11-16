// Calls to the server's /jobs endpoints. These types mirror
// server/src/types/job.ts -- keep the two in step.

export interface JobSkill {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  industry: string;
  description: string;
  skills: JobSkill[];
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:6790';

/** GET /jobs. Throws if the server can't be reached or answers with an error. */
export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(`${API_URL}/jobs`);
  if (!res.ok) {
    throw new Error(`The server answered ${res.status}`);
  }
  const body: { jobs: Job[] } = await res.json();
  return body.jobs;
}
