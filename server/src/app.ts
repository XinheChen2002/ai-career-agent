import cors from 'cors';
import express from 'express';
import { clientOrigin } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { jobsRouter } from './routes/jobs-router.js';

// The Express app, without a database connection or a listening port.
// index.ts adds those to run the server; tests import this file directly.
export const app = express();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.use('/jobs', jobsRouter);

// These two go last: they catch whatever the routes above did not handle.
app.use(notFoundHandler);
app.use(errorHandler);
