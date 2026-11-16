import type { ErrorRequestHandler, RequestHandler } from 'express';

// Every error response has the same shape: { error: "message" }.

/** For requests that matched no route. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

/**
 * For errors nothing else handled, such as the database being unreachable.
 * The details go to the server log, not to the client.
 * Express recognizes an error handler by its four parameters, so `_next`
 * has to stay even though it is unused.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
