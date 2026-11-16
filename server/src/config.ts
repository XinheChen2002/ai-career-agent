// Settings read from the environment, with local-development defaults.

// Database
export const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
export const dbName = process.env.DB_NAME ?? 'ai_career_agent';

// HTTP server
export const port = Number(process.env.PORT ?? 6790);
// The browser origin allowed to call the API (the Vite dev server locally).
export const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
