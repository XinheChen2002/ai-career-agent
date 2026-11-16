import { useEffect, useState } from 'react';
import { fetchJobs, type Job } from './api/jobs.ts';

export function App() {
  // null while the request is in flight.
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="container">
      <h1>AI Career Agent</h1>
      <p>See which skills an AI job needs, and plan how to learn the ones you're missing.</p>

      <h2>Jobs</h2>
      {error ? (
        <p role="alert">Couldn't load the jobs: {error}. Is the server running?</p>
      ) : jobs === null ? (
        <p aria-busy="true">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p>
          No jobs yet. Run <code>npm run seed</code> in <code>server/</code> to load the sample data.
        </p>
      ) : (
        jobs.map((job) => (
          <article key={job.id}>
            <h3>{job.title}</h3>
            <p>
              <small>{job.industry}</small>
            </p>
            <p>{job.description}</p>
            <p>
              <strong>Skills:</strong> {job.skills.map((skill) => skill.name).join(', ')}
            </p>
          </article>
        ))
      )}
    </main>
  );
}
