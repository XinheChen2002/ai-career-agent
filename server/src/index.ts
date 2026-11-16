// Starts the server: connect to MongoDB first, then accept requests.
// Run with `npm run dev` from server/.

import { app } from './app.js';
import { dbName, mongoUri, port } from './config.js';
import { ensureIndexes } from './db/collections.js';
import { connectDb } from './db/db.js';

try {
  await connectDb(mongoUri, dbName);
  await ensureIndexes();
} catch (err) {
  console.error(`Could not connect to MongoDB at ${mongoUri}. Is mongod running?`);
  console.error(err);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port} (database "${dbName}")`);
});
