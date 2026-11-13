// Database settings, read from the environment with local-development defaults.
export const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
export const dbName = process.env.DB_NAME ?? 'ai_career_agent';
